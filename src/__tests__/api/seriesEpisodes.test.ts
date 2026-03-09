/**
 * @jest-environment node
 */
import { GET } from '@/app/api/series/[slug]/episodes/route';

function makeRequest(): Request {
  return new Request('http://localhost/api/series/blade-of-eternity/episodes');
}

describe('GET /api/series/:slug/episodes', () => {
  it('returns episodes array for a known series', async () => {
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ slug: 'blade-of-eternity' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('returns 404 for an unknown series slug', async () => {
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ slug: 'unknown-series' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });
});
