/**
 * @jest-environment node
 */
import { GET } from '@/app/api/series/[slug]/route';

function makeRequest(): Request {
  return new Request('http://localhost/api/series/blade-of-eternity');
}

describe('GET /api/series/:slug', () => {
  it('returns the series for a valid slug', async () => {
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ slug: 'blade-of-eternity' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.slug).toBe('blade-of-eternity');
    expect(body.data.title).toBeTruthy();
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await GET(makeRequest(), {
      params: Promise.resolve({ slug: 'does-not-exist' }),
    });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });
});
