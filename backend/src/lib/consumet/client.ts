/**
 * Consumet API client
 *
 * Consumet is a self-hosted anime streaming API that scrapes multiple providers
 * including Gogoanime, Zoro (hianime), AnimePahe, 9anime, and more.
 *
 * GitHub: https://github.com/consumet/api.consumet.org
 *
 * IMPORTANT: Requires self-hosting. Set CONSUMET_BASE_URL to your instance URL.
 * If CONSUMET_BASE_URL is not configured, all methods return empty results.
 *
 * Supported providers (passed as `provider` param):
 *   gogoanime, zoro, animepahe, 9anime, animeunity
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.CONSUMET_BASE_URL;

async function consumetFetch<T>(path: string): Promise<T | null> {
  if (!BASE) {
    logger.debug(
      'CONSUMET_BASE_URL not configured — skipping Consumet request'
    );
    return null;
  }

  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });

    if (res.status === 429) {
      logger.warn({ url }, 'Consumet rate limited — backing off 3s');
      await new Promise((r) => setTimeout(r, 3_000));
      return consumetFetch<T>(path); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Consumet non-OK response');
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    logger.error({ url, err }, 'Consumet fetch error');
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export type ConsumetProvider =
  | 'gogoanime'
  | 'zoro'
  | 'animepahe'
  | '9anime'
  | 'animeunity';

export interface ConsumetAnimeResult {
  id: string;
  title: string;
  url: string;
  image: string | null;
  releaseDate: string | null;
  subOrDub: 'sub' | 'dub' | 'both' | null;
}

export interface ConsumetAnimeInfo {
  id: string;
  title: string;
  url: string;
  image: string | null;
  releaseDate: string | null;
  description: string | null;
  genres: string[];
  status: string | null; // "Ongoing" | "Completed" | "Not yet aired"
  subOrDub: 'sub' | 'dub' | 'both' | null;
  type: string | null;
  totalEpisodes: number | null;
  episodes: ConsumetEpisode[];
}

export interface ConsumetEpisode {
  id: string;
  number: number;
  title: string | null;
  url: string | null;
  image: string | null;
  description: string | null;
}

export interface ConsumetSource {
  url: string;
  isM3U8: boolean;
  quality: string | null;
}

export interface ConsumetStreamingData {
  headers: Record<string, string>;
  sources: ConsumetSource[];
  subtitles?: { url: string; lang: string }[];
  download?: string;
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Search for anime by title on the given provider. */
export async function searchAnime(
  query: string,
  provider: ConsumetProvider = 'gogoanime'
): Promise<ConsumetAnimeResult[]> {
  const encoded = encodeURIComponent(query);
  const result = await consumetFetch<{ results: ConsumetAnimeResult[] }>(
    `/anime/${provider}/${encoded}`
  );
  return result?.results ?? [];
}

/** Fetch detailed anime info including episode list. */
export async function getAnimeInfo(
  id: string,
  provider: ConsumetProvider = 'gogoanime'
): Promise<ConsumetAnimeInfo | null> {
  const encoded = encodeURIComponent(id);
  return consumetFetch<ConsumetAnimeInfo>(
    `/anime/${provider}/info?id=${encoded}`
  );
}

/** Fetch streaming sources for a given episode ID. */
export async function getEpisodeSources(
  episodeId: string,
  provider: ConsumetProvider = 'gogoanime'
): Promise<ConsumetStreamingData | null> {
  const encoded = encodeURIComponent(episodeId);
  return consumetFetch<ConsumetStreamingData>(
    `/anime/${provider}/watch?episodeId=${encoded}`
  );
}

/** Fetch recent episodes (if provider supports it). */
export async function getRecentEpisodes(
  provider: ConsumetProvider = 'gogoanime',
  page = 1
): Promise<ConsumetAnimeResult[]> {
  const result = await consumetFetch<{ results: ConsumetAnimeResult[] }>(
    `/anime/${provider}/recent-episodes?page=${page}`
  );
  return result?.results ?? [];
}

/** Map Consumet status → Prisma AnimeStatus. */
export function mapConsumetStatus(status: string | null): string {
  switch (status?.toLowerCase()) {
    case 'ongoing':
      return 'ONGOING';
    case 'completed':
      return 'COMPLETED';
    case 'not yet aired':
      return 'UPCOMING';
    default:
      return 'COMPLETED';
  }
}
