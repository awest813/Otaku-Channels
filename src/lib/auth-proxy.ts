import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

if (!process.env.BACKEND_URL && process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth-proxy] BACKEND_URL is not set; defaulting to http://localhost:3001'
  );
}

export interface ResolvedAuthHeaders {
  headers: Record<string, string>;
  refreshedAccessToken?: string;
  refreshedSetCookie?: string;
}

export function getBackendUrl(): string {
  return BACKEND_URL;
}

export function isLikelyAuthenticated(
  request: Request,
  resolved?: ResolvedAuthHeaders
): boolean {
  if (request.headers.get('authorization')) return true;
  if (resolved?.headers.authorization) return true;

  const cookie = request.headers.get('cookie') ?? '';
  return cookie.includes('refresh_token=') || cookie.includes('access_token=');
}

export function rewriteBackendSetCookie(setCookie: string): string {
  return setCookie.replace(/Path=\/api\/v1\/auth/gi, 'Path=/api');
}

export function attachSetCookie(
  response: NextResponse,
  setCookie?: string | null
): void {
  if (!setCookie) return;
  response.headers.append('set-cookie', rewriteBackendSetCookie(setCookie));
}

export async function resolveAuthHeaders(
  request: Request,
  options?: { refresh?: boolean }
): Promise<ResolvedAuthHeaders> {
  const cookie = request.headers.get('cookie') ?? '';
  const incomingAuth = request.headers.get('authorization');

  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  if (incomingAuth) {
    headers.authorization = incomingAuth;
    return { headers };
  }

  if (!options?.refresh || !cookie.includes('refresh_token=')) {
    return { headers };
  }

  try {
    const refreshRes = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      return { headers };
    }

    const body = (await refreshRes.json().catch(() => ({}))) as {
      accessToken?: string;
    };
    const refreshedAccessToken =
      typeof body.accessToken === 'string' ? body.accessToken : undefined;

    if (refreshedAccessToken) {
      headers.authorization = `Bearer ${refreshedAccessToken}`;
    }

    return {
      headers,
      refreshedAccessToken,
      refreshedSetCookie: refreshRes.headers?.get?.('set-cookie') ?? undefined,
    };
  } catch {
    return { headers };
  }
}
