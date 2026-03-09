import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/http/auth-middleware';
import { sendError } from '../../lib/errors';
import { db } from '../../lib/db';
import { cacheGet, cacheSet } from '../../lib/redis';

export async function recommendationsRoutes(app: FastifyInstance) {
  // GET /api/v1/recommendations/for-you
  // Simple signal-weighted approach: surface anime related to genres/titles the
  // user has interacted with most. No ML — just aggregated event weights.
  app.get('/for-you', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const userId = request.user.sub;
      const cacheKey = `recs:for-you:${userId}`;
      const cached = await cacheGet<object[]>(cacheKey);
      if (cached) return reply.send({ data: cached });

      // 1. Get anime the user has signaled interest in
      const events = await db.recommendationEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      const animeWeights: Record<string, number> = {};
      for (const ev of events) {
        animeWeights[ev.animeId] = (animeWeights[ev.animeId] ?? 0) + ev.weight;
      }

      const topAnimeIds = Object.entries(animeWeights)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      if (topAnimeIds.length === 0) {
        // Cold start: return trending
        const trending = await db.animeTitle.findMany({
          where: { isVisible: true },
          orderBy: { trendingScore: 'desc' },
          take: 20,
          select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, type: true, releaseYear: true, rating: true },
        });
        return reply.send({ data: trending, source: 'trending_fallback' });
      }

      // 2. Find genres from top anime
      const topAnime = await db.animeTitle.findMany({
        where: { id: { in: topAnimeIds } },
        include: { genres: true },
      });
      const genreIds = [...new Set(topAnime.flatMap((a) => a.genres.map((g) => g.genreId)))];

      // 3. Return anime in those genres, excluding already-watched
      const watchedIds = [...new Set(events.map((e) => e.animeId))];

      const recommendations = await db.animeTitle.findMany({
        where: {
          isVisible: true,
          id: { notIn: watchedIds },
          genres: { some: { genreId: { in: genreIds } } },
        },
        orderBy: { trendingScore: 'desc' },
        take: 20,
        select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, type: true, releaseYear: true, rating: true },
      });

      await cacheSet(cacheKey, recommendations, 300);
      return reply.send({ data: recommendations, source: 'genre_affinity' });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/recommendations/similar/:animeId
  app.get('/similar/:animeId', async (request, reply) => {
    try {
      const { animeId } = request.params as { animeId: string };
      const cacheKey = `recs:similar:${animeId}`;
      const cached = await cacheGet<object[]>(cacheKey);
      if (cached) return reply.send({ data: cached });

      const anime = await db.animeTitle.findUnique({
        where: { id: animeId },
        include: { genres: true, tags: true },
      });
      if (!anime) return reply.send({ data: [] });

      const genreIds = anime.genres.map((g) => g.genreId);
      const tagIds = anime.tags.map((t) => t.tagId);

      const similar = await db.animeTitle.findMany({
        where: {
          id: { not: animeId },
          isVisible: true,
          OR: [
            { genres: { some: { genreId: { in: genreIds } } } },
            { tags: { some: { tagId: { in: tagIds } } } },
          ],
        },
        orderBy: { trendingScore: 'desc' },
        take: 12,
        select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, type: true, releaseYear: true, rating: true },
      });

      await cacheSet(cacheKey, similar, 600);
      return reply.send({ data: similar });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/recommendations/trending
  app.get('/trending', async (_request, reply) => {
    try {
      const cacheKey = 'recs:trending';
      const cached = await cacheGet<object[]>(cacheKey);
      if (cached) return reply.send({ data: cached });

      const trending = await db.animeTitle.findMany({
        where: { isVisible: true },
        orderBy: { trendingScore: 'desc' },
        take: 20,
        select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, type: true, releaseYear: true, rating: true, releaseSeason: true },
      });

      await cacheSet(cacheKey, trending, 300);
      return reply.send({ data: trending });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/recommendations/because-you-watched/:animeId
  app.get('/because-you-watched/:animeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { animeId } = request.params as { animeId: string };
      // Reuse similar logic
      const similar = await db.animeTitle.findUnique({
        where: { id: animeId },
        include: { genres: true },
      });
      if (!similar) return reply.send({ data: [], basedOn: null });

      const genreIds = similar.genres.map((g) => g.genreId);
      const results = await db.animeTitle.findMany({
        where: { id: { not: animeId }, isVisible: true, genres: { some: { genreId: { in: genreIds } } } },
        orderBy: { trendingScore: 'desc' },
        take: 10,
        select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, type: true },
      });

      return reply.send({
        data: results,
        basedOn: { id: similar.id, title: similar.titleEnglish ?? similar.title },
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
