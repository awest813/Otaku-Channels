/**
 * POST /api/auth/register — contract tests
 *
 * Verifies that the registration proxy route correctly forwards new-user data
 * to the backend, propagates cookies, and returns appropriate error responses.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/register/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('POST /api/auth/register', () => {
  it('returns 201 with user data on successful registration', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      headers: new Headers({
        'set-cookie': 'refresh_token=newtoken; HttpOnly',
      }),
      json: async () => ({
        user: {
          id: 'new-user-1',
          email: 'newuser@example.com',
          username: 'newuser',
        },
        accessToken: 'new-access-token',
      }),
    } as Response);

    const res = await POST(
      makeRequest({
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      }) as never
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe('newuser@example.com');
    expect(body.accessToken).toBe('new-access-token');
  });

  it('forwards registration data to the backend', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      headers: new Headers(),
      json: async () => ({ user: {}, accessToken: 'token' }),
    } as Response);

    await POST(
      makeRequest({
        email: 'user@example.com',
        password: 'secret',
        username: 'user',
      }) as never
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/register');
    expect(options.method).toBe('POST');
    const sentBody = JSON.parse(options.body as string);
    expect(sentBody.email).toBe('user@example.com');
    expect(sentBody.username).toBe('user');
  });

  it('forwards Set-Cookie header from backend after registration', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 201,
      headers: new Headers({
        'set-cookie': 'refresh_token=xyz789; HttpOnly; Path=/api/v1/auth',
      }),
      json: async () => ({ user: {}, accessToken: 'token' }),
    } as Response);

    const res = await POST(
      makeRequest({
        email: 'new@example.com',
        password: 'pass',
        username: 'new',
      }) as never
    );
    expect(res.headers.get('set-cookie')).toContain('refresh_token=xyz789');
  });

  it('returns 409 when email is already registered', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 409,
      headers: new Headers(),
      json: async () => ({ error: 'Email already in use' }),
    } as Response);

    const res = await POST(
      makeRequest({
        email: 'existing@example.com',
        password: 'pass',
        username: 'existing',
      }) as never
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns 422 for invalid registration data', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 422,
      headers: new Headers(),
      json: async () => ({ error: 'Password too short' }),
    } as Response);

    const res = await POST(
      makeRequest({ email: 'test@example.com', password: '123' }) as never
    );
    expect(res.status).toBe(422);
  });

  it('returns 502 when backend is unreachable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await POST(
      makeRequest({
        email: 'test@example.com',
        password: 'pass',
        username: 'test',
      }) as never
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Registration failed');
  });
});
