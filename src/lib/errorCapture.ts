/**
 * Error capture / monitoring integration.
 *
 * When NEXT_PUBLIC_SENTRY_DSN is set this module delegates to @sentry/nextjs
 * (installed separately via `pnpm add @sentry/nextjs`).
 * Without a DSN it falls back to structured logging so nothing is silently lost.
 *
 * Usage:
 *   import { captureException, captureMessage } from '@/lib/errorCapture';
 *   captureException(err, { route: '/api/series' });
 */

import { serverLogger } from './serverLogger';

interface CaptureContext {
  [key: string]: unknown;
}

interface SentryModule {
  captureException: (e: unknown, ctx?: unknown) => void;
  captureMessage: (m: string, lvl?: string, ctx?: unknown) => void;
}

/** Attempt to load @sentry/nextjs; returns null if not installed. */
async function loadSentry(): Promise<SentryModule | null> {
  try {
    // Dynamic import so the module compiles even when @sentry/nextjs is absent
    const mod = await import('@sentry/nextjs' as string);
    return mod as unknown as SentryModule;
  } catch {
    return null;
  }
}

/**
 * Capture an exception. Logs to stderr if no Sentry DSN is configured.
 */
export async function captureException(
  err: unknown,
  context?: CaptureContext
): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (dsn) {
    const Sentry = await loadSentry();
    if (Sentry) {
      Sentry.captureException(err, { extra: context });
      return;
    }
  }

  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  serverLogger.error(message, { ...context, stack });
}

/**
 * Capture a plain message (e.g. a warning or non-exception event).
 */
export async function captureMessage(
  msg: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: CaptureContext
): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (dsn) {
    const Sentry = await loadSentry();
    if (Sentry) {
      Sentry.captureMessage(msg, level, { extra: context });
      return;
    }
  }

  const logLevel = level === 'warning' ? 'warn' : level;
  serverLogger[logLevel](msg, context);
}
