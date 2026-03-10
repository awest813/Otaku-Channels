/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { GET } from '@/app/api/recommendations/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/recommendations${queryString}`);
}

describe('GET /api/recommendations', () => {
  it('returns 400 when neither animeId nor slug is provided', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns recommendations by slug using heuristic fallback', async () => {
    // The backend mock will fail; fallback to heuristics using mock data
    const res = await GET(makeRequest('?slug=demon-slayer-highlights'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns recommendations by animeId using heuristic fallback', async () => {
    const res = await GET(makeRequest('?animeId=s1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('excludes the base item from recommendations', async () => {
    const res = await GET(
      makeRequest('?animeId=s1&slug=demon-slayer-highlights')
    );
    const body = await res.json();
    const hasBaseItem = body.data.some(
      (item: { id: string; slug: string }) =>
        item.id === 's1' || item.slug === 'demon-slayer-highlights'
    );
    expect(hasBaseItem).toBe(false);
  });

  it('returns empty array for unknown animeId and slug', async () => {
    const res = await GET(
      makeRequest('?animeId=nonexistent-id&slug=nonexistent-slug')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
