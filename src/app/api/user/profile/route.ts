import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  isLikelyAuthenticated,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile.
 *
 * PATCH /api/user/profile
 * Updates the authenticated user's profile preferences.
 */
export async function GET(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/users/me/profile`, {
      headers: auth.headers,
      cache: 'no-store',
    });
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 502 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${getBackendUrl()}/api/v1/users/me/profile`, {
      method: 'PATCH',
      headers: { ...auth.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 502 }
    );
  }
}
