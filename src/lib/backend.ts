/**
 * Backend API client for Next.js server-side route handlers.
 *
 * Proxies requests to the Fastify backend at BACKEND_URL (defaults to
 * http://localhost:3001). All errors from the backend are surfaced as-is
 * so the Next.js route can re-return them with the correct status code.
 *
 * All public functions normalise the raw Fastify/Prisma response into the
 * canonical Anime / Episode / Channel types via the ingestion pipeline so
 * callers never have to deal with `unknown` data or field-name mismatches.
 */

import { deriveEmbedType, isOfficialSource } from '@/lib/ingestion/normalize';
import { normalizeBackendAnime } from '@/lib/ingestion/normalize';

import type {
  Anime,
  AnimeSeries,
  Channel,
  Episode,
  LanguageOption,
  Movie,
  SourceLink,
  SourceType,
} from '@/types';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
if (!process.env.BACKEND_URL && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[backend] BACKEND_URL is not set; defaulting to http://localhost:3001'
  );
}
const API_BASE = `${BACKEND_URL}/api/v1`;

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'BackendError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const timeoutSignal = AbortSignal.timeout(15_000);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  const res = await fetch(url, {
    ...init,
    signal,
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

// ─── Episode normalizer ───────────────────────────────────────────────────────

type RawEpisodeSourceLink = {
  url: string;
  sourceName: string;
  sourceType: string;
  isEmbeddable: boolean;
  language: string;
  region?: string | null;
  isOfficial?: boolean;
  embedType?: string;
  availabilityStatus?: string;
  lastVerifiedAt?: string | null;
};

/**
 * Convert a backend Episode record to the canonical Episode type.
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
  const rawLinks = (raw.sourceLinks as RawEpisodeSourceLink[]) ?? [];
  const animeId = String(raw.id ?? seriesSlug);

  const sourceLinks: SourceLink[] = rawLinks.map((l) => {
    const sourceType = (l.sourceType || 'youtube') as SourceType;
    return {
      providerId: `${sourceType}-${animeId}-ep${raw.episodeNumber ?? 0}`,
      providerUrl: l.url,
      sourceName: l.sourceName || '',
      sourceType,
      embedType: deriveEmbedType(sourceType),
      region: l.region ?? 'global',
      isOfficial: l.isOfficial ?? isOfficialSource(sourceType),
      isEmbeddable: l.isEmbeddable ?? false,
      language: (l.language || 'sub') as LanguageOption,
      availabilityStatus: (l.availabilityStatus ??
        'unknown') as SourceLink['availabilityStatus'],
      lastVerifiedAt: l.lastVerifiedAt ?? null,
    };
  });

  const primaryLink = sourceLinks[0];
  const firstRaw = rawLinks[0];

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
    watchUrl:
      primaryLink?.providerUrl ||
      (firstRaw?.url as string) ||
      (raw.watchUrl as string) ||
      '',
    isEmbeddable:
      primaryLink?.isEmbeddable ??
      (firstRaw?.isEmbeddable as boolean) ??
      (raw.isEmbeddable as boolean) ??
      false,
    sourceName:
      primaryLink?.sourceName ||
      (firstRaw?.sourceName as string) ||
      (raw.sourceName as string) ||
      '',
    language:
      primaryLink?.language ??
      (firstRaw?.language as LanguageOption) ??
      (raw.language as LanguageOption) ??
      undefined,
    sourceLinks,
  };
}

// ─── Channel normalizer ───────────────────────────────────────────────────────

/**
 * Convert a backend Channel record to the canonical Channel type.
 *
 * Note: The backend Channel schema does not include live-stream fields like
 * watchUrl, nowPlaying, or nextUp — those are available from the mock data
 * layer or the /now-playing endpoint. Sensible defaults are provided so
 * backend channels render without crashing.
 */
function normalizeChannel(raw: Record<string, unknown>): Channel {
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
  return { ...result, data: result.data.map(normalizeBackendAnime) };
}

export async function getAnime(slug: string): Promise<{ data: Anime }> {
  const result = await apiFetch<{ data: Record<string, unknown> }>(
    `/anime/${slug}`
  );
  return { data: normalizeBackendAnime(result.data) };
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
  return { data: result.data.map(normalizeBackendAnime) };
}

export async function getFeaturedAnime(): Promise<{
  data: (AnimeSeries | Movie)[];
}> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    '/anime/featured'
  );
  return { data: result.data.map(normalizeBackendAnime) };
}

export async function getRelatedAnime(
  slug: string
): Promise<{ data: AnimeSeries[] }> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    `/anime/${slug}/related`
  );
  return { data: result.data.map(normalizeBackendAnime) as AnimeSeries[] };
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
  return { ...result, data: result.data.map(normalizeBackendAnime) };
}

// ─── Search suggestions ───────────────────────────────────────────────────────

export interface SearchSuggestion {
  slug: string;
  title: string;
  posterUrl: string | null;
}

/** GET /api/v1/search/suggest?q=... — instant autocomplete suggestions */
export async function getSearchSuggestions(q: string): Promise<{
  data: SearchSuggestion[];
}> {
  const qs = new URLSearchParams({ q });
  return apiFetch<{ data: SearchSuggestion[] }>(`/search/suggest?${qs}`);
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/** GET /api/v1/recommendations/similar/:animeId */
export async function getSimilarAnime(animeId: string): Promise<{
  data: (AnimeSeries | Movie)[];
}> {
  const result = await apiFetch<{ data: Record<string, unknown>[] }>(
    `/recommendations/similar/${encodeURIComponent(animeId)}`
  );
  return { data: result.data.map(normalizeBackendAnime) };
}

/** GET /api/v1/recommendations/because-you-watched/:animeId */
export async function getBecauseYouWatched(animeId: string): Promise<{
  data: (AnimeSeries | Movie)[];
  basedOn: { id: string; title: string } | null;
}> {
  const result = await apiFetch<{
    data: Record<string, unknown>[];
    basedOn: { id: string; title: string } | null;
  }>(`/recommendations/because-you-watched/${encodeURIComponent(animeId)}`);
  return {
    data: result.data.map(normalizeBackendAnime),
    basedOn: result.basedOn,
  };
}

// ─── Channels ─────────────────────────────────────────────────────────────────

export async function listChannels(): Promise<{
  data: Channel[];
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

export async function getChannelSchedule(slug: string) {
  return apiFetch<{ data: unknown[]; total: number; channelSlug: string }>(
    `/channels/${slug}/schedule`
  );
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
