/**
 * Trending recompute worker
 *
 * Recalculates trendingScore for every visible anime title based on recent
 * watch events and recommendation signals.
 *
 * Score formula (all signals from the last 7 days):
 *   score = watches * 1.0
 *         + favorites * 3.0
 *         + completions * 2.0
 *         + search_clicks * 0.5
 *         + channel_saves * 2.0
 *         + rating_boost (0-2 from MAL/AniList rating)
 *
 * Scheduled hourly.
 */

import { Worker } from 'bullmq';
import { Prisma } from '@prisma/client';
import { config } from '../../../config';
import { db } from '../../db';
import { logger } from '../../logger';
import { cacheDelPattern } from '../../redis';

const connection = { url: config.REDIS_URL };

const SIGNAL_WEIGHTS: Record<string, number> = {
  WATCHED: 1.0,
  FAVORITED: 3.0,
  COMPLETED: 2.0,
  DROPPED: -0.5,
  SEARCH_CLICK: 0.5,
  CHANNEL_SAVED: 2.0,
  GENRE_PREF: 0.3,
};

const WINDOW_DAYS = 7;

export function createTrendingWorker() {
  const worker = new Worker(
    'trending-recompute',
    async (job) => {
      logger.info({ jobId: job.id }, 'Starting trending recompute');

      const since = new Date();
      since.setDate(since.getDate() - WINDOW_DAYS);

      // Aggregate recommendation signals per anime within the window
      const events = await db.recommendationEvent.groupBy({
        by: ['animeId', 'signal'],
        where: { createdAt: { gte: since } },
        _sum: { weight: true },
        _count: { _all: true },
      });

      // Build a score map: animeId -> score
      const scoreMap = new Map<string, number>();
      for (const event of events) {
        const weight = SIGNAL_WEIGHTS[event.signal] ?? 0;
        const contribution = (event._count._all ?? 0) * weight * (event._sum.weight ?? 1);
        scoreMap.set(event.animeId, (scoreMap.get(event.animeId) ?? 0) + contribution);
      }

      // Also fold in explicit watch history counts
      const watchCounts = await db.watchHistory.groupBy({
        by: ['animeId'],
        where: { watchedAt: { gte: since } },
        _count: { _all: true },
      });

      for (const wc of watchCounts) {
        scoreMap.set(
          wc.animeId,
          (scoreMap.get(wc.animeId) ?? 0) + wc._count._all * SIGNAL_WEIGHTS.WATCHED,
        );
      }

      // Apply rating boost (0–2 pts based on normalised rating)
      const allAnime = await db.animeTitle.findMany({
        where: { isVisible: true },
        select: { id: true, rating: true },
      });

      for (const anime of allAnime) {
        if (anime.rating != null) {
          const boost = (anime.rating / 10) * 2; // 0-2
          scoreMap.set(anime.id, (scoreMap.get(anime.id) ?? 0) + boost);
        }
      }

      // Batch update in chunks of 100 to avoid overwhelming DB
      const entries = [...scoreMap.entries()];
      let updated = 0;

      for (let i = 0; i < entries.length; i += 100) {
        const chunk = entries.slice(i, i + 100);
        await Promise.all(
          chunk.map(([id, score]) =>
            db.animeTitle.updateMany({
              where: { id },
              data: { trendingScore: Math.max(0, score) },
            }),
          ),
        );
        updated += chunk.length;
      }

      // Titles with no recent events get a gentle decay
      const activeIds = [...scoreMap.keys()];
      if (activeIds.length > 0) {
        await db.$executeRaw`
          UPDATE anime_titles
          SET "trendingScore" = GREATEST(0, "trendingScore" * 0.85)
          WHERE id NOT IN (${Prisma.join(activeIds)})
            AND "isVisible" = true
        `;
      }

      // Bust all cached anime and search results
      await cacheDelPattern('anime:*');
      await cacheDelPattern('search:*');
      await cacheDelPattern('suggest:*');

      logger.info({ jobId: job.id, updated }, 'Trending recompute complete');
      return { updated };
    },
    { connection, concurrency: 1 },
  );

  worker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'trending-recompute job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'trending-recompute job failed');
  });

  return worker;
}
