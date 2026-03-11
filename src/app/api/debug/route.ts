/**
 * GET /api/debug
 *
 * Development-only diagnostics endpoint.
 * Returns the active configuration, data mode, and backend reachability so
 * you can quickly confirm your environment is wired up correctly.
 *
 * This route returns 404 in production (NODE_ENV=production).
 */

import { NextResponse } from 'next/server';

import { noCache } from '@/lib/cache';
import { getDataMode } from '@/lib/data-mode';

const BACKEND_URL = process.env.BACKEND_URL ?? '';

async function pingBackend(): Promise<{
  status: 'ok' | 'degraded' | 'unavailable';
  latencyMs: number | null;
  detail: string;
}> {
  if (!BACKEND_URL) {
    return {
      status: 'unavailable',
      latencyMs: null,
      detail: 'BACKEND_URL is not set',
    };
  }

  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 3_000);
    const res = await fetch(`${BACKEND_URL}/health`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        status: 'ok',
        latencyMs,
        detail: `HTTP ${res.status} — uptime ${body?.uptime ?? '?'}s`,
      };
    }

    return {
      status: 'degraded',
      latencyMs,
      detail: `HTTP ${res.status}`,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 'unavailable',
      latencyMs,
      detail: msg.includes('abort') ? 'Timed out after 3 s' : msg,
    };
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const dataMode = getDataMode();
  const backend = await pingBackend();

  const env = {
    NODE_ENV: process.env.NODE_ENV ?? '(unset)',
    DATA_MODE: process.env.DATA_MODE ?? '(unset — resolved to ' + dataMode + ')',
    BACKEND_URL: BACKEND_URL || '(unset)',
    WAIFUPICS_BASE_URL: process.env.WAIFUPICS_BASE_URL ?? '(unset)',
    ANIMECHAN_BASE_URL: process.env.ANIMECHAN_BASE_URL ?? '(unset)',
    NEXT_PUBLIC_SHOW_LOGGER: process.env.NEXT_PUBLIC_SHOW_LOGGER ?? '(unset)',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '(unset)',
  };

  const hints: string[] = [];

  if (dataMode === 'mock' && !BACKEND_URL) {
    hints.push(
      'Running in mock mode — no backend needed. ' +
        'To connect to the Fastify backend, set BACKEND_URL=http://localhost:3001 in .env.local'
    );
  }

  if (dataMode !== 'mock' && backend.status === 'unavailable') {
    hints.push(
      `Backend is unreachable at ${BACKEND_URL}. ` +
        'Make sure you ran: cd backend && npm run dev'
    );
    if (dataMode === 'hybrid') {
      hints.push('DATA_MODE=hybrid — falling back to mock data automatically.');
    }
    if (dataMode === 'backend') {
      hints.push(
        'DATA_MODE=backend (strict) — API calls will return 502 until the backend is running.'
      );
    }
  }

  if (backend.status === 'ok' && dataMode === 'mock') {
    hints.push(
      'Backend is reachable but DATA_MODE=mock is forcing mock data. ' +
        'Change DATA_MODE to hybrid or backend in .env.local to use it.'
    );
  }

  const body = {
    dataMode,
    backend,
    env,
    hints,
    timestamp: new Date().toISOString(),
  };

  return noCache(NextResponse.json(body, { status: 200 }));
}
