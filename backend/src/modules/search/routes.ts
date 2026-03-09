import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendError } from '../../lib/errors';
import { db } from '../../lib/db';
import { cacheGet, cacheSet } from '../../lib/redis';

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  genre: z.string().optional(),
  type: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC']).optional(),
  year: z.coerce.number().optional(),
  season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional(),
  source: z.string().optional(),
  language: z.string().optional(),
  sort: z.enum(['relevance', 'trending', 'rating', 'recent']).default('relevance'),
});

export async function searchRoutes(app: FastifyInstance) {
  // GET /api/v1/search?q=...
  app.get('/', async (request, reply) => {
    try {
      const parsed = SearchQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid query' },
        });
      }

      const { q, page, limit, genre, type, year, season, source, language, sort } = parsed.data;
      const skip = (page - 1) * limit;

      // Cache common (short) searches
      const cacheKey = `search:${JSON.stringify(parsed.data)}`;
      const cached = await cacheGet<object>(cacheKey);
      if (cached) return reply.send(cached);

      const normalised = q.trim().toLowerCase();

      // Build Prisma where clause
      // We search: title, titleEnglish, titleJapanese, aliases
      const titleConditions = [
        { title: { contains: normalised, mode: 'insensitive' as const } },
        { titleEnglish: { contains: normalised, mode: 'insensitive' as const } },
        { titleJapanese: { contains: normalised, mode: 'insensitive' as const } },
        { aliases: { some: { alias: { contains: normalised, mode: 'insensitive' as const } } } },
      ];

      const where: any = {
        isVisible: true,
        OR: titleConditions,
      };

      if (genre) {
        where.genres = { some: { genre: { slug: genre.toLowerCase() } } };
      }
      if (type) where.type = type;
      if (year) where.releaseYear = year;
      if (season) where.releaseSeason = season;
      if (source) {
        where.sourceLinksTitleLevel = { some: { sourceType: source, status: 'ACTIVE' } };
      }

      const orderByMap: Record<string, any> = {
        relevance: { trendingScore: 'desc' },
        trending: { trendingScore: 'desc' },
        rating: { rating: 'desc' },
        recent: { createdAt: 'desc' },
      };

      const [items, total] = await Promise.all([
        db.animeTitle.findMany({
          where,
          skip,
          take: limit,
          orderBy: orderByMap[sort] ?? { trendingScore: 'desc' },
          include: {
            genres: { include: { genre: true } },
            tags: { include: { tag: true } },
            sourceLinksTitleLevel: {
              where: { status: 'ACTIVE' },
              select: { sourceName: true, sourceType: true, isEmbeddable: true, language: true },
            },
            _count: { select: { episodes: true } },
          },
        }),
        db.animeTitle.count({ where }),
      ]);

      const result = {
        data: items.map((a) => ({
          ...a,
          genres: a.genres.map((g) => g.genre),
          tags: a.tags.map((t) => t.tag),
        })),
        total,
        page,
        limit,
        query: q,
      };

      // Cache for 60s (short because search results can be stale quickly)
      if (total > 0) await cacheSet(cacheKey, result, 60);

      return reply.send(result);
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/search/suggest?q=... — quick title suggestions (autocomplete)
  app.get('/suggest', async (request, reply) => {
    try {
      const { q } = z.object({ q: z.string().min(1).max(100) }).parse(request.query);
      const cacheKey = `suggest:${q.toLowerCase()}`;
      const cached = await cacheGet<string[]>(cacheKey);
      if (cached) return reply.send({ data: cached });

      const results = await db.animeTitle.findMany({
        where: {
          isVisible: true,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { titleEnglish: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: { slug: true, title: true, titleEnglish: true, posterUrl: true },
        orderBy: { trendingScore: 'desc' },
      });

      const data = results.map((r) => ({
        slug: r.slug,
        title: r.titleEnglish ?? r.title,
        posterUrl: r.posterUrl,
      }));

      await cacheSet(cacheKey, data, 120);
      return reply.send({ data });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
