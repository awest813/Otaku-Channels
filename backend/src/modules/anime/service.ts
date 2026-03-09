import { db } from '../../lib/db';
import { cacheGet, cacheSet, cacheDelPattern } from '../../lib/redis';
import { NotFoundError, ConflictError } from '../../lib/errors';
import type { AnimeType, AnimeStatus, AnimeSeason } from '@prisma/client';

export interface AnimeListQuery {
  page?: number;
  limit?: number;
  genre?: string;
  tag?: string;
  type?: AnimeType;
  status?: AnimeStatus;
  season?: AnimeSeason;
  year?: number;
  language?: string;    // sub|dub|both — filtered from sources
  source?: string;      // sourceType filter
  featured?: boolean;
  sort?: 'trending' | 'popular' | 'recent' | 'rating' | 'title';
}

const ANIME_INCLUDE = {
  genres: { include: { genre: true } },
  tags: { include: { tag: true } },
  studios: { include: { studio: true } },
  aliases: true,
  sourceLinksTitleLevel: {
    where: { status: 'ACTIVE' as const },
    select: { id: true, url: true, sourceName: true, sourceType: true, isEmbeddable: true, language: true, region: true },
  },
  _count: { select: { episodes: true, favorites: true } },
} as const;

export async function listAnime(query: AnimeListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: any = { isVisible: true };

  if (query.genre) {
    where.genres = { some: { genre: { slug: query.genre.toLowerCase() } } };
  }
  if (query.tag) {
    where.tags = { some: { tag: { slug: query.tag.toLowerCase() } } };
  }
  if (query.type) where.type = query.type;
  if (query.status) where.status = query.status;
  if (query.season) where.releaseSeason = query.season;
  if (query.year) where.releaseYear = query.year;
  if (query.featured !== undefined) where.isFeatured = query.featured;
  if (query.source) {
    where.sourceLinksTitleLevel = { some: { sourceType: query.source, status: 'ACTIVE' } };
  }

  const orderByMap: Record<string, any> = {
    trending: { trendingScore: 'desc' },
    popular: { popularityRank: 'asc' },
    recent: { createdAt: 'desc' },
    rating: { rating: 'desc' },
    title: { title: 'asc' },
  };
  const orderBy = orderByMap[query.sort ?? 'trending'] ?? { trendingScore: 'desc' };

  const [items, total] = await Promise.all([
    db.animeTitle.findMany({ where, skip, take: limit, orderBy, include: ANIME_INCLUDE }),
    db.animeTitle.count({ where }),
  ]);

  return { data: items.map(formatAnime), total, page, limit };
}

export async function getAnimeBySlug(slug: string) {
  const cacheKey = `anime:slug:${slug}`;
  const cached = await cacheGet<object>(cacheKey);
  if (cached) return cached;

  const anime = await db.animeTitle.findUnique({
    where: { slug },
    include: {
      ...ANIME_INCLUDE,
      episodes: {
        orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
        include: {
          sourceLinks: { where: { status: 'ACTIVE' }, select: { url: true, sourceName: true, sourceType: true, isEmbeddable: true, language: true } },
        },
      },
    },
  });

  if (!anime) throw new NotFoundError('Anime');

  const result = { ...formatAnime(anime), episodes: anime.episodes };
  await cacheSet(cacheKey, result, 300);
  return result;
}

export async function getAnimeById(id: string) {
  const anime = await db.animeTitle.findUnique({
    where: { id },
    include: ANIME_INCLUDE,
  });
  if (!anime) throw new NotFoundError('Anime');
  return formatAnime(anime);
}

export async function createAnime(data: {
  title: string;
  slug?: string;
  titleEnglish?: string;
  titleJapanese?: string;
  synopsis?: string;
  type?: AnimeType;
  status?: AnimeStatus;
  releaseYear?: number;
  releaseSeason?: AnimeSeason;
  episodeCount?: number;
  episodeDuration?: number;
  malId?: number;
  anilistId?: number;
  posterUrl?: string;
  backdropUrl?: string;
  rating?: number;
  isAdultContent?: boolean;
  genres?: string[];   // genre slugs
  tags?: string[];     // tag slugs
  studios?: string[];  // studio slugs
  aliases?: { alias: string; language?: string }[];
}) {
  const slug = data.slug ?? slugify(data.titleEnglish ?? data.title);

  const existing = await db.animeTitle.findUnique({ where: { slug } });
  if (existing) throw new ConflictError(`Anime with slug "${slug}" already exists`);

  const anime = await db.animeTitle.create({
    data: {
      ...data,
      slug,
      genres: data.genres
        ? {
            create: await resolveGenres(data.genres),
          }
        : undefined,
      tags: data.tags
        ? { create: await resolveTags(data.tags) }
        : undefined,
      studios: data.studios
        ? { create: await resolveStudios(data.studios) }
        : undefined,
      aliases: data.aliases ? { create: data.aliases } : undefined,
    },
    include: ANIME_INCLUDE,
  });

  await cacheDelPattern('anime:*');
  return formatAnime(anime);
}

export async function updateAnime(id: string, data: Partial<ReturnType<typeof createAnime>>) {
  const anime = await db.animeTitle.update({
    where: { id },
    data: data as any,
    include: ANIME_INCLUDE,
  });
  await cacheDelPattern('anime:*');
  return formatAnime(anime);
}

export async function getRelatedAnime(animeId: string, limit = 6) {
  const anime = await db.animeTitle.findUnique({
    where: { id: animeId },
    include: { genres: true },
  });
  if (!anime) throw new NotFoundError('Anime');

  const genreIds = anime.genres.map((g) => g.genreId);

  const related = await db.animeTitle.findMany({
    where: {
      id: { not: animeId },
      isVisible: true,
      genres: { some: { genreId: { in: genreIds } } },
    },
    take: limit,
    orderBy: { trendingScore: 'desc' },
    include: ANIME_INCLUDE,
  });

  return related.map(formatAnime);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatAnime(raw: any) {
  return {
    ...raw,
    genres: raw.genres?.map((g: any) => g.genre) ?? [],
    tags: raw.tags?.map((t: any) => t.tag) ?? [],
    studios: raw.studios?.map((s: any) => s.studio) ?? [],
    episodeCount: raw._count?.episodes ?? raw.episodeCount,
    favoriteCount: raw._count?.favorites ?? undefined,
  };
}

async function resolveGenres(slugs: string[]) {
  return Promise.all(
    slugs.map(async (slug) => {
      const genre = await db.genre.upsert({
        where: { slug: slug.toLowerCase() },
        create: { slug: slug.toLowerCase(), name: capitalize(slug) },
        update: {},
      });
      return { genreId: genre.id };
    }),
  );
}

async function resolveTags(slugs: string[]) {
  return Promise.all(
    slugs.map(async (slug) => {
      const tag = await db.tag.upsert({
        where: { slug: slug.toLowerCase() },
        create: { slug: slug.toLowerCase(), name: capitalize(slug) },
        update: {},
      });
      return { tagId: tag.id };
    }),
  );
}

async function resolveStudios(slugs: string[]) {
  return Promise.all(
    slugs.map(async (slug) => {
      const studio = await db.studio.upsert({
        where: { slug: slug.toLowerCase() },
        create: { slug: slug.toLowerCase(), name: capitalize(slug) },
        update: {},
      });
      return { studioId: studio.id };
    }),
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
