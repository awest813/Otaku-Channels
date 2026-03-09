/**
 * Kitsu API client
 *
 * Kitsu is a modern anime/manga tracking service with a free REST API.
 * It provides anime metadata, streaming link discovery, and library management.
 *
 * Docs: https://kitsu.docs.apiary.io/
 * Base URL: https://kitsu.io/api/edge
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.KITSU_BASE_URL;

// JSON:API content type required by Kitsu
const HEADERS = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
};

async function kitsuFetch<T>(path: string): Promise<T | null> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 429) {
      logger.warn({ url }, 'Kitsu rate limited — backing off 5s');
      await new Promise((r) => setTimeout(r, 5_000));
      return kitsuFetch<T>(path); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Kitsu non-OK response');
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    logger.error({ url, err }, 'Kitsu fetch error');
    return null;
  }
}

// ─── Type definitions (JSON:API response shapes) ─────────────────────────────

export interface KitsuAnimeAttributes {
  slug: string;
  synopsis: string | null;
  canonicalTitle: string;
  abbreviatedTitles: string[];
  averageRating: string | null; // "7.89" — string decimal
  ratingRank: number | null;
  popularityRank: number | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null;
  nextRelease: string | null;
  tba: string | null;
  subtype: string | null; // "TV" | "movie" | "OVA" | "ONA" | "special" | "music"
  status: string | null; // "current" | "finished" | "tba" | "unreleased" | "upcoming"
  episodeCount: number | null;
  episodeLength: number | null; // minutes
  totalLength: number | null;
  ageRating: string | null; // "G" | "PG" | "R" | "R18"
  ageRatingGuide: string | null;
  nsfw: boolean;
  posterImage: {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    large: string | null;
    original: string | null;
  } | null;
  coverImage: {
    tiny: string | null;
    small: string | null;
    large: string | null;
    original: string | null;
  } | null;
  titles: {
    en: string | null;
    en_jp: string | null;
    ja_jp: string | null;
  };
}

export interface KitsuAnime {
  id: string;
  type: 'anime';
  attributes: KitsuAnimeAttributes;
}

export interface KitsuStreamingLink {
  id: string;
  type: 'streamingLinks';
  attributes: {
    url: string;
    subs: string[];
    dubs: string[];
  };
  relationships?: {
    streamer?: {
      data?: { id: string; type: 'streamers' };
    };
  };
}

export interface KitsuStreamer {
  id: string;
  type: 'streamers';
  attributes: {
    siteName: string;
  };
}

export interface KitsuStreamingLinkWithStreamer {
  link: KitsuStreamingLink;
  streamerName: string | null;
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Search Kitsu anime by title. */
export async function searchAnime(
  query: string,
  limit = 5
): Promise<KitsuAnime[]> {
  const encoded = encodeURIComponent(query);
  const result = await kitsuFetch<{ data: KitsuAnime[] }>(
    `/anime?filter[text]=${encoded}&page[limit]=${limit}`
  );
  return result?.data ?? [];
}

/** Fetch a single anime by Kitsu ID. */
export async function getAnimeById(
  kitsuId: string
): Promise<KitsuAnime | null> {
  const result = await kitsuFetch<{ data: KitsuAnime }>(`/anime/${kitsuId}`);
  return result?.data ?? null;
}

/** Fetch a single anime by its slug. */
export async function getAnimeBySlug(slug: string): Promise<KitsuAnime | null> {
  const encoded = encodeURIComponent(slug);
  const result = await kitsuFetch<{ data: KitsuAnime[] }>(
    `/anime?filter[slug]=${encoded}`
  );
  return result?.data?.[0] ?? null;
}

/**
 * Fetch streaming links for a Kitsu anime ID.
 * Returns links alongside streamer names when available.
 */
export async function getStreamingLinks(
  kitsuId: string
): Promise<KitsuStreamingLinkWithStreamer[]> {
  const result = await kitsuFetch<{
    data: KitsuStreamingLink[];
    included?: (KitsuStreamer | KitsuAnime)[];
  }>(`/anime/${kitsuId}/streaming-links?include=streamer`);

  if (!result?.data) return [];

  const streamers = (result.included ?? []).filter(
    (r): r is KitsuStreamer => r.type === 'streamers'
  );

  return result.data.map((link) => {
    const streamerId = link.relationships?.streamer?.data?.id;
    const streamer = streamers.find((s) => s.id === streamerId);
    return { link, streamerName: streamer?.attributes.siteName ?? null };
  });
}

/** Map Kitsu status string → Prisma AnimeStatus enum value. */
export function mapKitsuStatus(status: string | null): string {
  switch (status) {
    case 'current':
      return 'ONGOING';
    case 'finished':
      return 'COMPLETED';
    case 'upcoming':
      return 'UPCOMING';
    case 'tba':
    case 'unreleased':
      return 'UPCOMING';
    default:
      return 'COMPLETED';
  }
}

/** Map Kitsu subtype string → Prisma AnimeType enum value. */
export function mapKitsuSubtype(subtype: string | null): string {
  switch (subtype?.toLowerCase()) {
    case 'tv':
      return 'TV';
    case 'movie':
      return 'MOVIE';
    case 'ova':
      return 'OVA';
    case 'ona':
      return 'ONA';
    case 'special':
      return 'SPECIAL';
    case 'music':
      return 'MUSIC';
    default:
      return 'TV';
  }
}

/** Parse Kitsu averageRating string (e.g. "7.89") → number. */
export function parseKitsuRating(averageRating: string | null): number | null {
  if (!averageRating) return null;
  const n = parseFloat(averageRating);
  return isNaN(n) ? null : n;
}

/** Returns true when Kitsu ageRating implies adult content. */
export function isAdult(ageRating: string | null, nsfw: boolean): boolean {
  return nsfw || ageRating === 'R18';
}
