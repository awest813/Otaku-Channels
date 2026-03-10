import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * GET /api/auth/me
 * Forwards the refresh_token cookie to the backend to fetch the
 * current authenticated user. Returns 401 when not logged in.
 */
export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: { cookie },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
