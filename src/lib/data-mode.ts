/**
 * Helpers for data-mode switching in Next.js API route handlers.
 *
 * DATA_MODE env var:
 *   mock    — always return static mock data
 *   backend — always call Fastify; propagate 502 if unavailable
 *   hybrid  — try Fastify first; fall back to mock (default)
 */

import type { DataMode } from '@/types/api';

export function getDataMode(): DataMode {
  const raw = process.env.DATA_MODE;
  if (raw === 'mock' || raw === 'backend' || raw === 'hybrid') return raw;
  // Default: hybrid when BACKEND_URL is configured, mock otherwise
  return process.env.BACKEND_URL ? 'hybrid' : 'mock';
}
