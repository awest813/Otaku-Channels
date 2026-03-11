import { NextRequest, NextResponse } from 'next/server';

import { attachSetCookie, getBackendUrl } from '@/lib/auth-proxy';

/**
 * POST /api/auth/login
 * Proxies to the Fastify backend and forwards the Set-Cookie header.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${getBackendUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, res.headers?.get?.('set-cookie'));

    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 502 });
  }
}
