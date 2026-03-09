/**
 * Backend API client for Next.js server-side route handlers.
 *
 * Proxies requests to the Fastify backend at BACKEND_URL (defaults to
 * http://localhost:3001). All errors from the backend are surfaced as-is
 * so the Next.js route can re-return them with the correct status code.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
const API_BASE = `${BACKEND_URL}/api/v1`;

export class BackendError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
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

export function listAnime(params: AnimeListParams = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  return apiFetch<{ data: unknown[]; total: number; page: number; limit: number }>(
    `/anime?${qs.toString()}`,
  );
}

export function getAnime(slug: string) {
  return apiFetch<{ data: unknown }>(`/anime/${slug}`);
}

export function getAnimeEpisodes(slug: string) {
  return apiFetch<{ data: unknown[]; total: number }>(`/anime/${slug}/episodes`);
}

export function getTrendingAnime() {
  return apiFetch<{ data: unknown[] }>('/anime/trending');
}

export function getFeaturedAnime() {
  return apiFetch<{ data: unknown[] }>('/anime/featured');
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  q: string;
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

export function searchAnime(params: SearchParams) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  return apiFetch<{ data: unknown[]; total: number; page: number; limit: number; query: string }>(
    `/search?${qs.toString()}`,
  );
}

// ─── Channels ─────────────────────────────────────────────────────────────────

export function listChannels() {
  return apiFetch<{ data: unknown[]; total: number }>('/channels');
}

export function getChannelNowPlaying(slug: string) {
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

export function searchStreaming(params: { q: string; provider?: ConsumetProvider; page?: number }) {
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

export function getStreamingSources(episodeId: string, provider?: ConsumetProvider) {
  const qs = new URLSearchParams({ episodeId });
  if (provider) qs.set('provider', provider);
  return apiFetch<{ data: unknown }>(`/streaming/sources?${qs.toString()}`);
}
