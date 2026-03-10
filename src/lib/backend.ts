/**
 * Backend API client for Next.js server-side route handlers.
 *
 * Proxies requests to the Fastify backend at BACKEND_URL (defaults to
 * http://localhost:3001). All errors from the backend are surfaced as-is
 * so the Next.js route can re-return them with the correct status code.
 *
 * All public functions normalise the raw Fastify/Prisma response into the
 * frontend's AnimeSeries / Movie / Episode / LiveChannel types so callers
 * never have to deal with `unknown` data or field-name mismatches.
 */

import type {
  AnimeSeries,
  Episode,
  LanguageOption,
  LiveChannel,
  Movie,
  SourceType,
} from '@/types';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
const API_BASE = `${BACKEND_URL}/api/v1`;

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'BackendError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    // Disable Next.js data cache for these server-to-server calls
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Backend error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      // ignore JSON parse error
    }
    throw new BackendError(res.status, message);
  }

  return res.json() as Promise<T>;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

type RawSourceLink = {
  url: string;
  sourceName: string;
  sourceType: string;
  isEmbeddable: boolean;
  language: string;
  region?: string | null;
};

type RawGenreOrTag = { name: string } | string;

/**
 * Convert a backend AnimeTitle record (after Fastify's formatAnime helper)
 * into the frontend AnimeSeries or Movie type.
 *
 * Field mapping:
 *   synopsis        → description
 *   posterUrl       → thumbnail
 *   backdropUrl     → heroImage
 *   titleEnglish    → title (preferred over Japanese romanisation)
 *   sourceLinksTitleLevel[0] → sourceName, sourceType, isEmbeddable, watchUrl, language
 *   genres[].name   → genres (string array)
 *   tags[].name     → tags (string array)
 */
function normalizeAnime(raw: Record<string, unknown>): AnimeSeries | Movie {
  const srcLinks = (raw.sourceLinksTitleLevel as RawSourceLink[]) ?? [];
  const src = srcLinks[0] ?? {
    url: '',
    sourceName: '',
    sourceType: 'youtube',
    isEmbeddable: false,
    language: 'sub',
  };

  const genreNames = ((raw.genres as RawGenreOrTag[]) ?? []).map((g) =>
    typeof g === 'string' ? g : g.name
  );

  const tagNames = ((raw.tags as RawGenreOrTag[]) ?? []).map((t) =>
    typeof t === 'string' ? t : t.name
  );

  const isMovie = raw.type === 'MOVIE';

  const base = {
    id: raw.id as string,
    slug: raw.slug as string,
    title: ((raw.titleEnglish ?? raw.title) as string) || '',
    description: (raw.synopsis ??
      raw.description ??
      'No description available.') as string,
    thumbnail: (raw.posterUrl ?? raw.thumbnail ?? '') as string,
    heroImage: (raw.backdropUrl ??
      raw.heroImage ??
      raw.posterUrl ??
      '') as string,
    genres: genreNames,
    language: (src.language ||
      (raw.language as string) ||
      'sub') as LanguageOption,
    sourceName: src.sourceName || (raw.sourceName as string) || '',
    sourceType: (src.sourceType ||
      (raw.sourceType as string) ||
      'youtube') as SourceType,
    isEmbeddable: src.isEmbeddable ?? (raw.isEmbeddable as boolean) ?? false,
    watchUrl: src.url || (raw.watchUrl as string) || '',
    releaseYear: (raw.releaseYear as number) ?? 0,
    tags: tagNames,
  };

  if (isMovie) {
    return { ...base, type: 'movie' } as Movie;
  }
  return {
    ...base,
    type: 'series',
    episodeCount: (raw.episodeCount as number) ?? 0,
  } as AnimeSeries;
}

/**
 * Convert a backend Episode record to the frontend Episode type.
 *
 * Field mapping:
 *   thumbnailUrl          → thumbnail
 *   sourceLinks[0].url    → watchUrl
 *   sourceLinks[0].isEmbeddable / sourceName → isEmbeddable, sourceName
 *   duration (number min) → "N min" string
 */
function normalizeEpisode(
  raw: Record<string, unknown>,
  seriesSlug: string
): Episode {
  const srcLinks = (raw.sourceLinks as RawSourceLink[]) ?? [];
  const src = srcLinks[0] ?? {
    url: '',
    sourceName: '',
    isEmbeddable: false,
  };

  const durationRaw = raw.duration;
  const duration =
    typeof durationRaw === 'number'
      ? `${durationRaw} min`
      : typeof durationRaw === 'string'
      ? durationRaw
      : '~24 min';

  return {
    id: raw.id as string,
    seriesSlug,
    title: (raw.title ?? `Episode ${raw.episodeNumber}`) as string,
    description: (raw.description ?? '') as string,
    thumbnail: (raw.thumbnailUrl ?? raw.thumbnail ?? '') as string,
    episodeNumber: (raw.episodeNumber as number) ?? 0,
    seasonNumber: (raw.seasonNumber as number) ?? 1,
    duration,
    watchUrl: src.url || (raw.watchUrl as string) || '',
    isEmbeddable: src.isEmbeddable ?? (raw.isEmbeddable as boolean) ?? false,
    sourceName: src.sourceName || (raw.sourceName as string) || '',
  };
}

/**
 * Convert a backend Channel record to the frontend LiveChannel type.
 *
 * Note: The backend Channel schema does not include live-stream fields like
 * watchUrl, nowPlaying, or nextUp — those are available from the mock data
 * layer or the /now-playing endpoint. Sensible defaults are provided so
 * backend channels render without crashing.
 */
function normalizeChannel(raw: Record<string, unknown>): LiveChannel {
  return {
    id: raw.id as string,
    slug: raw.slug as string,
    name: raw.name as string,
    description: (raw.description ?? '') as string,
    thumbnail: (raw.artworkUrl ??
      raw.bannerUrl ??
      raw.thumbnail ??
      '') as string,
    channelNumber: (raw.channelNumber ?? '') as string,
    sourceName: (raw.sourceName ?? raw.name) as string,
    sourceType: (raw.sourceType ?? 'live') as SourceType,
    isEmbeddable: (raw.isEmbeddable as boolean) ?? false,
    watchUrl: (raw.watchUrl ?? '') as string,
    tags: (raw.tags as string[]) ?? [],
    nowPlaying: (raw.nowPlaying ?? '') as string,
    nextUp: raw.nextUp as string | undefined,
  };
}

// ─── Anime / Series ───────────────────────────────────────────────────────────

export interface AnimeListParams {
  page?: number;
  limit?: number;
  genre?: string;
  tag?: string;
  type?: string;
  status?: string;
  season?: string;
  year?: number;
  source?: string;
  language?: string;
  featured?: boolean;
  sort?: string;
}

export async function listAnime(params: AnimeListParams = {}): Promise<{
  data: (AnimeSeries | Movie)[];
  total: number;
  page: number;
  limit: number;
}> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
  }>(`/anime?${qs.toString()}`);
  return { ...result, data: result.data.map(normalizeAnime) };
}

export async function getAnime(
  slug: string
): Promise<{ data: AnimeSeries | Movie }> {
  const result = await apiFetch<{ data: Record<string, unknown> }>(
    `/anime/${slug}`
  );
  return { data: normalizeAnime(result.data) };
}

export async function getAnimeEpisodes(
  slug: string
): Promise<{ data: Episode[]; total: number }> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    `/anime/${slug}/episodes`
  );
  return {
    data: result.data.map((ep) => normalizeEpisode(ep, slug)),
    total: result.data.length,
  };
}

export async function getTrendingAnime(): Promise<{
  data: (AnimeSeries | Movie)[];
}> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    '/anime/trending'
  );
  return { data: result.data.map(normalizeAnime) };
}

export async function getFeaturedAnime(): Promise<{
  data: (AnimeSeries | Movie)[];
}> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    '/anime/featured'
  );
  return { data: result.data.map(normalizeAnime) };
}

export async function getRelatedAnime(
  slug: string
): Promise<{ data: AnimeSeries[] }> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    `/anime/${slug}/related`
  );
  return { data: result.data.map(normalizeAnime) as AnimeSeries[] };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  genre?: string;
  type?: string;
  year?: number;
  season?: string;
  source?: string;
  language?: string;
  sort?: string;
}

export async function searchAnime(params: SearchParams): Promise<{
  data: (AnimeSeries | Movie)[];
  total: number;
  page: number;
  limit: number;
  query: string;
}> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
    query: string;
  }>(`/search?${qs.toString()}`);
  return { ...result, data: result.data.map(normalizeAnime) };
}

// ─── Channels ─────────────────────────────────────────────────────────────────

export async function listChannels(): Promise<{
  data: LiveChannel[];
  total: number;
}> {
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    total: number;
  }>('/channels');
  return { ...result, data: result.data.map(normalizeChannel) };
}

export async function getChannelNowPlaying(slug: string) {
  return apiFetch<{ data: unknown }>(`/channels/${slug}/now-playing`);
}

// ─── Sources / Providers ─────────────────────────────────────────────────────

export function listAllowedDomains() {
  return apiFetch<{ data: unknown[]; total: number }>('/sources/domains');
}

// ─── Streaming (Consumet) ─────────────────────────────────────────────────────

export type ConsumetProvider = 'gogoanime' | 'zoro' | 'animepahe';

export function listStreamingProviders() {
  return apiFetch<{ data: ConsumetProvider[] }>('/streaming/providers');
}

export function searchStreaming(params: {
  q: string;
  provider?: ConsumetProvider;
  page?: number;
}) {
  const qs = new URLSearchParams({ q: params.q });
  if (params.provider) qs.set('provider', params.provider);
  if (params.page) qs.set('page', String(params.page));
  return apiFetch<{ data: unknown }>(`/streaming/search?${qs.toString()}`);
}

export function getStreamingInfo(animeId: string, provider?: ConsumetProvider) {
  const qs = new URLSearchParams({ id: animeId });
  if (provider) qs.set('provider', provider);
  return apiFetch<{ data: unknown }>(`/streaming/info?${qs.toString()}`);
}

export function getStreamingSources(
  episodeId: string,
  provider?: ConsumetProvider
) {
  const qs = new URLSearchParams({ episodeId });
  if (provider) qs.set('provider', provider);
  return apiFetch<{ data: unknown }>(`/streaming/sources?${qs.toString()}`);
}
