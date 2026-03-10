/**
 * Shared API response types for all Next.js route handlers.
 *
 * These mirror the JSON shapes returned by /api/* so that
 * api-client.ts, route handlers, and page components all speak
 * the same contract.
 */

import type {
  AnimeSeries,
  Episode,
  LiveChannel,
  Movie,
  SourceProvider,
} from '@/types';

// ─── Data mode ───────────────────────────────────────────────────────────────

/**
 * Controls where each API route fetches its data.
 *
 * Set via the DATA_MODE environment variable (server-side only):
 *   mock    — always return static mock data; never contact the backend
 *   backend — always call the Fastify backend; return 502 if unavailable
 *   hybrid  — try the backend first; fall back to mock data on failure (default)
 */
export type DataMode = 'mock' | 'backend' | 'hybrid';

// ─── Generic envelopes ────────────────────────────────────────────────────────

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Single-item response */
export interface SingleResponse<T> {
  data: T;
}

/** Error response */
export interface ApiErrorResponse {
  error: string;
}

// ─── Route-specific response shapes ──────────────────────────────────────────

/** GET /api/series */
export type SeriesListResponse = PaginatedResponse<AnimeSeries | Movie>;

/** GET /api/series/:slug */
export type SeriesDetailResponse = SingleResponse<AnimeSeries | Movie>;

/** GET /api/series/:slug/episodes */
export interface EpisodesResponse {
  data: Episode[];
  total: number;
}

/** GET /api/movies */
export type MoviesListResponse = PaginatedResponse<AnimeSeries | Movie>;

/** GET /api/live */
export interface LiveResponse {
  data: LiveChannel[];
  total: number;
}

/** GET /api/search */
export interface SearchResponse extends PaginatedResponse<AnimeSeries | Movie> {
  query: string;
  /** Indicates where the results came from: backend, jikan, or mock */
  source?: 'backend' | 'jikan' | 'mock';
}

/** GET /api/providers */
export interface ProvidersResponse {
  data: SourceProvider[];
  total: number;
}

// ─── API client params ────────────────────────────────────────────────────────

export interface SeriesListParams {
  genre?: string;
  source?: string;
  language?: string;
  tag?: string;
  type?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchParams {
  q?: string;
  genre?: string;
  source?: string;
  type?: string;
  year?: number;
  season?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// ─── Client error ─────────────────────────────────────────────────────────────

/**
 * Typed error thrown by api-client.ts when a fetch fails or the server
 * responds with a non-2xx status.
 */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Whether it is safe to retry this error */
    public readonly retryable: boolean = status >= 500
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
