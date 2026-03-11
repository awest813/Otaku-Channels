/**
 * GET /api/user/profile — contract tests
 * PATCH /api/user/profile — contract tests
 *
 * Verifies that the profile proxy route correctly fetches and updates
 * the authenticated user's preferences via the backend.
 *
 * @jest-environment node
 */

import { GET, PATCH } from '@/app/api/user/profile/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

const MOCK_PROFILE = {
  id: 'profile-1',
  userId: 'user-1',
  displayName: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Anime fan',
  favoriteGenres: ['action', 'adventure'],
  language: 'en',
};

function makeGetRequest(cookie = ''): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/profile', { headers });
}

function makePatchRequest(body: Record<string, unknown>, cookie = ''): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/user/profile', {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('GET /api/user/profile', () => {
  it('returns profile data for an authenticated user', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: MOCK_PROFILE }),
    } as Response);

    const res = await GET(makeGetRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.displayName).toBe('Test User');
    expect(Array.isArray(body.data.favoriteGenres)).toBe(true);
  });

  it('forwards session cookie to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: MOCK_PROFILE }),
    } as Response);

    await GET(makeGetRequest('refresh_token=my-token') as never);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/users/me/profile');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-token');
  });

  it('uses cache: no-store to always fetch fresh profile data', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: MOCK_PROFILE }),
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
    expect(body.error).toBe('Failed to fetch profile');
  });
});

describe('PATCH /api/user/profile', () => {
  it('updates profile preferences for an authenticated user', async () => {
    const updatedProfile = {
      ...MOCK_PROFILE,
      displayName: 'Updated Name',
      bio: 'New bio',
    };
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: updatedProfile }),
    } as Response);

    const res = await PATCH(
      makePatchRequest(
        { displayName: 'Updated Name', bio: 'New bio' },
        'refresh_token=valid-token'
      ) as never
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.displayName).toBe('Updated Name');
    expect(body.data.bio).toBe('New bio');
  });

  it('forwards updated fields and session cookie to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ data: {} }),
    } as Response);

    await PATCH(
      makePatchRequest(
        { favoriteGenres: ['isekai', 'shonen'] },
        'refresh_token=my-token'
      ) as never
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/users/me/profile');
    expect(options.method).toBe('PATCH');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-token');
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody.favoriteGenres).toEqual(['isekai', 'shonen']);
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await PATCH(
      makePatchRequest({ displayName: 'Name' }, 'refresh_token=token') as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to update profile');
  });
});
