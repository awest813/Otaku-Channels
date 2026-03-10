/**
 * Tests for admin proxy authentication guard.
 *
 * proxyAdmin() must return HTTP 401 immediately if no Authorization header
 * is present. It must not forward the request to the backend.
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { proxyAdmin } from '@/lib/admin-proxy';

// Build a minimal NextRequest-compatible mock object.
// We cannot use `new NextRequest()` in the node jest env because the
// jest setup redefines global.Request in a way that breaks NextRequest's
// constructor (url is a getter-only property on the native Request).
function adminReq(
  path: string,
  headers: Record<string, string> = {}
): NextRequest {
  const headerMap = new Headers(headers);
  return {
    url: `http://localhost${path}`,
    method: 'GET',
    headers: headerMap,
    async json() {
      return {};
    },
  } as unknown as NextRequest;
}

async function jsonBody(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describe('proxyAdmin — auth guard', () => {
  it('returns 401 when no Authorization header is present', async () => {
    const res = await proxyAdmin(adminReq('/api/admin/stats'), '/stats');
    expect(res.status).toBe(401);
  });

  it('returns an error message on 401', async () => {
    const res = await proxyAdmin(adminReq('/api/admin/stats'), '/stats');
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
    expect((body.error as string).toLowerCase()).toContain('unauthorized');
  });

  it('returns 401 even when cookie is present but no Authorization', async () => {
    const res = await proxyAdmin(
      adminReq('/api/admin/stats', { cookie: 'session=abc' }),
      '/stats'
    );
    expect(res.status).toBe(401);
  });

  it('does not return 401 when Authorization header is present (attempts proxy)', async () => {
    // With a valid Authorization header the proxy attempts to connect;
    // in test environment the backend is unreachable so we expect 502, not 401.
    const res = await proxyAdmin(
      adminReq('/api/admin/stats', { authorization: 'Bearer test-token' }),
      '/stats'
    );
    // Should be 502 (backend unreachable) or any non-401 status
    expect(res.status).not.toBe(401);
  });
});
