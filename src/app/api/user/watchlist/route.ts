import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * GET /api/user/watchlist
 * Returns the authenticated user's default watchlist items.
 *
 * POST /api/user/watchlist
 * Adds an item to the user's watchlist.
 *
 * The backend uses a full watchlist model (named lists with items).
 * This route uses the first (default) watchlist returned by the backend.
 */
async function forwardToBackend(
  request: NextRequest,
  method: string,
  body?: unknown
) {
  const cookie = request.headers.get('cookie') ?? '';

  // Get the user's watchlists
  const listRes = await fetch(`${BACKEND_URL}/api/v1/watchlists`, {
    headers: { cookie, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!listRes.ok) {
    return listRes;
  }

  const lists = (await listRes.json()) as {
    data: Array<{ id: string; name: string }>;
  };

  let defaultListId: string;

  if (lists.data.length === 0) {
    // Create a default watchlist
    const createRes = await fetch(`${BACKEND_URL}/api/v1/watchlists`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My List' }),
    });
    if (!createRes.ok) return createRes;
    const created = (await createRes.json()) as { data: { id: string } };
    defaultListId = created.data.id;
  } else {
    defaultListId = lists.data[0].id;
  }

  if (method === 'GET') {
    return fetch(`${BACKEND_URL}/api/v1/watchlists/${defaultListId}`, {
      headers: { cookie },
      cache: 'no-store',
    });
  }

  // POST — add item
  return fetch(`${BACKEND_URL}/api/v1/watchlists/${defaultListId}/items`, {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  if (!cookie.includes('refresh_token') && !cookie.includes('access_token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const res = await forwardToBackend(request, 'GET');
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await forwardToBackend(request, 'POST', body);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 502 }
    );
  }
}
