/**
 * Jikan v4 API client (unofficial MyAnimeList API)
 * Free, no auth, rate-limited to ~3 req/s.
 * Docs: https://docs.api.jikan.moe
 */

import type { AnimeSeries, JikanAnime, Movie, SourceType } from '@/types';

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

/** Derive a SourceType and streaming info from a JikanAnime. */
function deriveSource(anime: JikanAnime): {
  sourceType: SourceType;
  sourceName: string;
  watchUrl: string;
  isEmbeddable: boolean;
} {
  const streaming = anime.streaming ?? [];

  // Prefer Crunchyroll
  const cr = streaming.find((s) => s.name === 'Crunchyroll');
  if (cr)
    return {
      sourceType: 'crunchyroll',
      sourceName: 'Crunchyroll',
      watchUrl: cr.url,
      isEmbeddable: false,
    };

  const tubi = streaming.find((s) => s.name.toLowerCase().includes('tubi'));
  if (tubi)
    return {
      sourceType: 'tubi',
      sourceName: 'Tubi',
      watchUrl: tubi.url,
      isEmbeddable: false,
    };

  const funimation = streaming.find((s) =>
    s.name.toLowerCase().includes('funimation')
  );
  if (funimation)
    return {
      sourceType: 'crunchyroll',
      sourceName: 'Funimation',
      watchUrl: funimation.url,
      isEmbeddable: false,
    };

  // Fall back to MAL page
  return {
    sourceType: 'jikan',
    sourceName: 'MyAnimeList',
    watchUrl: anime.url,
    isEmbeddable: false,
  };
}

/** Convert a raw JikanAnime to our AnimeSeries type. */
export function jikanToSeries(anime: JikanAnime): AnimeSeries {
  const source = deriveSource(anime);
  const genres = [
    ...(anime.genres ?? []).map((g) => g.name),
    ...(anime.themes ?? []).map((t) => t.name),
  ].slice(0, 5);

  const trailerEmbedUrl = anime.trailer?.embed_url
    ? // Jikan sometimes returns embed_url with autoplay — strip it
      anime.trailer.embed_url
        .replace('?autoplay=1', '')
        .replace('&autoplay=1', '')
    : undefined;

  const thumbnail =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

  return {
    id: `jikan-${anime.mal_id}`,
    slug: `jikan-${anime.mal_id}`,
    title: anime.title_english || anime.title,
    description: anime.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: thumbnail,
    type: anime.type === 'Movie' ? 'series' : 'series', // keep as series for now
    genres,
    language: 'sub',
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    isEmbeddable: !!trailerEmbedUrl,
    watchUrl: source.watchUrl,
    releaseYear: anime.year ?? 0,
    episodeCount: anime.episodes ?? 0,
    tags: [],
    trailerEmbedUrl,
    streamingLinks: anime.streaming ?? [],
    malId: anime.mal_id,
  };
}

/** Convert a raw JikanAnime to our Movie type (when type === 'Movie'). */
export function jikanToMovie(anime: JikanAnime): Movie {
  const source = deriveSource(anime);
  const genres = [
    ...(anime.genres ?? []).map((g) => g.name),
    ...(anime.themes ?? []).map((t) => t.name),
  ].slice(0, 5);

  const trailerEmbedUrl = anime.trailer?.embed_url
    ? anime.trailer.embed_url
        .replace('?autoplay=1', '')
        .replace('&autoplay=1', '')
    : undefined;

  const thumbnail =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

  return {
    id: `jikan-${anime.mal_id}`,
    slug: `jikan-${anime.mal_id}`,
    title: anime.title_english || anime.title,
    description: anime.synopsis ?? 'No description available.',
    thumbnail,
    heroImage: thumbnail,
    type: 'movie',
    genres,
    language: 'sub',
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    isEmbeddable: !!trailerEmbedUrl,
    watchUrl: source.watchUrl,
    releaseYear: anime.year ?? 0,
    tags: ['Movie'],
    trailerEmbedUrl,
    streamingLinks: anime.streaming ?? [],
    malId: anime.mal_id,
  };
}
