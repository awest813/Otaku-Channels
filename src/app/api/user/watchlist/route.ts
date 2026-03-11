import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  isLikelyAuthenticated,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

/**
 * GET /api/user/watchlist
 * Returns the authenticated user's default watchlist items.
 *
 * POST /api/user/watchlist
 * Adds an item to the user's watchlist.
 *
 * DELETE /api/user/watchlist?animeId=<id>
 * Removes an item from the user's watchlist.
 *
 * The backend uses a full watchlist model (named lists with items).
 * This route uses the first (default) watchlist returned by the backend.
 */
async function resolveDefaultListId(
  authHeaders: Record<string, string>
): Promise<string | Response> {
  const listRes = await fetch(`${getBackendUrl()}/api/v1/watchlists`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!listRes.ok) return listRes;

  const lists = (await listRes.json()) as {
    data: Array<{ id: string; name: string }>;
  };

  if (lists.data.length === 0) {
    const createRes = await fetch(`${getBackendUrl()}/api/v1/watchlists`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My List' }),
    });
    if (!createRes.ok) return createRes;
    const created = (await createRes.json()) as { data: { id: string } };
    return created.data.id;
  }

  return lists.data[0].id;
}

async function forwardToBackend(
  method: string,
  authHeaders: Record<string, string>,
  body?: unknown
) {
  const idOrResponse = await resolveDefaultListId(authHeaders);

  // If it's a Response object, propagate the error
  if (typeof idOrResponse !== 'string') return idOrResponse;
  const defaultListId = idOrResponse;

  if (method === 'GET') {
    return fetch(`${getBackendUrl()}/api/v1/watchlists/${defaultListId}`, {
      headers: authHeaders,
      cache: 'no-store',
    });
  }

  // POST — add item
  return fetch(`${getBackendUrl()}/api/v1/watchlists/${defaultListId}/items`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function GET(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await forwardToBackend('GET', auth.headers);
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
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
    const res = await forwardToBackend('POST', auth.headers, body);
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 502 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);
  if (!isLikelyAuthenticated(request, auth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId');
  if (!animeId) {
    return NextResponse.json({ error: 'Missing animeId' }, { status: 400 });
  }
  try {
    const idOrResponse = await resolveDefaultListId(auth.headers);
    if (typeof idOrResponse !== 'string') {
      const data = await idOrResponse.json();
      const response = NextResponse.json(data, { status: idOrResponse.status });
      attachSetCookie(response, auth.refreshedSetCookie);
      attachSetCookie(response, idOrResponse.headers?.get?.('set-cookie'));
      return response;
    }
    const res = await fetch(
      `${getBackendUrl()}/api/v1/watchlists/${idOrResponse}/items/${animeId}`,
      { method: 'DELETE', headers: auth.headers }
    );
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 502 }
    );
  }
}
