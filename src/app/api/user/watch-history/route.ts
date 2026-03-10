import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * GET /api/user/watch-history
 * Returns the authenticated user's watch history (recently viewed).
 *
 * POST /api/user/watch-history
 * Records a new watch event.
 */
export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/watch-history`, {
      headers: { cookie },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch watch history' },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/watch-history`, {
      method: 'POST',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to record watch history' },
      { status: 502 }
    );
  }
}
