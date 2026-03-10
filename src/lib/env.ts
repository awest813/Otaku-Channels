/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Configuration for type-safe environment variables.
 * Imported through src/app/page.tsx
 * @see https://x.com/mattpocockuk/status/1760991147793449396
 */
import { z } from 'zod';

const envVariables = z.object({
  // ── Development tools ──────────────────────────────────────────────────────
  NEXT_PUBLIC_SHOW_LOGGER: z.enum(['true', 'false']).optional(),

  // ── App version (injected by CI/CD) ────────────────────────────────────────
  NEXT_PUBLIC_APP_VERSION: z.string().optional(),

  // ── Backend ────────────────────────────────────────────────────────────────
  // Server-side only — used by Next.js route handlers to proxy to the Fastify backend
  BACKEND_URL: z.string().url().optional(),

  /**
   * Controls the data source used by Next.js API route handlers.
   *   mock    — always return static mock data; never contact the backend
   *   backend — always call the Fastify backend; 502 if unavailable
   *   hybrid  — try backend first, fall back to mock data (default)
   */
  DATA_MODE: z.enum(['mock', 'backend', 'hybrid']).optional(),

  // ── External APIs ──────────────────────────────────────────────────────────
  WAIFUPICS_BASE_URL: z.string().url().optional(),
  ANIMECHAN_BASE_URL: z.string().url().optional(),

  // ── Error tracking (optional — leave empty to disable) ────────────────────
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
