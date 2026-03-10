import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile.
 *
 * PATCH /api/user/profile
 * Updates the authenticated user's profile preferences.
 */
export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me/profile`, {
      headers: { cookie },
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 502 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/v1/users/me/profile`, {
      method: 'PATCH',
      headers: { cookie, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 502 }
    );
  }
}
