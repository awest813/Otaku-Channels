/**
 * Shared proxy utility for admin API routes.
 * Forwards requests to the Fastify backend with Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  attachSetCookie,
  getBackendUrl,
  resolveAuthHeaders,
} from '@/lib/auth-proxy';

export async function proxyAdmin(
  request: NextRequest,
  backendPath: string,
  method?: string
): Promise<NextResponse> {
  try {
    const auth = await resolveAuthHeaders(request);
    const url = new URL(request.url);
    const targetUrl = `${getBackendUrl()}/api/v1/admin${backendPath}${
      url.search
    }`;

    const reqMethod = method ?? request.method;
    const headers: Record<string, string> = { ...auth.headers };
    headers['Content-Type'] = 'application/json';

    // Forward Authorization header from the client
    if (!headers.authorization) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const response = NextResponse.json(data, { status: res.status });
    attachSetCookie(response, auth.refreshedSetCookie);
    attachSetCookie(response, res.headers?.get?.('set-cookie'));
    return response;
  } catch {
    return NextResponse.json({ error: 'Admin proxy error' }, { status: 502 });
  }
}
