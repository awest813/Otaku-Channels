/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { GET } from '@/app/api/search/suggestions/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/search/suggestions${queryString}`);
}

describe('GET /api/search/suggestions', () => {
  it('returns empty data for missing q param', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('returns empty data for empty q string', async () => {
    const res = await GET(makeRequest('?q='));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });

  it('falls back to mock data when backend is unavailable', async () => {
    // Backend mock throws by default — suggestion endpoint falls through to mock data
    const res = await GET(makeRequest('?q=demon'));
    expect(res.status).toBe(200);
    const body = await res.json();
    // Should return an array (possibly empty if mock data has no match)
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns suggestions matching a known title in mock data', async () => {
    const res = await GET(makeRequest('?q=demon'));
    expect(res.status).toBe(200);
    const body = await res.json();
    // "Demon Slayer Highlights" should appear in mock data suggestions
    const titles = body.data.map((s: { title: string }) =>
      s.title.toLowerCase()
    );
    const hasMatch = titles.some((t: string) => t.includes('demon'));
    expect(hasMatch).toBe(true);
  });

  it('each suggestion has required fields', async () => {
    const res = await GET(makeRequest('?q=anime'));
    const body = await res.json();
    body.data.forEach(
      (s: { slug: string; title: string; posterUrl: string | null }) => {
        expect(typeof s.slug).toBe('string');
        expect(typeof s.title).toBe('string');
        // posterUrl can be string or null
        expect(s.posterUrl === null || typeof s.posterUrl === 'string').toBe(
          true
        );
      }
    );
  });
});
