/**
 * Tests for src/lib/api-client.ts
 *
 * Uses jest's fetch mock to verify retry logic, error handling, and
 * typed return shapes without making real HTTP requests.
 *
 * @jest-environment jsdom
 */

import {
  getLiveChannels,
  getMovies,
  getProviders,
  getSeries,
  getSeriesBySlug,
  getSeriesEpisodes,
  searchContent,
} from '@/lib/api-client';

import { ApiClientError } from '@/types/api';

// ─── fetch mock setup ─────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockOk(body: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  });
}

function mockError(status: number, message = 'Error') {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
  });
}

beforeEach(() => {
  mockFetch.mockClear();
});

// ─── getSeries ────────────────────────────────────────────────────────────────

describe('getSeries', () => {
  it('GETs /api/series and returns the response', async () => {
    const payload = { data: [], total: 0, page: 1, limit: 20 };
    mockOk(payload);

    const result = await getSeries();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/series');
    expect(result).toEqual(payload);
  });

  it('appends query params when provided', async () => {
    mockOk({ data: [], total: 0, page: 1, limit: 20 });
    await getSeries({ genre: 'action', source: 'youtube', page: 2 });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('genre=action');
    expect(url).toContain('source=youtube');
    expect(url).toContain('page=2');
  });

  it('throws ApiClientError on 4xx', async () => {
    mockError(404, 'Not found');
    await expect(getSeries()).rejects.toBeInstanceOf(ApiClientError);
  });
});

// ─── getSeriesBySlug ─────────────────────────────────────────────────────────

describe('getSeriesBySlug', () => {
  it('GETs /api/series/:slug', async () => {
    const payload = { data: { id: '1', slug: 'test', type: 'series' } };
    mockOk(payload);
    const result = await getSeriesBySlug('test');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/series/test');
    expect(result).toEqual(payload);
  });

  it('throws ApiClientError(400) when slug is empty', async () => {
    await expect(getSeriesBySlug('')).rejects.toMatchObject({ status: 400 });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── getSeriesEpisodes ───────────────────────────────────────────────────────

describe('getSeriesEpisodes', () => {
  it('GETs /api/series/:slug/episodes', async () => {
    mockOk({ data: [], total: 0 });
    await getSeriesEpisodes('test-slug');
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/series/test-slug/episodes');
  });
});

// ─── getMovies ────────────────────────────────────────────────────────────────

describe('getMovies', () => {
  it('GETs /api/movies', async () => {
    mockOk({ data: [], total: 0, page: 1, limit: 20 });
    await getMovies();
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/movies');
  });
});

// ─── getLiveChannels ─────────────────────────────────────────────────────────

describe('getLiveChannels', () => {
  it('GETs /api/live', async () => {
    mockOk({ data: [], total: 0 });
    await getLiveChannels();
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/live');
  });

  it('appends source param when provided', async () => {
    mockOk({ data: [], total: 0 });
    await getLiveChannels('pluto');
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/live?source=pluto');
  });
});

// ─── searchContent ────────────────────────────────────────────────────────────

describe('searchContent', () => {
  it('GETs /api/search with q param', async () => {
    mockOk({ data: [], total: 0, page: 1, limit: 0, query: 'naruto' });
    await searchContent({ q: 'naruto' });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain('/api/search');
    expect(url).toContain('q=naruto');
  });

  it('throws ApiClientError(400) when no params given', async () => {
    await expect(searchContent({})).rejects.toMatchObject({ status: 400 });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

// ─── getProviders ─────────────────────────────────────────────────────────────

describe('getProviders', () => {
  it('GETs /api/providers', async () => {
    mockOk({ data: [], total: 0 });
    await getProviders();
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toBe('/api/providers');
  });
});

// ─── retry logic ─────────────────────────────────────────────────────────────

describe('retry logic', () => {
  let setTimeoutSpy: jest.SpyInstance;

  beforeEach(() => {
    // Make setTimeout execute immediately so retries don't add wall-clock delay
    setTimeoutSpy = jest
      .spyOn(global, 'setTimeout')
      .mockImplementation((fn: () => void) => {
        fn();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
  });

  it('retries up to DEFAULT_RETRIES times on 500 errors then throws', async () => {
    // 3 calls total (initial + 2 retries)
    mockError(500, 'server error');
    mockError(500, 'server error');
    mockError(500, 'server error');

    await expect(getSeries()).rejects.toBeInstanceOf(ApiClientError);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry on 4xx errors', async () => {
    mockError(404, 'not found');
    await expect(getSeries()).rejects.toBeInstanceOf(ApiClientError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('succeeds on second attempt after one 500 error', async () => {
    const payload = { data: [], total: 0, page: 1, limit: 20 };
    mockError(500, 'transient error');
    mockOk(payload);

    const result = await getSeries();
    expect(result).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
