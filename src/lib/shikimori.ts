/**
 * Shikimori GraphQL API client
 * Free, no auth required for public read queries.
 * Docs: https://shikimori.one/api/doc/graphql
 *
 * Normalization logic has been moved to src/lib/ingestion/normalize.ts.
 * The converter functions below are thin wrappers kept for backward compat.
 */

import { normalizeShikimoriAnime } from '@/lib/ingestion/normalize';

import type { AnimeSeries, Movie, ShikimoriAnime } from '@/types';

const SHIKIMORI_ENDPOINT = 'https://shikimori.one/api/graphql';

const ANIME_FIELDS = `
  id
  malId
  name
  english
  japanese
  kind
  score
  status
  episodes
  airedOn { year date }
  description
  poster { originalUrl mainUrl }
  genres { name russian }
`;

/** Execute a GraphQL query against Shikimori. */
async function shikimoriGql<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(SHIKIMORI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // cache 5 min
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error(`Shikimori API error ${res.status}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(
      `Shikimori GraphQL error: ${json.errors[0]?.message ?? 'Unknown'}`
    );
  }
  return json.data as T;
}

/** Search anime by title. Returns up to `limit` results. */
export async function searchShikimori(
  q: string,
  limit = 20
): Promise<ShikimoriAnime[]> {
  const data = await shikimoriGql<{ animes: ShikimoriAnime[] }>(
    `query ($search: String, $limit: Int) {
       animes(search: $search, limit: $limit, censored: true) { ${ANIME_FIELDS} }
     }`,
    { search: q, limit }
  );
  return data.animes ?? [];
}

/** Fetch a single anime by Shikimori ID. */
export async function getShikimoriAnime(
  id: string
): Promise<ShikimoriAnime | null> {
  const data = await shikimoriGql<{ animes: ShikimoriAnime[] }>(
    `query ($ids: String) {
       animes(ids: $ids, limit: 1) { ${ANIME_FIELDS} }
     }`,
    { ids: id }
  );
  return data.animes?.[0] ?? null;
}

/**
 * Convert a raw ShikimoriAnime to our AnimeSeries type.
 * Delegates to the centralized ingestion pipeline.
 */
export function shikimoriToSeries(anime: ShikimoriAnime): AnimeSeries {
  return normalizeShikimoriAnime(anime) as AnimeSeries;
}

/**
 * Convert a raw ShikimoriAnime to our Movie type.
 * Delegates to the centralized ingestion pipeline.
 */
export function shikimoriToMovie(anime: ShikimoriAnime): Movie {
  return normalizeShikimoriAnime(anime) as Movie;
}
