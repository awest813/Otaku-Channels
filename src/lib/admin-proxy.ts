/**
 * Shared proxy utility for admin API routes.
 * Forwards requests to the Fastify backend with Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function proxyAdmin(
  request: NextRequest,
  backendPath: string,
  method?: string,
): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/api/v1/admin${backendPath}${url.search}`;

    const reqMethod = method ?? request.method;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header from the client
    const auth = request.headers.get('authorization');
    if (auth) headers['Authorization'] = auth;

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
