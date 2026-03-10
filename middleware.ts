/**
 * Next.js Edge Middleware
 *
 * Responsibilities:
 *  1. Security headers on every response (CSP, HSTS, X-Frame-Options, etc.)
 *  2. Lightweight in-process rate limiting for auth routes (prevents brute-force
 *     when the backend is behind this Next.js layer).
 *
 * Note: For production deployments on Vercel, set up a Redis-backed rate limiter
 * (e.g. @upstash/ratelimit) to share state across edge nodes. The simple counter
 * below is intentionally stateless per-instance and acts as a first line of defence.
 */

import { type NextRequest, NextResponse } from 'next/server';

// ─── Simple in-process sliding-window counter ────────────────────────────────
// Key: IP address  Value: { count, windowStart }
//
// IMPORTANT: This counter is local to the Node.js process — it resets on every
// restart/deployment and provides no protection against distributed attacks
// spread across multiple Vercel edge nodes. For production-grade rate limiting
// across all instances use a shared store, e.g. @upstash/ratelimit with Redis.
const authAttempts = new Map<string, { count: number; windowStart: number }>();

/** Max auth attempts per IP per window */
const AUTH_RATE_LIMIT_MAX = 20;
/** Window duration in milliseconds */
const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1_000; // 15 minutes

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = authAttempts.get(ip);

  if (!entry || now - entry.windowStart >= AUTH_RATE_LIMIT_WINDOW_MS) {
    // New window
    authAttempts.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > AUTH_RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// ─── Security header values ───────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  // Prevent embedding in iframes (clickjacking)
  'X-Frame-Options': 'SAMEORIGIN',
  // Disable MIME-type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy — disable features not needed
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const HSTS_HEADER = 'max-age=63072000; includeSubDomains; preload';

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate-limit auth mutations ────────────────────────────────────────────
  const isAuthMutation =
    (pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/register')) &&
    request.method === 'POST';

  if (isAuthMutation) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (isAuthRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests. Please wait before trying again.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(AUTH_RATE_LIMIT_WINDOW_MS / 1_000)),
          },
        }
      );
    }
  }

  // ── Apply security headers ───────────────────────────────────────────────
  const response = NextResponse.next();

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // HSTS only over HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', HSTS_HEADER);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
