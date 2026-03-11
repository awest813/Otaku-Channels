import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

/**
 * GET /api/auth/me
 * Forwards the refresh_token cookie to the backend to fetch the
 * current authenticated user. Returns 401 when not logged in.
 */
export async function GET(request: NextRequest) {
  try {
    const initialAuth = await resolveAuthHeaders(request);
    let auth = initialAuth;
    let res = await fetch(`${getBackendUrl()}/api/v1/auth/me`, {
      headers: auth.headers,
      cache: 'no-store',
    });

    const cookie = request.headers.get('cookie') ?? '';
    if (
      res.status === 401 &&
      !initialAuth.headers.authorization &&
      cookie.includes('refresh_token=')
    ) {
      const refreshedAuth = await resolveAuthHeaders(request, {
        refresh: true,
      });
      if (refreshedAuth.headers.authorization) {
        auth = refreshedAuth;
        res = await fetch(`${getBackendUrl()}/api/v1/auth/me`, {
          headers: auth.headers,
          cache: 'no-store',
        });
      }
    }

    const data = (await res.json().catch(() => ({}))) as {
      user?: unknown;
      error?: string;
      accessToken?: string;
    };

    const response = NextResponse.json(
      {
        ...data,
        ...(auth.refreshedAccessToken
          ? { accessToken: auth.refreshedAccessToken }
          : {}),
      },
      { status: res.status }
    );

    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
