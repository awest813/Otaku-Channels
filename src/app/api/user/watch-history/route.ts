import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  isLikelyAuthenticated,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

/**
 * GET /api/user/watch-history
 * Returns the authenticated user's watch history (recently viewed).
 *
 * POST /api/user/watch-history
 * Records a new watch event.
 */
export async function GET(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/watch-history`, {
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
      { error: 'Failed to fetch watch history' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${getBackendUrl()}/api/v1/watch-history`, {
      method: 'POST',
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
      { error: 'Failed to record watch history' },
      { status: 502 }
    );
  }
}
