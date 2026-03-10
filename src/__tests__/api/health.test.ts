/**
 * Health endpoint contract test
 *
 * Verifies that GET /api/health returns the expected shape without needing
 * a live backend (the backend ping gracefully returns 'unavailable').
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/health/route';

// Suppress network errors from the backend ping in test output
global.fetch = jest
  .fn()
  .mockRejectedValue(new Error('fetch disabled in tests'));

describe('GET /api/health — contract', () => {
  it('returns HTTP 200', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it('returns status=ok', async () => {
    const res = await GET();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.status).toBe('ok');
  });

  it('includes required fields', async () => {
    const res = await GET();
    const body = (await res.json()) as Record<string, unknown>;
    expect(typeof body.version).toBe('string');
    expect(typeof body.timestamp).toBe('string');
    expect(typeof body.environment).toBe('string');
    expect(body.backend).toBeDefined();
  });

  it('backend.status is unavailable when BACKEND_URL is not set', async () => {
    const original = process.env.BACKEND_URL;
    delete process.env.BACKEND_URL;
    const res = await GET();
    const body = (await res.json()) as { backend: { status: string } };
    expect(body.backend.status).toBe('unavailable');
    if (original !== undefined) process.env.BACKEND_URL = original;
  });

  it('sets Cache-Control: private, no-store', async () => {
    const res = await GET();
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
