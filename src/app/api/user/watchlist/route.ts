import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

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
async function resolveDefaultListId(cookie: string): Promise<string | Response> {
  const listRes = await fetch(`${BACKEND_URL}/api/v1/watchlists`, {
    headers: { cookie, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!listRes.ok) return listRes;

  const lists = (await listRes.json()) as {
    data: Array<{ id: string; name: string }>;
  };

  if (lists.data.length === 0) {
    const createRes = await fetch(`${BACKEND_URL}/api/v1/watchlists`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My List' }),
    });
    if (!createRes.ok) return createRes;
    const created = (await createRes.json()) as { data: { id: string } };
    return created.data.id;
  }

  return lists.data[0].id;
}

async function forwardToBackend(
  request: NextRequest,
  method: string,
  body?: unknown
) {
  const cookie = request.headers.get('cookie') ?? '';
  const idOrResponse = await resolveDefaultListId(cookie);

  // If it's a Response object, propagate the error
  if (typeof idOrResponse !== 'string') return idOrResponse;
  const defaultListId = idOrResponse;

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
  const cookie = request.headers.get('cookie') ?? '';
  if (!cookie.includes('refresh_token') && !cookie.includes('access_token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

export async function DELETE(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  if (!cookie.includes('refresh_token') && !cookie.includes('access_token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId');
  if (!animeId) {
    return NextResponse.json({ error: 'Missing animeId' }, { status: 400 });
  }
  try {
    const idOrResponse = await resolveDefaultListId(cookie);
    if (typeof idOrResponse !== 'string') {
      const data = await idOrResponse.json();
      return NextResponse.json(data, { status: idOrResponse.status });
    }
    const res = await fetch(
      `${BACKEND_URL}/api/v1/watchlists/${idOrResponse}/items/${animeId}`,
      { method: 'DELETE', headers: { cookie } }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 502 }
    );
  }
}
