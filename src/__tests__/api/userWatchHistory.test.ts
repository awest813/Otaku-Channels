/**
 * GET /api/user/watch-history — contract tests
 * POST /api/user/watch-history — contract tests
 *
 * Verifies that the watch-history proxy route correctly proxies requests
 * to the backend with the session cookie.
 *
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/user/watch-history/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

const MOCK_HISTORY_ITEM = {
  id: 'hist-1',
  animeId: 'anime-abc',
  seriesSlug: 'demon-slayer',
  episodeId: 'ep-1',
  watchedAt: '2024-01-15T10:00:00.000Z',
  progress: 85,
};

function makeGetRequest(cookie = ''): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/watch-history', { headers });
}

function makePostRequest(body: Record<string, unknown>, cookie = ''): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/watch-history', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('GET /api/user/watch-history', () => {
  it('returns watch history items for an authenticated user', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        data: [MOCK_HISTORY_ITEM],
        total: 1,
      }),
    } as Response);

    const res = await GET(makeGetRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].seriesSlug).toBe('demon-slayer');
  });

  it('forwards session cookie to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: [], total: 0 }),
    } as Response);

    await GET(makeGetRequest('refresh_token=my-token') as never);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/watch-history');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-token');
  });

  it('uses cache: no-store for fresh history data', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: [], total: 0 }),
    } as Response);

    await GET(makeGetRequest('refresh_token=token') as never);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.cache).toBe('no-store');
  });

  it('returns 401 when backend returns 401 (not authenticated)', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response);

    const res = await GET(makeGetRequest() as never);
    expect(res.status).toBe(401);
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await GET(makeGetRequest('refresh_token=token') as never);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch watch history');
  });
});

describe('POST /api/user/watch-history', () => {
  it('records a watch event for an authenticated user', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: async () => ({
        data: { ...MOCK_HISTORY_ITEM, id: 'hist-new' },
      }),
    } as Response);

    const res = await POST(
      makePostRequest(
        { seriesSlug: 'demon-slayer', episodeId: 'ep-5', progress: 45 },
        'refresh_token=valid-token'
      ) as never
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.seriesSlug).toBe('demon-slayer');
  });

  it('forwards session cookie and watch data to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      json: async () => ({ data: {} }),
    } as Response);

    await POST(
      makePostRequest(
        { seriesSlug: 'naruto', episodeId: 'ep-1', progress: 100 },
        'refresh_token=my-token'
      ) as never
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/watch-history');
    expect(options.method).toBe('POST');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-token');
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody.seriesSlug).toBe('naruto');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await POST(
      makePostRequest(
        { seriesSlug: 'demon-slayer', episodeId: 'ep-1' },
        'refresh_token=token'
      ) as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to record watch history');
  });
});
