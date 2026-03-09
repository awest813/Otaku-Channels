/**
 * Shikimori GraphQL client
 *
 * Shikimori is a Russian anime database similar to MyAnimeList.
 * It exposes a public GraphQL endpoint — no API key required.
 *
 * Docs: https://shikimori.one/api/doc/graphql
 * Endpoint: https://shikimori.one/api/graphql
 */

import { config } from '../../config';
import { logger } from '../logger';

const ENDPOINT = config.SHIKIMORI_BASE_URL;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15_000),
    });

    if (res.status === 429) {
      logger.warn('Shikimori rate limited');
      await new Promise((r) => setTimeout(r, 5000));
      return gql<T>(query, variables); // one retry
    }

    if (!res.ok) {
      logger.warn({ status: res.status }, 'Shikimori non-OK response');
      return null;
    }

    const json = await res.json();
    if (json.errors) {
      logger.warn({ errors: json.errors }, 'Shikimori GraphQL errors');
      return null;
    }
    return json.data as T;
  } catch (err) {
    logger.error({ err }, 'Shikimori fetch error');
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface ShikimoriAnime {
  id: string;
  malId: number | null;
  name: string;
  english: string | null;
  japanese: string | null;
  kind: string | null;   // "tv" | "movie" | "ova" | "ona" | "special" | "music"
  score: number | null;
  status: string | null; // "released" | "ongoing" | "anons"
  episodes: number;
  airedOn: { year: number | null; date: string | null } | null;
  description: string | null;
  poster: { originalUrl: string | null; mainUrl: string | null } | null;
  genres: Array<{ name: string; russian: string }>;
}

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

// ─── API methods ──────────────────────────────────────────────────────────────

/** Search Shikimori anime by title. */
export async function searchAnime(query: string, limit = 10): Promise<ShikimoriAnime[]> {
  const data = await gql<{ animes: ShikimoriAnime[] }>(
    `query ($search: String, $limit: Int) {
       animes(search: $search, limit: $limit, censored: true) { ${ANIME_FIELDS} }
     }`,
    { search: query, limit },
  );
  return data?.animes ?? [];
}

/** Fetch anime by Shikimori ID. */
export async function getAnimeById(shikimoriId: string): Promise<ShikimoriAnime | null> {
  const data = await gql<{ animes: ShikimoriAnime[] }>(
    `query ($ids: String) {
       animes(ids: $ids, limit: 1) { ${ANIME_FIELDS} }
     }`,
    { ids: shikimoriId },
  );
  return data?.animes?.[0] ?? null;
}

/** Map Shikimori status → Prisma AnimeStatus. */
export function mapShikimoriStatus(status: string | null): string {
  switch (status) {
    case 'ongoing': return 'ONGOING';
    case 'released': return 'COMPLETED';
    case 'anons': return 'UPCOMING';
    default: return 'COMPLETED';
  }
}

/** Map Shikimori kind → Prisma AnimeType. */
export function mapShikimoriKind(kind: string | null): string {
  switch (kind) {
    case 'tv': return 'TV';
    case 'movie': return 'MOVIE';
    case 'ova': return 'OVA';
    case 'ona': return 'ONA';
    case 'special': return 'SPECIAL';
    case 'music': return 'MUSIC';
    default: return 'TV';
  }
}

/** Strip HTML/BBCode from Shikimori descriptions. */
export function stripDescription(desc: string | null): string | null {
  if (!desc) return null;
  return desc
    .replace(/<[^>]+>/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
