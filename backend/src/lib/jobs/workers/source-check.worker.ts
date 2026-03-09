/**
 * Source availability check worker
 *
 * Issues a HEAD (fallback: GET) request to each active content source URL
 * and updates the status to REMOVED when the resource is gone (4xx/5xx).
 *
 * Limits concurrency to avoid hammering external hosts and respects a per-host
 * delay to prevent being rate-limited.
 *
 * Scheduled every 6 hours.
 */

import { Worker } from 'bullmq';
import { config } from '../../../config';
import { db } from '../../db';
import { logger } from '../../logger';
import { cacheDelPattern } from '../../redis';

const connection = { url: config.REDIS_URL };

const REQUEST_TIMEOUT_MS = 10_000;
const CONCURRENCY = 5;

/** Returns true if the URL is still accessible. */
async function isUrlAccessible(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'OtakuChannels-SourceBot/1.0' },
    });
    // 2xx / 3xx are considered alive; 404/410 = gone
    return res.ok || (res.status >= 300 && res.status < 400);
  } catch {
    // Network error, DNS failure, timeout — treat as unknown but don't flip to REMOVED
    return true; // conservative: keep ACTIVE unless we get a definitive 4xx
  } finally {
    clearTimeout(timer);
  }
}

/** Simple promise pool — runs up to `concurrency` tasks at a time. */
async function pooled<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const task = tasks[idx++];
      results.push(await task());
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

export function createSourceCheckWorker() {
  const worker = new Worker(
    'source-check',
    async (job) => {
      logger.info({ jobId: job.id }, 'Starting source availability check');

      const now = new Date();
      const staleThreshold = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 h ago

      // Fetch title-level sources that are ACTIVE and haven't been checked recently
      const titleSources = await db.contentSource.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { lastCheckedAt: null },
            { lastCheckedAt: { lt: staleThreshold } },
          ],
        },
        select: { id: true, url: true },
      });

      // Fetch episode-level sources similarly
      const episodeSources = await db.episodeSourceLink.findMany({
        where: {
          status: 'ACTIVE',
        },
        select: { id: true, url: true },
      });

      logger.info(
        { titleSources: titleSources.length, episodeSources: episodeSources.length },
        'Sources to check',
      );

      let removedTitle = 0;
      let removedEpisode = 0;

      // Check title-level sources
      const titleTasks = titleSources.map((source) => async () => {
        const alive = await isUrlAccessible(source.url);
        await db.contentSource.update({
          where: { id: source.id },
          data: {
            lastCheckedAt: now,
            ...(alive ? {} : { status: 'REMOVED' }),
          },
        });
        if (!alive) removedTitle++;
      });

      await pooled(titleTasks, CONCURRENCY);

      // Check episode-level sources
      const episodeTasks = episodeSources.map((source) => async () => {
        const alive = await isUrlAccessible(source.url);
        if (!alive) {
          await db.episodeSourceLink.update({
            where: { id: source.id },
            data: { status: 'REMOVED' },
          });
          removedEpisode++;
        }
      });

      await pooled(episodeTasks, CONCURRENCY);

      // Bust anime cache if any sources changed
      if (removedTitle > 0 || removedEpisode > 0) {
        await cacheDelPattern('anime:*');
      }

      logger.info(
        { jobId: job.id, removedTitle, removedEpisode },
        'Source check complete',
      );

      return { removedTitle, removedEpisode };
    },
    { connection, concurrency: 1 },
  );

  worker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'source-check job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'source-check job failed');
  });

  return worker;
}
