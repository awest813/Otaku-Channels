/**
 * Browser-side (and universal) typed API client.
 *
 * Calls the Next.js /api/* route handlers — NOT the Fastify backend directly.
 * Use this in:
 *   • Client components ('use client')
 *   • Any server context that intentionally goes through the Next.js API layer
 *
 * For server components that need direct backend access with no extra hop,
 * import from @/lib/backend instead.
 *
 * Features:
 *   • Typed parameters and return types via src/types/api.ts
 *   • Automatic retry with exponential backoff for 5xx / network errors
 *   • Throws ApiClientError with status code on failure
 */

import type {
  EpisodesResponse,
  LiveResponse,
  MoviesListResponse,
  ProvidersResponse,
  RecommendationsResponse,
  SearchParams,
  SearchResponse,
  SeriesDetailResponse,
  SeriesListParams,
  SeriesListResponse,
  SuggestResponse,
} from '@/types/api';
import { ApiClientError } from '@/types/api';

// ─── Internal fetch with retry ────────────────────────────────────────────────

const DEFAULT_RETRIES = 2;
const RETRY_BASE_MS = 500;

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = DEFAULT_RETRIES
): Promise<T> {
  let lastError: ApiClientError | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Exponential back-off: 500 ms, 1 000 ms, …
      await new Promise((r) =>
        setTimeout(r, RETRY_BASE_MS * 2 ** (attempt - 1))
      );
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers ?? {}),
        },
      });

      if (!res.ok) {
        let message = `API error ${res.status}`;
        try {
          const body = (await res.json()) as { error?: string };
          message = body.error ?? message;
        } catch {
          // ignore JSON parse errors
        }
        const err = new ApiClientError(res.status, message, res.status >= 500);
        if (!err.retryable || attempt === retries) throw err;
        lastError = err;
        continue;
      }

      return res.json() as Promise<T>;
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (!err.retryable || attempt === retries) throw err;
        lastError = err;
      } else {
        // Network / CORS errors — always retryable
        const netErr = new ApiClientError(
          0,
          err instanceof Error ? err.message : 'Network error',
          true
        );
        if (attempt === retries) throw netErr;
        lastError = netErr;
      }
    }
  }

  throw lastError ?? new ApiClientError(0, 'Unknown fetch error');
}

// ─── Query-string helper ──────────────────────────────────────────────────────

function buildQS(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * GET /api/series
 *
 * Fetches a paginated list of anime series (not movies).
 */
export async function getSeries(
  params: SeriesListParams = {}
): Promise<SeriesListResponse> {
  return fetchWithRetry<SeriesListResponse>(
    `/api/series${buildQS(params as Record<string, unknown>)}`
  );
}

/**
 * GET /api/series/:slug
 *
 * Fetches a single anime series or movie by its slug.
 */
export async function getSeriesBySlug(
  slug: string
): Promise<SeriesDetailResponse> {
  if (!slug) throw new ApiClientError(400, 'slug is required', false);
  return fetchWithRetry<SeriesDetailResponse>(
    `/api/series/${encodeURIComponent(slug)}`
  );
}

/**
 * GET /api/series/:slug/episodes
 *
 * Fetches the episode list for a series.
 */
export async function getSeriesEpisodes(
  slug: string
): Promise<EpisodesResponse> {
  if (!slug) throw new ApiClientError(400, 'slug is required', false);
  return fetchWithRetry<EpisodesResponse>(
    `/api/series/${encodeURIComponent(slug)}/episodes`
  );
}

/**
 * GET /api/movies
 *
 * Fetches a paginated list of anime movies.
 */
export async function getMovies(
  params: Omit<SeriesListParams, 'type'> = {}
): Promise<MoviesListResponse> {
  return fetchWithRetry<MoviesListResponse>(
    `/api/movies${buildQS(params as Record<string, unknown>)}`
  );
}

/**
 * GET /api/live
 *
 * Fetches all live channels, optionally filtered by sourceType.
 */
export async function getLiveChannels(source?: string): Promise<LiveResponse> {
  const qs = source ? `?source=${encodeURIComponent(source)}` : '';
  return fetchWithRetry<LiveResponse>(`/api/live${qs}`);
}

/**
 * GET /api/search
 *
 * Searches for anime. At least one of `q`, `genre`, or `source` is required.
 * Falls back to Jikan (MyAnimeList) when the backend is unavailable.
 */
export async function searchContent(
  params: SearchParams
): Promise<SearchResponse> {
  const { q, genre, source } = params;
  if (!q && !genre && !source) {
    throw new ApiClientError(
      400,
      'Provide at least one search parameter: q, genre, or source',
      false
    );
  }
  return fetchWithRetry<SearchResponse>(
    `/api/search${buildQS(params as Record<string, unknown>)}`
  );
}

/**
 * GET /api/providers
 *
 * Fetches the list of approved streaming source providers.
 */
export async function getProviders(): Promise<ProvidersResponse> {
  return fetchWithRetry<ProvidersResponse>('/api/providers');
}

/**
 * GET /api/search/suggestions?q=...
 *
 * Returns instant search suggestions for the autocomplete dropdown.
 * Returns an empty list on failure — suggestions are best-effort.
 */
export async function getSearchSuggestions(
  q: string
): Promise<SuggestResponse> {
  if (!q.trim()) return { data: [] };
  try {
    return await fetchWithRetry<SuggestResponse>(
      `/api/search/suggestions${buildQS({ q })}`
    );
  } catch {
    return { data: [] };
  }
}

/**
 * GET /api/recommendations?animeId=...&slug=...
 *
 * Returns similar anime for the given item. Accepts animeId or slug.
 */
export async function getRecommendations(params: {
  animeId?: string;
  slug?: string;
}): Promise<RecommendationsResponse> {
  const { animeId, slug } = params;
  if (!animeId && !slug) return { data: [] };
  return fetchWithRetry<RecommendationsResponse>(
    `/api/recommendations${buildQS({ animeId, slug })}`
  );
}
