/**
 * Jikan v4 API client (unofficial MyAnimeList API)
 * Free, no auth, rate-limited to ~3 req/s.
 * Docs: https://docs.api.jikan.moe
 *
 * Normalization logic has been moved to src/lib/ingestion/normalize.ts.
 * The converter functions below are thin wrappers kept for backward compat.
 */

import type { AnimeSeries, JikanAnime, Movie } from '@/types';
import { normalizeJikanAnime } from '@/lib/ingestion/normalize';

const JIKAN_BASE = 'https://api.jikan.moe/v4';

/** Minimal fetch wrapper with timeout and cache-busting. */
async function jikanFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${JIKAN_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 }, // cache 5 min
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`Jikan API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Search anime by title. Returns up to 25 results per page. */
export async function searchJikan(
  q: string,
  page = 1
): Promise<{
  data: JikanAnime[];
  pagination: { last_visible_page: number; has_next_page: boolean };
}> {
  return jikanFetch(
    `/anime?q=${encodeURIComponent(q)}&page=${page}&limit=20&sfw=true`
  );
}

/** Fetch a single anime by MAL ID. */
export async function getJikanAnime(
  malId: number | string
): Promise<{ data: JikanAnime }> {
  return jikanFetch(`/anime/${malId}/full`);
}

/** Fetch episodes list for an anime (up to 100 per page). */
export async function getJikanEpisodes(
  malId: number | string,
  page = 1
): Promise<{
  data: Array<{
    mal_id: number;
    title: string;
    title_romanji: string | null;
    aired: string | null;
    score: number | null;
    filler: boolean;
    recap: boolean;
  }>;
  pagination: { last_visible_page: number; has_next_page: boolean };
}> {
  return jikanFetch(`/anime/${malId}/episodes?page=${page}`);
}

/**
 * Convert a raw JikanAnime to our AnimeSeries type.
 * Delegates to the centralized ingestion pipeline.
 */
export function jikanToSeries(anime: JikanAnime): AnimeSeries {
  return normalizeJikanAnime(anime) as AnimeSeries;
}

/**
 * Convert a raw JikanAnime to our Movie type (when type === 'Movie').
 * Delegates to the centralized ingestion pipeline.
 */
export function jikanToMovie(anime: JikanAnime): Movie {
  return normalizeJikanAnime(anime) as Movie;
}
