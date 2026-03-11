/**
 * GET /api/auth/me — contract tests
 *
 * Verifies that the /me proxy route correctly forwards the session cookie
 * to the backend and returns the authenticated user or 401 when not logged in.
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/auth/me/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(cookie = ''): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/auth/me', { headers });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user data when authenticated', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({
        user: {
          id: 'user-1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user',
        },
      }),
    } as Response);

    const res = await GET(makeRequest('refresh_token=valid-token') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('test@example.com');
    expect(body.user.username).toBe('testuser');
  });

  it('forwards session cookie to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ user: {} }),
    } as Response);

    await GET(
      makeRequest('refresh_token=my-token; access_token=my-access') as never
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/me');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-token');
  });

  it('returns 401 when backend responds with 401 (not logged in)', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response);

    const res = await GET(makeRequest() as never);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 401 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await GET(makeRequest() as never);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('uses cache: no-store to always fetch fresh user data', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({ user: { id: 'user-1' } }),
    } as Response);

    await GET(makeRequest('refresh_token=token') as never);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.cache).toBe('no-store');
  });
});
