/**
 * Kitsu API client (public REST API with JSON:API format)
 * Free, no auth required.
 * Docs: https://kitsu.docs.apiary.io/
 *
 * Normalization logic has been moved to src/lib/ingestion/normalize.ts.
 * The converter functions below are thin wrappers kept for backward compat.
 */

import { normalizeKitsuAnime } from '@/lib/ingestion/normalize';

import type { AnimeSeries, KitsuAnimeResource, Movie } from '@/types';

const KITSU_BASE = 'https://kitsu.io/api/edge';

/** Minimal fetch wrapper with timeout and JSON:API headers. */
async function kitsuFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${KITSU_BASE}${path}`, {
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    next: { revalidate: 300 }, // cache 5 min
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`Kitsu API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Search anime by title. Returns up to `limit` results. */
export async function searchKitsu(
  q: string,
  limit = 20
): Promise<{
  data: KitsuAnimeResource[];
  meta: { count: number };
}> {
  return kitsuFetch(
    `/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=${limit}`
  );
}

/** Fetch a single anime by Kitsu ID. */
export async function getKitsuAnime(
  kitsuId: string
): Promise<{ data: KitsuAnimeResource }> {
  return kitsuFetch(`/anime/${kitsuId}`);
}

/**
 * Convert a raw KitsuAnimeResource to our AnimeSeries type.
 * Delegates to the centralized ingestion pipeline.
 */
export function kitsuToSeries(anime: KitsuAnimeResource): AnimeSeries {
  return normalizeKitsuAnime(anime) as AnimeSeries;
}

/**
 * Convert a raw KitsuAnimeResource to our Movie type.
 * Delegates to the centralized ingestion pipeline.
 */
export function kitsuToMovie(anime: KitsuAnimeResource): Movie {
  return normalizeKitsuAnime(anime) as Movie;
}
