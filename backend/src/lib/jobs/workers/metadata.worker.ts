/**
 * Metadata refresh worker
 *
 * Syncs anime metadata from Jikan (MAL) and AniList for titles that either:
 *   a) have a malId/anilistId set and haven't been synced in >24 h, or
 *   b) were explicitly enqueued by an admin action.
 *
 * Job payload variants:
 *   {} — bulk scan of stale titles (scheduled nightly)
 *   { animeId: string } — single title refresh (on-demand)
 *   { malId: number }  — import new title by MAL ID
 */

import { Worker, type Job } from 'bullmq';
import { config } from '../../../config';
import { db } from '../../db';
import { logger } from '../../logger';
import { cacheDelPattern } from '../../redis';
import * as Jikan from '../../jikan/client';
import * as AniList from '../../anilist/client';
import * as Kitsu from '../../kitsu/client';

const connection = { url: config.REDIS_URL };

// How old metadata has to be before we re-sync (24 hours)
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export interface MetadataJobData {
  animeId?: string;
  malId?: number;
}

/** Sync a single anime title from Jikan + AniList. */
async function syncTitle(animeId: string): Promise<void> {
  const anime = await db.animeTitle.findUnique({
    where: { id: animeId },
    select: {
      id: true,
      malId: true,
      anilistId: true,
      title: true,
      updatedAt: true,
    },
  });

  if (!anime) {
    logger.warn({ animeId }, 'Anime not found for metadata sync');
    return;
  }

  // Skip if synced recently
  const ageMs = Date.now() - anime.updatedAt.getTime();
  if (ageMs < STALE_THRESHOLD_MS) {
    logger.debug({ animeId }, 'Anime metadata is fresh, skipping');
    return;
  }

  const updates: Record<string, unknown> = {};

  // ── Jikan (MAL) ──────────────────────────────────────────────────────────────
  let jikanData: Jikan.JikanAnime | null = null;
  if (anime.malId) {
    jikanData = await Jikan.getAnimeById(anime.malId);
  }

  if (jikanData) {
    updates.title = jikanData.title ?? anime.title;
    updates.titleEnglish = jikanData.title_english ?? undefined;
    updates.titleJapanese = jikanData.title_japanese ?? undefined;
    updates.synopsis = jikanData.synopsis ?? undefined;
    updates.type = Jikan.mapJikanType(jikanData.type) as any;
    updates.status = Jikan.mapJikanStatus(jikanData.status) as any;
    updates.episodeCount = jikanData.episodes ?? undefined;
    updates.episodeDuration =
      Jikan.parseDurationMinutes(jikanData.duration) ?? undefined;
    updates.rating = jikanData.score ?? undefined;
    updates.popularityRank = jikanData.popularity ?? undefined;
    updates.releaseYear = jikanData.year ?? undefined;
    updates.releaseSeason = (Jikan.mapJikanSeason(jikanData.season) ??
      undefined) as any;
    updates.isAdultContent = Jikan.isAdult(jikanData.rating);
    updates.posterUrl =
      jikanData.images?.webp?.large_image_url ??
      jikanData.images?.jpg?.large_image_url ??
      undefined;
  }

  // ── AniList ───────────────────────────────────────────────────────────────────
  let alData: AniList.AniListMedia | null = null;
  if (anime.anilistId) {
    alData = await AniList.getMediaById(anime.anilistId);
  } else if (anime.malId) {
    alData = await AniList.getMediaByMalId(anime.malId);
  }

  if (alData) {
    // AniList score is 0-100; normalise to 0-10
    if (alData.averageScore != null) {
      updates.rating = alData.averageScore / 10;
    }
    updates.anilistId = alData.id;
    // Prefer AniList banner as backdrop
    if (alData.bannerImage) updates.backdropUrl = alData.bannerImage;
    // AniList has better release data sometimes
    if (!updates.releaseYear && alData.seasonYear)
      updates.releaseYear = alData.seasonYear;
    if (!updates.releaseSeason && alData.season) {
      updates.releaseSeason = (AniList.mapAniListSeason(alData.season) ??
        undefined) as any;
    }
    if (!updates.synopsis && alData.description) {
      updates.synopsis = AniList.stripHtml(alData.description) ?? undefined;
    }
    // Merge genres from AniList
    if (alData.genres.length > 0) {
      await upsertGenres(anime.id, alData.genres);
    }
    // Merge tags from AniList (only high-quality ones)
    const tagNames = alData.tags
      .filter((t) => !['Spoiler', 'Sexual Content'].includes(t.category))
      .slice(0, 20)
      .map((t) => t.name);
    if (tagNames.length > 0) {
      await upsertTags(anime.id, tagNames);
    }
    // Studios
    const studioNames = alData.studios.nodes.map((s) => s.name);
    if (studioNames.length > 0) {
      await upsertStudios(anime.id, studioNames);
    }
    // Synonyms / aliases
    if (alData.synonyms.length > 0) {
      await upsertAliases(anime.id, alData.synonyms);
    }
  }

  // ── Kitsu (supplementary metadata & streaming links) ─────────────────────────
  // Search by title as a fallback when Jikan/AniList data is sparse.
  if (!updates.synopsis || !updates.posterUrl) {
    const title = updates.title ?? anime.title;
    const kitsuResults = await Kitsu.searchAnime(String(title), 1);
    const kitsuData = kitsuResults[0] ?? null;

    if (kitsuData) {
      if (!updates.synopsis && kitsuData.attributes.synopsis) {
        updates.synopsis = kitsuData.attributes.synopsis;
      }
      if (!updates.posterUrl && kitsuData.attributes.posterImage?.large) {
        updates.posterUrl = kitsuData.attributes.posterImage.large;
      }
      if (!updates.backdropUrl && kitsuData.attributes.coverImage?.large) {
        updates.backdropUrl = kitsuData.attributes.coverImage.large;
      }
      if (!updates.releaseYear && kitsuData.attributes.startDate) {
        const year = new Date(kitsuData.attributes.startDate).getFullYear();
        if (!isNaN(year)) updates.releaseYear = year;
      }
      if (!updates.rating) {
        const kitsuRating = Kitsu.parseKitsuRating(
          kitsuData.attributes.averageRating
        );
        if (kitsuRating != null) updates.rating = kitsuRating;
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.animeTitle.update({ where: { id: animeId }, data: updates });
    await cacheDelPattern(`anime:slug:*`);
    logger.info({ animeId, fields: Object.keys(updates) }, 'Metadata synced');
  }
}

/** Import a brand-new anime by MAL ID. */
async function importByMalId(malId: number): Promise<void> {
  const jikan = await Jikan.getAnimeById(malId);
  if (!jikan) {
    logger.warn({ malId }, 'Could not fetch Jikan data for import');
    return;
  }

  const existing = await db.animeTitle.findUnique({ where: { malId } });
  if (existing) {
    logger.info(
      { malId, id: existing.id },
      'Anime already exists, syncing instead'
    );
    return syncTitle(existing.id);
  }

  const slug = slugify(jikan.title_english ?? jikan.title);

  // Check slug uniqueness
  let finalSlug = slug;
  const slugConflict = await db.animeTitle.findUnique({ where: { slug } });
  if (slugConflict) finalSlug = `${slug}-${malId}`;

  const alData = await AniList.getMediaByMalId(malId);

  const rating =
    alData?.averageScore != null
      ? alData.averageScore / 10
      : jikan.score ?? undefined;

  const anime = await db.animeTitle.create({
    data: {
      slug: finalSlug,
      title: jikan.title,
      titleEnglish: jikan.title_english ?? undefined,
      titleJapanese: jikan.title_japanese ?? undefined,
      synopsis:
        AniList.stripHtml(alData?.description ?? null) ??
        jikan.synopsis ??
        undefined,
      type: Jikan.mapJikanType(jikan.type) as any,
      status: Jikan.mapJikanStatus(jikan.status) as any,
      releaseYear: jikan.year ?? alData?.seasonYear ?? undefined,
      releaseSeason: (Jikan.mapJikanSeason(jikan.season) ?? undefined) as any,
      episodeCount: jikan.episodes ?? alData?.episodes ?? undefined,
      episodeDuration:
        Jikan.parseDurationMinutes(jikan.duration) ??
        alData?.duration ??
        undefined,
      malId,
      anilistId: alData?.id ?? undefined,
      rating,
      popularityRank: jikan.popularity ?? undefined,
      isAdultContent: Jikan.isAdult(jikan.rating) || (alData?.isAdult ?? false),
      posterUrl:
        jikan.images?.webp?.large_image_url ??
        jikan.images?.jpg?.large_image_url ??
        alData?.coverImage?.extraLarge ??
        undefined,
      backdropUrl: alData?.bannerImage ?? undefined,
    },
    select: { id: true },
  });

  // Genres, tags, studios, aliases
  const genres = alData?.genres ?? jikan.genres.map((g) => g.name);
  if (genres.length > 0) await upsertGenres(anime.id, genres);

  const tagNames = (alData?.tags ?? jikan.themes.map((t) => ({ name: t.name })))
    .slice(0, 20)
    .map((t: any) => (typeof t === 'string' ? t : t.name));
  if (tagNames.length > 0) await upsertTags(anime.id, tagNames);

  const studioNames =
    alData?.studios.nodes.map((s) => s.name) ??
    jikan.studios.map((s) => s.name);
  if (studioNames.length > 0) await upsertStudios(anime.id, studioNames);

  const synonyms = [...jikan.title_synonyms, ...(alData?.synonyms ?? [])];
  if (synonyms.length > 0) await upsertAliases(anime.id, synonyms);

  logger.info(
    { malId, id: anime.id, slug: finalSlug },
    'Anime imported from MAL'
  );
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

async function upsertGenres(animeId: string, names: string[]) {
  for (const name of names) {
    const slug = slugify(name);
    const genre = await db.genre.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
    });
    await db.animeTitleGenre.upsert({
      where: { animeId_genreId: { animeId, genreId: genre.id } },
      create: { animeId, genreId: genre.id },
      update: {},
    });
  }
}

async function upsertTags(animeId: string, names: string[]) {
  for (const name of names) {
    const slug = slugify(name);
    const tag = await db.tag.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
    });
    await db.animeTitleTag.upsert({
      where: { animeId_tagId: { animeId, tagId: tag.id } },
      create: { animeId, tagId: tag.id },
      update: {},
    });
  }
}

async function upsertStudios(animeId: string, names: string[]) {
  for (const name of names) {
    const slug = slugify(name);
    const studio = await db.studio.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
    });
    await db.animeTitleStudio.upsert({
      where: { animeId_studioId: { animeId, studioId: studio.id } },
      create: { animeId, studioId: studio.id },
      update: {},
    });
  }
}

async function upsertAliases(animeId: string, aliases: string[]) {
  for (const alias of aliases) {
    if (!alias.trim()) continue;
    await db.animeAlias.upsert({
      where: { animeId_alias: { animeId, alias } },
      create: { animeId, alias },
      update: {},
    });
  }
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export function createMetadataWorker() {
  const worker = new Worker<MetadataJobData>(
    'metadata-refresh',
    async (job: Job<MetadataJobData>) => {
      const { animeId, malId } = job.data;

      // Single on-demand import by MAL ID
      if (malId != null) {
        await importByMalId(malId);
        return { malId };
      }

      // Single on-demand sync by internal ID
      if (animeId) {
        await syncTitle(animeId);
        return { animeId };
      }

      // Bulk scan: find titles with a malId that haven't been updated in >24h
      const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS);
      const staleTitles = await db.animeTitle.findMany({
        where: {
          malId: { not: null },
          updatedAt: { lt: staleThreshold },
        },
        select: { id: true },
        take: 50, // process 50 per job run to stay within rate limits
        orderBy: { updatedAt: 'asc' },
      });

      logger.info({ count: staleTitles.length }, 'Bulk metadata sync starting');
      for (const title of staleTitles) {
        await syncTitle(title.id);
      }

      return { synced: staleTitles.length };
    },
    {
      connection,
      concurrency: 1, // serial to respect API rate limits
      limiter: { max: 1, duration: 1000 }, // 1 job/sec max
    }
  );

  worker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'metadata-refresh job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'metadata-refresh job failed');
  });

  return worker;
}
