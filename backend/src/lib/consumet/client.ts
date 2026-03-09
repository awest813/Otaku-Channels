/**
 * Consumet API client
 *
 * Consumet is a self-hosted anime streaming API that aggregates sources from
 * multiple providers (Gogoanime, Zoro/AniWatch, AnimePahe, etc.).
 *
 * Self-host: https://github.com/consumet/api.consumet.org
 * Docs:      https://docs.consumet.org/
 *
 * Supported providers (pass as `provider` parameter):
 *   gogoanime | zoro | animepahe | 9anime | animefox | animesaturn
 */

import { config } from '../../config';
import { logger } from '../logger';

// ─── Supported providers ──────────────────────────────────────────────────────

export type ConsumetProvider =
  | 'gogoanime'
  | 'zoro'
  | 'animepahe'
  | '9anime'
  | 'animefox'
  | 'animesaturn';

export const SUPPORTED_PROVIDERS: ConsumetProvider[] = [
  'gogoanime',
  'zoro',
  'animepahe',
];

// ─── Response types ──────────────────────────────────────────────────────────

export interface ConsumetSearchResult {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  subOrDub?: 'sub' | 'dub';
}

export interface ConsumetSearchPage {
  currentPage: number;
  hasNextPage: boolean;
  results: ConsumetSearchResult[];
}

export interface ConsumetEpisode {
  id: string;
  number: number;
  title?: string | null;
  description?: string | null;
  url?: string;
  image?: string | null;
  releaseDate?: string | null;
}

export interface ConsumetAnimeInfo {
  id: string;
  title: string;
  url: string;
  image: string;
  releaseDate?: string;
  description?: string;
  genres?: string[];
  subOrDub?: 'sub' | 'dub';
  type?: string;
  status?: string;
  otherName?: string;
  totalEpisodes?: number;
  episodes: ConsumetEpisode[];
}

export interface ConsumetVideoSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

export interface ConsumetSubtitle {
  url: string;
  lang: string;
}

export interface ConsumetEpisodeSources {
  headers?: Record<string, string>;
  sources: ConsumetVideoSource[];
  download?: string;
  subtitles?: ConsumetSubtitle[];
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

function getBase(): string | null {
  return config.CONSUMET_BASE_URL ?? null;
}

async function consumetFetch<T>(path: string): Promise<T | null> {
  const base = getBase();
  if (!base) {
    logger.debug('Consumet API not configured (CONSUMET_BASE_URL unset)');
    return null;
  }

  const url = `${base}${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Consumet non-OK response');
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    logger.error({ url, err }, 'Consumet fetch error');
    return null;
  }
}

// ─── API methods ─────────────────────────────────────────────────────────────

/**
 * Search for anime by title on a specific provider.
 * Endpoint: GET /anime/{provider}/{query}
 */
export async function searchAnime(
  query: string,
  provider: ConsumetProvider = 'gogoanime',
  page = 1,
): Promise<ConsumetSearchPage | null> {
  const encoded = encodeURIComponent(query);
  return consumetFetch<ConsumetSearchPage>(
    `/anime/${provider}/${encoded}?page=${page}`,
  );
}

/**
 * Fetch detailed anime info + full episode list from a provider.
 * Endpoint: GET /anime/{provider}/info?id={animeId}
 */
export async function getAnimeInfo(
  animeId: string,
  provider: ConsumetProvider = 'gogoanime',
): Promise<ConsumetAnimeInfo | null> {
  const encoded = encodeURIComponent(animeId);
  return consumetFetch<ConsumetAnimeInfo>(
    `/anime/${provider}/info?id=${encoded}`,
  );
}

/**
 * Fetch streaming sources for a specific episode.
 * Endpoint: GET /anime/{provider}/watch?episodeId={episodeId}
 *
 * Returns a list of video URLs (often m3u8 HLS streams) and optional subtitles.
 */
export async function getEpisodeSources(
  episodeId: string,
  provider: ConsumetProvider = 'gogoanime',
): Promise<ConsumetEpisodeSources | null> {
  const encoded = encodeURIComponent(episodeId);
  return consumetFetch<ConsumetEpisodeSources>(
    `/anime/${provider}/watch?episodeId=${encoded}`,
  );
}

/**
 * Returns true if Consumet is configured (CONSUMET_BASE_URL is set).
 */
export function isConsumetConfigured(): boolean {
  return Boolean(config.CONSUMET_BASE_URL);
}
