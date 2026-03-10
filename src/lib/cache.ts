/**
 * Cache-control helpers for Next.js API route handlers.
 *
 * These helpers return `NextResponse` instances with the correct
 * Cache-Control (and related) headers applied.
 *
 * Usage:
 *   return cacheFor(60, NextResponse.json(data));        // public, 60 s
 *   return noCache(NextResponse.json(userData));         // private, no-store
 *   return staleWhileRevalidate(300, NextResponse.json(data)); // SWR pattern
 */

import { NextResponse } from 'next/server';

/**
 * Public cacheable response.
 * Sets `Cache-Control: public, s-maxage=<seconds>, stale-while-revalidate=<seconds/2>`.
 */
export function cacheFor(seconds: number, res: NextResponse): NextResponse {
  res.headers.set(
    'Cache-Control',
    `public, s-maxage=${seconds}, stale-while-revalidate=${Math.floor(
      seconds / 2
    )}`
  );
  return res;
}

/**
 * Private, uncacheable response (user-specific data).
 * Sets `Cache-Control: private, no-store`.
 */
export function noCache(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

/**
 * Stale-while-revalidate pattern.
 * Sets `Cache-Control: public, max-age=0, s-maxage=<seconds>, stale-while-revalidate=<swrSeconds>`.
 */
export function staleWhileRevalidate(
  seconds: number,
  res: NextResponse,
  swrSeconds = seconds
): NextResponse {
  res.headers.set(
    'Cache-Control',
    `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${swrSeconds}`
  );
  return res;
}
