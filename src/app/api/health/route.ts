/**
 * GET /api/health
 *
 * Lightweight health-check endpoint for uptime monitors (UptimeRobot, Better Uptime, etc.)
 * and load balancers.
 *
 * Returns 200 when the Next.js application layer is healthy.
 * The backend readiness check is reported separately under `backend.status` so
 * monitors can distinguish "frontend is up" from "full stack is up".
 */

import { NextResponse } from 'next/server';

import { noCache } from '@/lib/cache';

const BACKEND_URL = process.env.BACKEND_URL ?? '';

async function pingBackend(): Promise<'ok' | 'degraded' | 'unavailable'> {
  if (!BACKEND_URL) return 'unavailable';
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 3_000);
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    return res.ok ? 'ok' : 'degraded';
  } catch {
    return 'unavailable';
  }
}

export async function GET() {
  const backendStatus = await pingBackend();

  const body = {
    status: 'ok',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
    uptime: Math.floor(process.uptime?.() ?? 0),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    backend: {
      status: backendStatus,
      url: BACKEND_URL || null,
    },
  };

  return noCache(NextResponse.json(body, { status: 200 }));
}
