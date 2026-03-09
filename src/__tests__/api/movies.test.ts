/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { mockMovies } from '@/data/mockData';

import { GET } from '@/app/api/movies/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/movies${queryString}`);
}

describe('GET /api/movies', () => {
  it('returns all movies when no filters are applied', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(mockMovies.length);
    expect(body.total).toBe(mockMovies.length);
  });

  it('filters by genre (case-insensitive)', async () => {
    const res = await GET(makeRequest('?genre=fantasy'));
    const body = await res.json();
    body.data.forEach((m: { genres: string[] }) => {
      expect(m.genres.map((g: string) => g.toLowerCase())).toContain('fantasy');
    });
  });

  it('filters by sourceType', async () => {
    const res = await GET(makeRequest('?source=youtube'));
    const body = await res.json();
    body.data.forEach((m: { sourceType: string }) => {
      expect(m.sourceType).toBe('youtube');
    });
  });

  it('returns an empty array when no movies match the filter', async () => {
    const res = await GET(makeRequest('?genre=nonexistentgenre99'));
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});
