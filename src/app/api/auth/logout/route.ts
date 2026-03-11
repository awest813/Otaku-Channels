import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

/**
 * POST /api/auth/logout
 * Forwards the refresh_token cookie to the backend for revocation,
 * then clears it from the browser.
 */
export async function POST(request: NextRequest) {
  const auth = await resolveAuthHeaders(request);

  try {
    await fetch(`${getBackendUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: auth.headers,
    });
  } catch {
    // best-effort — still clear the cookie on the client
  }

  const response = NextResponse.json({ ok: true });
  attachSetCookie(response, auth.refreshedSetCookie);

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append(
    'set-cookie',
    `refresh_token=; Path=/api; HttpOnly; Max-Age=0; SameSite=Lax${secure}`
  );
  response.headers.append(
    'set-cookie',
    `refresh_token=; Path=/api/v1/auth; HttpOnly; Max-Age=0; SameSite=Lax${secure}`
  );

  return response;
}
