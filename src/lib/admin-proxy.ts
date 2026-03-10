/**
 * Shared proxy utility for admin API routes.
 * Forwards requests to the Fastify backend with Authorization header.
 *
 * Security: Returns HTTP 401 immediately if no Authorization header is present.
 * The Fastify backend also independently enforces JWT auth on all admin routes
 * (defense-in-depth).
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (() => {
  const url = process.env.BACKEND_URL;
  if (!url) {
    // eslint-disable-next-line no-console
    console.warn(
      '[admin-proxy] BACKEND_URL is not set — falling back to http://localhost:3001.'
    );
    return 'http://localhost:3001';
  }
  return url;
})();

export async function proxyAdmin(
  request: NextRequest,
  backendPath: string,
  method?: string
): Promise<NextResponse> {
  // Enforce auth at the Next.js layer before proxying to the backend.
  const auth = request.headers.get('authorization');
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized — Authorization header required' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/api/v1/admin${backendPath}${url.search}`;

    const reqMethod = method ?? request.method;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: auth,
    };

    // Forward cookie (refresh_token) for server-side calls
    const cookie = request.headers.get('cookie');
    if (cookie) headers['Cookie'] = cookie;

    const init: RequestInit = { method: reqMethod, headers };

    if (reqMethod !== 'GET' && reqMethod !== 'HEAD') {
      try {
        const body = await request.json();
        init.body = JSON.stringify(body);
      } catch {
        // no body
      }
    }

    const res = await fetch(targetUrl, init);
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Admin proxy error' }, { status: 502 });
  }
}
