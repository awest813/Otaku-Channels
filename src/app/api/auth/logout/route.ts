import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * POST /api/auth/logout
 * Forwards the refresh_token cookie to the backend for revocation,
 * then clears it from the browser.
 */
export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';

  try {
    await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { cookie },
    });
  } catch {
    // best-effort — still clear the cookie on the client
  }

  const response = NextResponse.json({ ok: true });
  // Expire the refresh token cookie
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    path: '/api/v1/auth',
    maxAge: 0,
  });
  return response;
}
