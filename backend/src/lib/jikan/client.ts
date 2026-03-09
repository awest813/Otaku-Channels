/**
 * Jikan API v4 client
 *
 * Jikan is an unofficial MyAnimeList REST API. It's free with generous rate
 * limits (~60 req/min on the public instance).
 *
 * Docs: https://docs.api.jikan.moe/
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.JIKAN_BASE_URL;

// Jikan requires a small delay between requests on the public instance
const DELAY_MS = 350;

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function jikanFetch<T>(path: string): Promise<T | null> {
  const url = `${BASE}${path}`;
  try {
    await sleep(DELAY_MS);
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 429) {
      logger.warn({ url }, 'Jikan rate limited — backing off 2s');
      await sleep(2000);
      return jikanFetch<T>(path); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Jikan non-OK response');
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (err) {
    logger.error({ url, err }, 'Jikan fetch error');
    return null;
  }
}

// ─── Type definitions (subset of Jikan v4 response) ──────────────────────────

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  synopsis: string | null;
  type: string | null;        // "TV" | "Movie" | "OVA" | "ONA" | "Special" | "Music"
  status: string | null;      // "Finished Airing" | "Currently Airing" | "Not yet aired"
  episodes: number | null;
  duration: string | null;    // e.g. "24 min per ep"
  score: number | null;
  popularity: number | null;
  year: number | null;
  season: string | null;      // "winter" | "spring" | "summer" | "fall"
  genres: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  themes: { mal_id: number; name: string }[];
  images: {
    jpg: { image_url: string | null; large_image_url: string | null };
    webp: { image_url: string | null; large_image_url: string | null };
  };
  title_synonyms: string[];
  rating: string | null;      // "G - All Ages" | "PG-13 - Teens" | etc.
}

export interface JikanEpisode {
  mal_id: number;
  title: string | null;
  title_japanese: string | null;
  aired: string | null;       // ISO date string
  score: number | null;
  filler: boolean;
  recap: boolean;
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Fetch anime detail by MAL ID. */
export async function getAnimeById(malId: number): Promise<JikanAnime | null> {
  return jikanFetch<JikanAnime>(`/anime/${malId}`);
}

/** Fetch episodes for a given MAL ID (Jikan pages at 100 per request). */
export async function getAnimeEpisodes(malId: number, page = 1): Promise<JikanEpisode[]> {
  const result = await jikanFetch<JikanEpisode[]>(`/anime/${malId}/episodes?page=${page}`);
  return result ?? [];
}

/** Search Jikan by title string. */
export async function searchAnime(query: string, limit = 5): Promise<JikanAnime[]> {
  const encoded = encodeURIComponent(query);
  const result = await jikanFetch<JikanAnime[]>(
    `/anime?q=${encoded}&limit=${limit}&sfw=true`,
  );
  return result ?? [];
}

/** Parse Jikan `duration` string (e.g. "24 min per ep") → minutes. */
export function parseDurationMinutes(duration: string | null): number | null {
  if (!duration) return null;
  const match = duration.match(/(\d+)\s*min/i);
  return match ? parseInt(match[1], 10) : null;
}

/** Map Jikan status string → Prisma AnimeStatus enum value. */
export function mapJikanStatus(status: string | null): string {
  switch (status) {
    case 'Currently Airing': return 'ONGOING';
    case 'Finished Airing': return 'COMPLETED';
    case 'Not yet aired': return 'UPCOMING';
    default: return 'COMPLETED';
  }
}

/** Map Jikan type string → Prisma AnimeType enum value. */
export function mapJikanType(type: string | null): string {
  switch (type?.toUpperCase()) {
    case 'TV': return 'TV';
    case 'MOVIE': return 'MOVIE';
    case 'OVA': return 'OVA';
    case 'ONA': return 'ONA';
    case 'SPECIAL': return 'SPECIAL';
    case 'MUSIC': return 'MUSIC';
    default: return 'TV';
  }
}

/** Map Jikan season string → Prisma AnimeSeason enum value. */
export function mapJikanSeason(season: string | null): string | null {
  switch (season?.toUpperCase()) {
    case 'WINTER': return 'WINTER';
    case 'SPRING': return 'SPRING';
    case 'SUMMER': return 'SUMMER';
    case 'FALL': return 'FALL';
    default: return null;
  }
}

/** Returns true if the Jikan rating string implies adult content. */
export function isAdult(rating: string | null): boolean {
  return rating?.includes('Rx') ?? false;
}
