/**
 * GET /api/user/watchlist — contract tests
 * POST /api/user/watchlist — contract tests
 *
 * Verifies that the watchlist proxy route correctly handles authentication,
 * fetches/creates the default watchlist, and manages items.
 *
 * @jest-environment node
 */

import { GET, POST } from '@/app/api/user/watchlist/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

const MOCK_WATCHLIST_ID = 'list-123';
const MOCK_WATCHLIST_ITEM = {
  id: 'item-1',
  animeId: 'anime-abc',
  title: 'Demon Slayer',
  addedAt: '2024-01-01T00:00:00.000Z',
};

function makeGetRequest(cookie = ''): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/watchlist', { headers });
}

function makePostRequest(body: Record<string, unknown>, cookie = ''): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/watchlist', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('GET /api/user/watchlist', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await GET(makeGetRequest() as never);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns watchlist items for an authenticated user', async () => {
    // First call: get watchlists
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: MOCK_WATCHLIST_ID, name: 'My List' }],
      }),
    } as Response);

    // Second call: get watchlist items
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          id: MOCK_WATCHLIST_ID,
          name: 'My List',
          items: [MOCK_WATCHLIST_ITEM],
        },
      }),
    } as Response);

    const res = await GET(makeGetRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].title).toBe('Demon Slayer');
  });

  it('creates a default watchlist when user has none', async () => {
    // First call: get watchlists (empty)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);

    // Second call: create default watchlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: { id: 'new-list-id', name: 'My List' },
      }),
    } as Response);

    // Third call: get the newly created watchlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: { id: 'new-list-id', name: 'My List', items: [] },
      }),
    } as Response);

    const res = await GET(makeGetRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(200);

    // Verify the create call was made with 'My List'
    const createCall = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(createCall[1].method).toBe('POST');
    const createBody = JSON.parse(createCall[1].body as string);
    expect(createBody.name).toBe('My List');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await GET(makeGetRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

describe('POST /api/user/watchlist', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await POST(makePostRequest({ animeId: 'anime-123' }) as never);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('adds an item to the watchlist for an authenticated user', async () => {
    // First call: get watchlists
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: MOCK_WATCHLIST_ID, name: 'My List' }],
      }),
    } as Response);

    // Second call: add item to watchlist
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: 'item-new',
          animeId: 'anime-123',
          addedAt: new Date().toISOString(),
        },
      }),
    } as Response);

    const res = await POST(
      makePostRequest(
        { animeId: 'anime-123' },
        'refresh_token=valid-token'
      ) as never
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.animeId).toBe('anime-123');
  });

  it('posts to the correct watchlist items endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: MOCK_WATCHLIST_ID, name: 'My List' }],
      }),
    } as Response);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ data: {} }),
    } as Response);

    await POST(
      makePostRequest({ animeId: 'anime-999' }, 'refresh_token=tok') as never
    );

    const itemsCall = mockFetch.mock.calls[1] as [string, RequestInit];
    expect(itemsCall[0]).toContain(
      `/api/v1/watchlists/${MOCK_WATCHLIST_ID}/items`
    );
    expect(itemsCall[1].method).toBe('POST');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await POST(
      makePostRequest(
        { animeId: 'anime-123' },
        'refresh_token=valid-token'
      ) as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
