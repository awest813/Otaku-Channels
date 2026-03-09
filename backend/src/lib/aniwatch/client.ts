/**
 * Aniwatch API client
 *
 * Aniwatch is a self-hosted API that scrapes hianime.to (formerly Zoro.to).
 * It provides anime search, episode listings, and streaming server links.
 *
 * GitHub: https://github.com/ghoshRitesh12/aniwatch-api
 *
 * IMPORTANT: Requires self-hosting. Set ANIWATCH_BASE_URL to your instance URL.
 * If ANIWATCH_BASE_URL is not configured, all methods return empty results.
 *
 * Docker: docker run -p 4000:4000 ghcr.io/ghoshritesh12/aniwatch
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.ANIWATCH_BASE_URL;

async function aniwatchFetch<T>(path: string): Promise<T | null> {
  if (!BASE) {
    logger.debug(
      'ANIWATCH_BASE_URL not configured — skipping Aniwatch request'
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
      logger.warn({ url }, 'Aniwatch rate limited — backing off 3s');
      await new Promise((r) => setTimeout(r, 3_000));
      return aniwatchFetch<T>(path); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Aniwatch non-OK response');
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    logger.error({ url, err }, 'Aniwatch fetch error');
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface AniwatchSearchResult {
  id: string;
  name: string;
  poster: string | null;
  duration: string | null;
  type: string | null;
  rating: string | null;
  episodes: {
    sub: number | null;
    dub: number | null;
  };
}

export interface AniwatchAnimeInfo {
  id: string;
  name: string;
  poster: string | null;
  description: string | null;
  stats: {
    rating: string | null;
    quality: string | null;
    episodes: { sub: number | null; dub: number | null };
    type: string | null;
    duration: string | null;
  };
  promotionalVideos: {
    title: string | null;
    source: string | null;
    thumbnail: string | null;
  }[];
  genres: string[];
  moreInfo: {
    aired: string | null;
    premiered: string | null;
    status: string | null;
    studios: string | null;
  };
}

export interface AniwatchEpisode {
  number: number;
  title: string | null;
  episodeId: string;
  isFiller: boolean;
}

export type AniwatchCategory = 'sub' | 'dub' | 'raw';

export interface AniwatchServer {
  name: string;
  serverName: string;
  type: AniwatchCategory;
}

export interface AniwatchSource {
  url: string;
  type: string; // "m3u8" | "mp4"
}

export interface AniwatchStreamingData {
  headers: Record<string, string>;
  sources: AniwatchSource[];
  subtitles: { url: string; lang: string; default?: boolean }[];
  anilistID: number | null;
  malID: number | null;
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Search anime by title. */
export async function searchAnime(
  query: string
): Promise<AniwatchSearchResult[]> {
  const encoded = encodeURIComponent(query);
  const result = await aniwatchFetch<{
    data: { animes: AniwatchSearchResult[] };
  }>(`/api/v2/hianime/search?q=${encoded}`);
  return result?.data?.animes ?? [];
}

/** Fetch detailed anime info by hianime slug-id (e.g. "one-piece-100"). */
export async function getAnimeInfo(
  animeId: string
): Promise<AniwatchAnimeInfo | null> {
  const encoded = encodeURIComponent(animeId);
  const result = await aniwatchFetch<{
    data: { anime: { info: AniwatchAnimeInfo } };
  }>(`/api/v2/hianime/anime/${encoded}`);
  return result?.data?.anime?.info ?? null;
}

/** Fetch paginated episode list for an anime. */
export async function getEpisodes(animeId: string): Promise<AniwatchEpisode[]> {
  const encoded = encodeURIComponent(animeId);
  const result = await aniwatchFetch<{ data: { episodes: AniwatchEpisode[] } }>(
    `/api/v2/hianime/anime/${encoded}/episodes`
  );
  return result?.data?.episodes ?? [];
}

/** Fetch available streaming servers for a given episode. */
export async function getEpisodeServers(
  animeEpisodeId: string
): Promise<AniwatchServer[]> {
  const encoded = encodeURIComponent(animeEpisodeId);
  const result = await aniwatchFetch<{
    data: {
      sub: AniwatchServer[];
      dub: AniwatchServer[];
      raw: AniwatchServer[];
    };
  }>(`/api/v2/hianime/episode/servers?animeEpisodeId=${encoded}`);

  if (!result?.data) return [];
  return [...result.data.sub, ...result.data.dub, ...result.data.raw];
}

/**
 * Fetch streaming sources for a given episode on the given server.
 * @param animeEpisodeId  Episode ID from getEpisodes()
 * @param server          Server name from getEpisodeServers() (e.g. "hd-1")
 * @param category        "sub" | "dub" | "raw"
 */
export async function getEpisodeSources(
  animeEpisodeId: string,
  server = 'hd-1',
  category: AniwatchCategory = 'sub'
): Promise<AniwatchStreamingData | null> {
  const encodedEpId = encodeURIComponent(animeEpisodeId);
  const encodedServer = encodeURIComponent(server);
  return aniwatchFetch<AniwatchStreamingData>(
    `/api/v2/hianime/episode/sources?animeEpisodeId=${encodedEpId}&server=${encodedServer}&category=${category}`
  );
}
