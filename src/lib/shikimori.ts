/**
 * Shikimori GraphQL API client
 * Free, no auth required for public read queries.
 * Docs: https://shikimori.one/api/doc/graphql
 */

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

/** Strip HTML tags from Shikimori descriptions. */
function stripHtml(html: string | null): string {
  if (!html) return 'No description available.';
  return (
    html
      .replace(/<[^>]+>/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim() || 'No description available.'
  );
}

/** Extract thumbnail image URL from Shikimori poster. */
function getShikimoriThumbnail(anime: ShikimoriAnime): string {
  return anime.poster?.originalUrl || anime.poster?.mainUrl || '';
}

/** Parse release year from Shikimori airedOn. */
function getShikimoriYear(anime: ShikimoriAnime): number {
  return anime.airedOn?.year ?? 0;
}

/** Convert a raw ShikimoriAnime to our AnimeSeries type. */
export function shikimoriToSeries(anime: ShikimoriAnime): AnimeSeries {
  const thumbnail = getShikimoriThumbnail(anime);

  return {
    id: `shikimori-${anime.id}`,
    slug: `shikimori-${anime.id}`,
    title: anime.english || anime.name,
    description: stripHtml(anime.description),
    thumbnail,
    heroImage: thumbnail,
    type: 'series',
    genres: (anime.genres ?? []).map((g) => g.name),
    language: 'sub',
    sourceName: 'Shikimori',
    sourceType: 'shikimori',
    isEmbeddable: false,
    watchUrl: `https://shikimori.one/animes/${anime.id}`,
    releaseYear: getShikimoriYear(anime),
    episodeCount: anime.episodes ?? 0,
    tags: [],
    malId: anime.malId ?? undefined,
  };
}

/** Convert a raw ShikimoriAnime to our Movie type. */
export function shikimoriToMovie(anime: ShikimoriAnime): Movie {
  const thumbnail = getShikimoriThumbnail(anime);

  return {
    id: `shikimori-${anime.id}`,
    slug: `shikimori-${anime.id}`,
    title: anime.english || anime.name,
    description: stripHtml(anime.description),
    thumbnail,
    heroImage: thumbnail,
    type: 'movie',
    genres: (anime.genres ?? []).map((g) => g.name),
    language: 'sub',
    sourceName: 'Shikimori',
    sourceType: 'shikimori',
    isEmbeddable: false,
    watchUrl: `https://shikimori.one/animes/${anime.id}`,
    releaseYear: getShikimoriYear(anime),
    tags: ['Movie'],
    malId: anime.malId ?? undefined,
  };
}
