/**
 * POST /api/auth/login — contract tests
 *
 * Verifies that the login proxy route correctly forwards credentials to the
 * backend, propagates cookies, and returns appropriate error responses.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/login/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('POST /api/auth/login', () => {
  it('returns 200 with user data on successful login', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      json: async () => ({
        user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
        accessToken: 'mock-access-token',
      }),
    } as Response);

    const res = await POST(
      makeRequest({
        email: 'test@example.com',
        password: 'password123',
      }) as never
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('test@example.com');
    expect(body.accessToken).toBe('mock-access-token');
  });

  it('forwards credentials to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers(),
      json: async () => ({ user: {}, accessToken: 'token' }),
    } as Response);

    await POST(
      makeRequest({ email: 'user@example.com', password: 'secret' }) as never
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/login');
    expect(options.method).toBe('POST');
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody.email).toBe('user@example.com');
  });

  it('forwards Set-Cookie header from backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      headers: new Headers({
        'set-cookie': 'refresh_token=abc123; HttpOnly; Path=/api/v1/auth',
      }),
      json: async () => ({ user: {}, accessToken: 'token' }),
    } as Response);

    const res = await POST(
      makeRequest({ email: 'test@example.com', password: 'pass' }) as never
    );
    expect(res.headers.get('set-cookie')).toContain('refresh_token=abc123');
  });

  it('returns 401 when backend returns 401 for wrong credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 401,
      headers: new Headers(),
      json: async () => ({ error: 'Invalid email or password' }),
    } as Response);

    const res = await POST(
      makeRequest({ email: 'wrong@example.com', password: 'wrong' }) as never
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await POST(
      makeRequest({ email: 'test@example.com', password: 'pass' }) as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Login failed');
  });
});
