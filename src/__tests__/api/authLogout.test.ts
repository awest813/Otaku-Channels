/**
 * POST /api/auth/logout — contract tests
 *
 * Verifies that the logout route forwards the session cookie to the backend
 * for revocation and clears the refresh_token from the browser.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/logout/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(cookie = ''): Request {
  const headers: Record<string, string> = {};
  if (cookie) headers['cookie'] = cookie;
  return new Request('http://localhost/api/auth/logout', {
    method: 'POST',
    headers,
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('POST /api/auth/logout', () => {
  it('returns 200 with { ok: true } on successful logout', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    } as Response);

    const res = await POST(makeRequest('refresh_token=abc123') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('forwards cookie to backend for token revocation', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    } as Response);

    await POST(makeRequest('refresh_token=my-refresh-token') as never);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/auth/logout');
    const sentHeaders = options.headers as Record<string, string>;
    expect(sentHeaders['cookie']).toContain('refresh_token=my-refresh-token');
  });

  it('clears the refresh_token cookie in the response', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    } as Response);

    const res = await POST(makeRequest('refresh_token=abc123') as never);
    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain('refresh_token=');
    // Cookie should be expired (maxAge=0 or past date)
    expect(setCookieHeader).toMatch(/Max-Age=0|expires=Thu, 01 Jan 1970/i);
  });

  it('still clears cookie even when backend is unreachable (best-effort)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await POST(makeRequest('refresh_token=abc123') as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    // Cookie should still be cleared
    const setCookieHeader = res.headers.get('set-cookie');
    expect(setCookieHeader).toContain('refresh_token=');
  });

  it('works when called without any cookie (already logged out)', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: async () => ({}),
    } as Response);

    const res = await POST(makeRequest() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
