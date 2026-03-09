/**
 * Kitsu API client (public REST API with JSON:API format)
 * Free, no auth required.
 * Docs: https://kitsu.docs.apiary.io/
 */

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

/** Extract thumbnail image URL from Kitsu poster images. */
function getKitsuThumbnail(attrs: KitsuAnimeResource['attributes']): string {
  return (
    attrs.posterImage?.large ||
    attrs.posterImage?.medium ||
    attrs.posterImage?.original ||
    ''
  );
}

/** Extract hero image URL from Kitsu cover/poster images. */
function getKitsuHeroImage(
  attrs: KitsuAnimeResource['attributes'],
  thumbnail: string
): string {
  return attrs.coverImage?.large || attrs.coverImage?.original || thumbnail;
}

/** Parse release year from Kitsu startDate string. */
function parseKitsuYear(startDate: string | null): number {
  if (!startDate) return 0;
  const year = parseInt(startDate.slice(0, 4), 10);
  return isNaN(year) ? 0 : year;
}

/** Convert a raw KitsuAnimeResource to our AnimeSeries type. */
export function kitsuToSeries(anime: KitsuAnimeResource): AnimeSeries {
  const attrs = anime.attributes;
  const thumbnail = getKitsuThumbnail(attrs);

  return {
    id: `kitsu-${anime.id}`,
    slug: `kitsu-${anime.id}`,
    title: attrs.titles.en || attrs.canonicalTitle,
    description: attrs.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: getKitsuHeroImage(attrs, thumbnail),
    type: 'series',
    genres: [],
    language: 'sub',
    sourceName: 'Kitsu',
    sourceType: 'kitsu',
    isEmbeddable: false,
    watchUrl: `https://kitsu.io/anime/${attrs.slug}`,
    releaseYear: parseKitsuYear(attrs.startDate),
    episodeCount: attrs.episodeCount ?? 0,
    tags: [],
  };
}

/** Convert a raw KitsuAnimeResource to our Movie type. */
export function kitsuToMovie(anime: KitsuAnimeResource): Movie {
  const attrs = anime.attributes;
  const thumbnail = getKitsuThumbnail(attrs);

  return {
    id: `kitsu-${anime.id}`,
    slug: `kitsu-${anime.id}`,
    title: attrs.titles.en || attrs.canonicalTitle,
    description: attrs.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: getKitsuHeroImage(attrs, thumbnail),
    type: 'movie',
    genres: [],
    language: 'sub',
    sourceName: 'Kitsu',
    sourceType: 'kitsu',
    isEmbeddable: false,
    watchUrl: `https://kitsu.io/anime/${attrs.slug}`,
    releaseYear: parseKitsuYear(attrs.startDate),
    tags: ['Movie'],
  };
}
