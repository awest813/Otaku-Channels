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

const SuggestSchema = z.object({ q: z.string().min(1).max(100) });

/** Convert a user query string into a prefix tsquery, e.g. "attack on" → "attack:* & on:*" */
function toTsQuery(q: string): string {
  return q
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => `${t}:*`)
    .join(' & ');
}

export async function searchRoutes(app: FastifyInstance) {
  // GET /api/v1/search?q=...
  app.get('/', async (request, reply) => {
    try {
      const parsed = SearchQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Invalid query',
          },
        });
      }

      const { q, page, limit, genre, type, year, season, source, sort } = parsed.data;
      const skip = (page - 1) * limit;

      const cacheKey = `search:${JSON.stringify(parsed.data)}`;
      const cached = await cacheGet<object>(cacheKey);
      if (cached) return reply.send(cached);

      const tsQuery = toTsQuery(q);
      const ilike = `%${q}%`;

      // Step 1: full-text + trigram search via raw SQL to get ranked IDs
      const ftsRows = await db.$queryRaw<{ id: string; rank: number }[]>`
        SELECT id,
               ts_rank(search_vector, to_tsquery('english', ${tsQuery})) AS rank
        FROM   anime_titles
        WHERE  "isVisible" = true
          AND (
            search_vector @@ to_tsquery('english', ${tsQuery})
            OR title          ILIKE ${ilike}
            OR "titleEnglish" ILIKE ${ilike}
          )
        ORDER BY rank DESC
        LIMIT 200
      `;

      const rankedIds = ftsRows.map((r) => r.id);

      if (rankedIds.length === 0) {
        return reply.send({ data: [], total: 0, page, limit, query: q });
      }

      // Step 2: apply additional Prisma filters on the candidate set
      const whereWithIds: any = { isVisible: true, id: { in: rankedIds } };
      if (genre) whereWithIds.genres = { some: { genre: { slug: genre.toLowerCase() } } };
      if (type) whereWithIds.type = type;
      if (year) whereWithIds.releaseYear = year;
      if (season) whereWithIds.releaseSeason = season;
      if (source) {
        whereWithIds.sourceLinksTitleLevel = { some: { sourceType: source, status: 'ACTIVE' } };
      }

      const orderByMap: Record<string, any> = {
        trending: { trendingScore: 'desc' },
        rating: { rating: 'desc' },
        recent: { createdAt: 'desc' },
      };
      // For relevance we re-sort in JS after; use trendingScore as DB tiebreaker
      const orderBy = orderByMap[sort] ?? { trendingScore: 'desc' };

      const [items, total] = await Promise.all([
        db.animeTitle.findMany({
          where: whereWithIds,
          skip,
          take: limit,
          orderBy,
          include: {
            genres: { include: { genre: true } },
            tags: { include: { tag: true } },
            aliases: true,
            sourceLinksTitleLevel: {
              where: { status: 'ACTIVE' },
              select: {
                sourceName: true,
                sourceType: true,
                isEmbeddable: true,
                language: true,
              },
            },
            _count: { select: { episodes: true } },
          },
        }),
        db.animeTitle.count({ where: whereWithIds }),
      ]);

      // Re-sort by FTS rank when sort=relevance
      let sorted = items;
      if (sort === 'relevance') {
        const rankMap = new Map(ftsRows.map((r) => [r.id, r.rank]));
        sorted = [...items].sort((a, b) => (rankMap.get(b.id) ?? 0) - (rankMap.get(a.id) ?? 0));
      }

      const result = {
        data: sorted.map((a) => ({
          ...a,
          genres: a.genres.map((g) => g.genre),
          tags: a.tags.map((t) => t.tag),
          episodeCount: a._count.episodes,
        })),
        total,
        page,
        limit,
        query: q,
      };

      if (total > 0) await cacheSet(cacheKey, result, 60);
      return reply.send(result);
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/search/suggest?q=... — autocomplete suggestions
  app.get('/suggest', async (request, reply) => {
    try {
      const { q } = SuggestSchema.parse(request.query);
      const cacheKey = `suggest:${q.toLowerCase()}`;
      const cached = await cacheGet<unknown[]>(cacheKey);
      if (cached) return reply.send({ data: cached });

      const tsQuery = toTsQuery(q);
      const ilike = `%${q}%`;

      const rows = await db.$queryRaw<
        { slug: string; title: string; titleEnglish: string | null; posterUrl: string | null }[]
      >`
        SELECT slug, title, "titleEnglish", "posterUrl"
        FROM   anime_titles
        WHERE  "isVisible" = true
          AND (
            search_vector @@ to_tsquery('english', ${tsQuery})
            OR title          ILIKE ${ilike}
            OR "titleEnglish" ILIKE ${ilike}
          )
        ORDER BY
          ts_rank(search_vector, to_tsquery('english', ${tsQuery})) DESC,
          "trendingScore" DESC
        LIMIT 10
      `;

      const data = rows.map((r) => ({
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
