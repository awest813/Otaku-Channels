/**
 * Centralized ingestion pipeline for Otaku Channels.
 *
 * All provider-specific transforms (Jikan → Anime, Kitsu → Anime,
 * Shikimori → Anime, backend record → Anime) live here.  The individual
 * provider clients (src/lib/jikan.ts etc.) call these functions and return
 * the canonical Anime type to callers.
 *
 * Design goals
 * ────────────
 * • Single source of truth for field mapping logic.
 * • Every returned Anime carries a populated `sourceLinks` array so the UI
 *   can always render full provenance without extra fetches.
 * • Flat legacy fields (sourceName, sourceType, isEmbeddable, watchUrl) are
 *   derived from sourceLinks[0] so backward-compat code keeps working.
 */

import type {
  Anime,
  AnimeSeries,
  AvailabilityStatus,
  EmbedType,
  JikanAnime,
  KitsuAnimeResource,
  LanguageOption,
  Movie,
  ShikimoriAnime,
  SourceLink,
  SourceType,
} from '@/types';

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Derive the EmbedType for a given SourceType. */
export function deriveEmbedType(sourceType: SourceType): EmbedType {
  if (sourceType === 'youtube') return 'youtube';
  if (sourceType === 'consumet') return 'hls';
  if (
    sourceType === 'retro' ||
    sourceType === 'live' ||
    sourceType === 'freestream'
  )
    return 'iframe';
  return 'external';
}

/** Return true for officially licensed streaming services. */
export function isOfficialSource(sourceType: SourceType): boolean {
  return (
    sourceType === 'crunchyroll' ||
    sourceType === 'tubi' ||
    sourceType === 'pluto' ||
    sourceType === 'retrocrush' ||
    sourceType === 'youtube'
  );
}

/** Strip HTML tags and BBCode markers from Shikimori / backend descriptions. */
export function stripHtml(html: string | null): string {
  if (!html) return 'No description available.';
  return (
    html
      .replace(/<[^>]+>/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || 'No description available.'
  );
}

/** Build a minimal SourceLink from flat fields.  Used when full provenance is
 *  unavailable (e.g. metadata-only sources like Jikan/Kitsu/Shikimori). */
function makeSourceLink(
  providerId: string,
  providerUrl: string,
  sourceName: string,
  sourceType: SourceType,
  language: LanguageOption = 'sub',
  region = 'global',
  availabilityStatus: AvailabilityStatus = 'unknown',
  lastVerifiedAt: string | null = null
): SourceLink {
  return {
    providerId,
    providerUrl,
    sourceName,
    sourceType,
    embedType: deriveEmbedType(sourceType),
    region,
    isOfficial: isOfficialSource(sourceType),
    isEmbeddable: sourceType === 'youtube',
    language,
    availabilityStatus,
    lastVerifiedAt,
  };
}

// ─── Jikan ────────────────────────────────────────────────────────────────────

const JIKAN_STREAMER_MAP: Record<string, SourceType> = {
  crunchyroll: 'crunchyroll',
  tubi: 'tubi',
  funimation: 'crunchyroll', // Funimation merged into Crunchyroll
};

/** Derive the primary source from Jikan streaming links. */
function deriveJikanPrimarySource(anime: JikanAnime): {
  sourceType: SourceType;
  sourceName: string;
  watchUrl: string;
} {
  const streaming = anime.streaming ?? [];

  const cr = streaming.find((s) => s.name === 'Crunchyroll');
  if (cr)
    return {
      sourceType: 'crunchyroll',
      sourceName: 'Crunchyroll',
      watchUrl: cr.url,
    };

  const tubi = streaming.find((s) => s.name.toLowerCase().includes('tubi'));
  if (tubi)
    return { sourceType: 'tubi', sourceName: 'Tubi', watchUrl: tubi.url };

  const funi = streaming.find((s) =>
    s.name.toLowerCase().includes('funimation')
  );
  if (funi)
    return {
      sourceType: 'crunchyroll',
      sourceName: 'Funimation',
      watchUrl: funi.url,
    };

  return {
    sourceType: 'jikan',
    sourceName: 'MyAnimeList',
    watchUrl: anime.url,
  };
}

/** Build a SourceLink[] from all Jikan streaming entries + MAL page fallback. */
function buildJikanSourceLinks(anime: JikanAnime): SourceLink[] {
  const links: SourceLink[] = [];

  for (const s of anime.streaming ?? []) {
    const name = s.name.toLowerCase();
    let st: SourceType = 'jikan';
    for (const [key, type] of Object.entries(JIKAN_STREAMER_MAP)) {
      if (name.includes(key)) {
        st = type;
        break;
      }
    }
    links.push(
      makeSourceLink(
        `${st}-${anime.mal_id}`,
        s.url,
        s.name,
        st,
        'sub',
        'global',
        'unknown'
      )
    );
  }

  // Always include the MAL page as a provenance fallback
  links.push(
    makeSourceLink(
      `mal-${anime.mal_id}`,
      anime.url,
      'MyAnimeList',
      'jikan',
      'sub',
      'global',
      'unknown'
    )
  );

  return links;
}

/** Strip YouTube autoplay parameter from Jikan trailer embed URLs. */
function cleanJikanTrailerUrl(embedUrl: string | null): string | undefined {
  if (!embedUrl) return undefined;
  return embedUrl.replace('?autoplay=1', '').replace('&autoplay=1', '');
}

/**
 * Normalize a raw JikanAnime to the canonical Anime contract.
 *
 * The `type` field is determined from `anime.type === 'Movie'`; all other
 * Jikan types (TV, OVA, ONA, Special, Music) map to 'series'.
 */
export function normalizeJikanAnime(raw: JikanAnime): Anime {
  const isMovie = raw.type === 'Movie';
  const primary = deriveJikanPrimarySource(raw);
  const sourceLinks = buildJikanSourceLinks(raw);

  const genres = [
    ...(raw.genres ?? []).map((g) => g.name),
    ...(raw.themes ?? []).map((t) => t.name),
  ].slice(0, 5);

  const thumbnail =
    raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || '';
  const trailerEmbedUrl = cleanJikanTrailerUrl(raw.trailer?.embed_url ?? null);

  const base: Anime = {
    id: `jikan-${raw.mal_id}`,
    slug: `jikan-${raw.mal_id}`,
    title: raw.title_english || raw.title,
    description: raw.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: thumbnail,
    type: isMovie ? 'movie' : 'series',
    genres,
    language: 'sub',
    sourceName: primary.sourceName,
    sourceType: primary.sourceType,
    isEmbeddable: !!trailerEmbedUrl,
    watchUrl: primary.watchUrl,
    releaseYear: raw.year ?? 0,
    tags: isMovie ? ['Movie'] : [],
    trailerEmbedUrl,
    streamingLinks: raw.streaming ?? [],
    malId: raw.mal_id,
    sourceLinks,
  };

  if (!isMovie) {
    return { ...base, episodeCount: raw.episodes ?? 0 } as AnimeSeries;
  }
  return base as Movie;
}

// ─── Kitsu ────────────────────────────────────────────────────────────────────

function getKitsuThumbnail(attrs: KitsuAnimeResource['attributes']): string {
  return (
    attrs.posterImage?.large ||
    attrs.posterImage?.medium ||
    attrs.posterImage?.original ||
    ''
  );
}

function getKitsuHeroImage(
  attrs: KitsuAnimeResource['attributes'],
  thumbnail: string
): string {
  return attrs.coverImage?.large || attrs.coverImage?.original || thumbnail;
}

function parseKitsuYear(startDate: string | null): number {
  if (!startDate) return 0;
  const year = parseInt(startDate.slice(0, 4), 10);
  return isNaN(year) ? 0 : year;
}

/**
 * Normalize a raw KitsuAnimeResource to the canonical Anime contract.
 *
 * Kitsu's `subtype` field drives the type discrimination:
 * `"movie"` → 'movie', everything else → 'series'.
 */
export function normalizeKitsuAnime(raw: KitsuAnimeResource): Anime {
  const attrs = raw.attributes;
  const isMovie = attrs.subtype?.toLowerCase() === 'movie';
  const kitsuUrl = `https://kitsu.io/anime/${attrs.slug}`;
  const thumbnail = getKitsuThumbnail(attrs);

  const sourceLinks: SourceLink[] = [
    makeSourceLink(
      `kitsu-${raw.id}`,
      kitsuUrl,
      'Kitsu',
      'kitsu',
      'sub',
      'global',
      'unknown'
    ),
  ];

  const base: Anime = {
    id: `kitsu-${raw.id}`,
    slug: `kitsu-${raw.id}`,
    title: attrs.titles.en || attrs.canonicalTitle,
    description: attrs.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: getKitsuHeroImage(attrs, thumbnail),
    type: isMovie ? 'movie' : 'series',
    genres: [],
    language: 'sub',
    sourceName: 'Kitsu',
    sourceType: 'kitsu',
    isEmbeddable: false,
    watchUrl: kitsuUrl,
    releaseYear: parseKitsuYear(attrs.startDate),
    tags: isMovie ? ['Movie'] : [],
    sourceLinks,
  };

  if (!isMovie) {
    return { ...base, episodeCount: attrs.episodeCount ?? 0 } as AnimeSeries;
  }
  return base as Movie;
}

// ─── Shikimori ────────────────────────────────────────────────────────────────

function getShikimoriThumbnail(anime: ShikimoriAnime): string {
  return anime.poster?.originalUrl || anime.poster?.mainUrl || '';
}

function getShikimoriYear(anime: ShikimoriAnime): number {
  return anime.airedOn?.year ?? 0;
}

/**
 * Normalize a raw ShikimoriAnime to the canonical Anime contract.
 *
 * Shikimori's `kind` field drives type discrimination:
 * `"movie"` → 'movie', everything else → 'series'.
 */
export function normalizeShikimoriAnime(raw: ShikimoriAnime): Anime {
  const isMovie = raw.kind?.toLowerCase() === 'movie';
  const shikimoriUrl = `https://shikimori.one/animes/${raw.id}`;
  const thumbnail = getShikimoriThumbnail(raw);

  const sourceLinks: SourceLink[] = [
    makeSourceLink(
      `shikimori-${raw.id}`,
      shikimoriUrl,
      'Shikimori',
      'shikimori',
      'sub',
      'global',
      'unknown'
    ),
  ];

  const base: Anime = {
    id: `shikimori-${raw.id}`,
    slug: `shikimori-${raw.id}`,
    title: raw.english || raw.name,
    description: stripHtml(raw.description),
    thumbnail,
    heroImage: thumbnail,
    type: isMovie ? 'movie' : 'series',
    genres: (raw.genres ?? []).map((g) => g.name),
    language: 'sub',
    sourceName: 'Shikimori',
    sourceType: 'shikimori',
    isEmbeddable: false,
    watchUrl: shikimoriUrl,
    releaseYear: getShikimoriYear(raw),
    tags: isMovie ? ['Movie'] : [],
    malId: raw.malId ?? undefined,
    sourceLinks,
  };

  if (!isMovie) {
    return { ...base, episodeCount: raw.episodes ?? 0 } as AnimeSeries;
  }
  return base as Movie;
}

// ─── Backend / Prisma record ──────────────────────────────────────────────────

type RawSourceLink = {
  url: string;
  sourceName: string;
  sourceType: string;
  isEmbeddable: boolean;
  language: string;
  region?: string | null;
  isOfficial?: boolean;
  embedType?: string;
  availabilityStatus?: string;
  lastVerifiedAt?: string | null;
};

type RawGenreOrTag = { name: string } | string;

/**
 * Build a SourceLink from a backend ContentSource / EpisodeSourceLink record.
 * Backend records may already carry rich provenance fields; this function
 * applies sensible defaults for any missing fields.
 */
function buildBackendSourceLink(
  raw: RawSourceLink,
  animeId: string
): SourceLink {
  const sourceType = (raw.sourceType || 'youtube') as SourceType;
  return {
    providerId: `${sourceType}-${animeId}`,
    providerUrl: raw.url,
    sourceName: raw.sourceName || '',
    sourceType,
    embedType: (raw.embedType as EmbedType) ?? deriveEmbedType(sourceType),
    region: raw.region ?? 'global',
    isOfficial: raw.isOfficial ?? isOfficialSource(sourceType),
    isEmbeddable: raw.isEmbeddable ?? false,
    language: (raw.language || 'sub') as LanguageOption,
    availabilityStatus:
      (raw.availabilityStatus as AvailabilityStatus) ?? 'unknown',
    lastVerifiedAt: raw.lastVerifiedAt ?? null,
  };
}

/**
 * Normalize a raw backend AnimeTitle record (after Fastify's formatAnime
 * helper) to the canonical Anime contract.
 *
 * Field mapping:
 *   synopsis            → description
 *   posterUrl           → thumbnail
 *   backdropUrl         → heroImage
 *   titleEnglish        → title (preferred over titleRomanji)
 *   sourceLinksTitleLevel → sourceLinks[] with full provenance
 *   sourceLinksTitleLevel[0] → flat legacy source fields
 *   genres[].name       → genres (string array)
 *   tags[].name         → tags (string array)
 */
export function normalizeBackendAnime(
  raw: Record<string, unknown>
): AnimeSeries | Movie {
  const rawLinks = (raw.sourceLinksTitleLevel as RawSourceLink[]) ?? [];
  const animeId = String(raw.id ?? '');

  const sourceLinks: SourceLink[] = rawLinks.map((l) =>
    buildBackendSourceLink(l, animeId)
  );

  // Derive flat legacy fields from the first source link
  const primaryLink = sourceLinks[0];
  const firstRaw = rawLinks[0];

  const genreNames = ((raw.genres as RawGenreOrTag[]) ?? []).map((g) =>
    typeof g === 'string' ? g : g.name
  );
  const tagNames = ((raw.tags as RawGenreOrTag[]) ?? []).map((t) =>
    typeof t === 'string' ? t : t.name
  );

  const isMovie = raw.type === 'MOVIE';

  const base: Anime = {
    id: animeId,
    slug: raw.slug as string,
    title: ((raw.titleEnglish ?? raw.title) as string) || '',
    description: (raw.synopsis ??
      raw.description ??
      'No description available.') as string,
    thumbnail: (raw.posterUrl ?? raw.thumbnail ?? '') as string,
    heroImage: (raw.backdropUrl ??
      raw.heroImage ??
      raw.posterUrl ??
      '') as string,
    type: isMovie ? 'movie' : 'series',
    genres: genreNames,
    language: (primaryLink?.language ||
      (firstRaw?.language as LanguageOption) ||
      (raw.language as LanguageOption) ||
      'sub') as LanguageOption,
    sourceName:
      primaryLink?.sourceName ||
      (firstRaw?.sourceName as string) ||
      (raw.sourceName as string) ||
      '',
    sourceType: (primaryLink?.sourceType ||
      (firstRaw?.sourceType as SourceType) ||
      (raw.sourceType as SourceType) ||
      'youtube') as SourceType,
    isEmbeddable:
      primaryLink?.isEmbeddable ??
      (firstRaw?.isEmbeddable as boolean) ??
      (raw.isEmbeddable as boolean) ??
      false,
    watchUrl:
      primaryLink?.providerUrl ||
      (firstRaw?.url as string) ||
      (raw.watchUrl as string) ||
      '',
    releaseYear: (raw.releaseYear as number) ?? 0,
    tags: tagNames,
    sourceLinks,
  };

  if (isMovie) {
    return base as Movie;
  }

  const rawEpisodes = (raw.episodes as Record<string, unknown>[]) ?? [];

  return {
    ...base,
    type: 'series',
    episodeCount: (raw.episodeCount as number) ?? rawEpisodes.length ?? 0,
  } as AnimeSeries;
}
