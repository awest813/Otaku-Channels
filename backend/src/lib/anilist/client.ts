/**
 * AniList GraphQL client
 *
 * AniList exposes a single GraphQL endpoint. No API key required for public
 * data — rate limit is 90 requests/minute.
 *
 * Docs: https://anilist.gitbook.io/anilist-apiv2-docs/
 */

import { config } from '../../config';
import { logger } from '../logger';

const ENDPOINT = config.ANILIST_BASE_URL;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 429) {
      logger.warn('AniList rate limited');
      await new Promise((r) => setTimeout(r, 5000));
      return gql<T>(query, variables); // one retry
    }

    if (!res.ok) {
      logger.warn({ status: res.status }, 'AniList non-OK response');
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      logger.warn({ errors: json.errors }, 'AniList GraphQL errors');
      return null;
    }
    return json.data as T;
  } catch (err) {
    logger.error({ err }, 'AniList fetch error');
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  format: string | null;       // "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC"
  status: string | null;       // "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS"
  episodes: number | null;
  duration: number | null;     // minutes
  averageScore: number | null; // 0-100
  popularity: number | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  season: string | null;       // "WINTER" | "SPRING" | "SUMMER" | "FALL"
  seasonYear: number | null;
  isAdult: boolean;
  genres: string[];
  tags: { name: string; category: string }[];
  studios: { nodes: { name: string }[] };
  coverImage: { large: string | null; extraLarge: string | null };
  bannerImage: string | null;
  synonyms: string[];
}

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  description(asHtml: false)
  format
  status
  episodes
  duration
  averageScore
  popularity
  startDate { year month day }
  season
  seasonYear
  isAdult
  genres
  tags(sort: RANK_DESC) { name category }
  studios(isMain: true) { nodes { name } }
  coverImage { large extraLarge }
  bannerImage
  synonyms
`;

// ─── API methods ──────────────────────────────────────────────────────────────

/** Fetch media by AniList ID. */
export async function getMediaById(anilistId: number): Promise<AniListMedia | null> {
  const data = await gql<{ Media: AniListMedia }>(
    `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`,
    { id: anilistId },
  );
  return data?.Media ?? null;
}

/** Fetch media by MAL ID. */
export async function getMediaByMalId(malId: number): Promise<AniListMedia | null> {
  const data = await gql<{ Media: AniListMedia }>(
    `query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { ${MEDIA_FIELDS} } }`,
    { idMal: malId },
  );
  return data?.Media ?? null;
}

/** Search AniList by title. */
export async function searchMedia(query: string, perPage = 5): Promise<AniListMedia[]> {
  const data = await gql<{ Page: { media: AniListMedia[] } }>(
    `query ($q: String, $pp: Int) {
       Page(perPage: $pp) { media(search: $q, type: ANIME) { ${MEDIA_FIELDS} } }
     }`,
    { q: query, pp: perPage },
  );
  return data?.Page.media ?? [];
}

/** Map AniList status → Prisma AnimeStatus. */
export function mapAniListStatus(status: string | null): string {
  switch (status) {
    case 'RELEASING': return 'ONGOING';
    case 'FINISHED': return 'COMPLETED';
    case 'NOT_YET_RELEASED': return 'UPCOMING';
    case 'CANCELLED': return 'CANCELLED';
    case 'HIATUS': return 'HIATUS';
    default: return 'COMPLETED';
  }
}

/** Map AniList format → Prisma AnimeType. */
export function mapAniListFormat(format: string | null): string {
  switch (format) {
    case 'TV':
    case 'TV_SHORT': return 'TV';
    case 'MOVIE': return 'MOVIE';
    case 'OVA': return 'OVA';
    case 'ONA': return 'ONA';
    case 'SPECIAL': return 'SPECIAL';
    case 'MUSIC': return 'MUSIC';
    default: return 'TV';
  }
}

/** Map AniList season → Prisma AnimeSeason. */
export function mapAniListSeason(season: string | null): string | null {
  switch (season) {
    case 'WINTER': return 'WINTER';
    case 'SPRING': return 'SPRING';
    case 'SUMMER': return 'SUMMER';
    case 'FALL': return 'FALL';
    default: return null;
  }
}

/** Strip HTML tags from AniList synopsis (description can contain <br> etc). */
export function stripHtml(html: string | null): string | null {
  if (!html) return null;
  return html.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
}
