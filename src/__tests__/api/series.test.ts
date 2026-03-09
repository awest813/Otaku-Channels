/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { mockSeries } from '@/data/mockData';

import { GET } from '@/app/api/series/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/series${queryString}`);
}

describe('GET /api/series', () => {
  it('returns all series when no filters are applied', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(mockSeries.length);
    expect(body.total).toBe(mockSeries.length);
  });

  it('filters by genre (case-insensitive)', async () => {
    const res = await GET(makeRequest('?genre=action'));
    const body = await res.json();
    body.data.forEach((s: { genres: string[] }) => {
      expect(s.genres.map((g: string) => g.toLowerCase())).toContain('action');
    });
  });

  it('filters by sourceType', async () => {
    const res = await GET(makeRequest('?source=youtube'));
    const body = await res.json();
    body.data.forEach((s: { sourceType: string }) => {
      expect(s.sourceType).toBe('youtube');
    });
  });

  it('filters by language', async () => {
    const res = await GET(makeRequest('?language=dub'));
    const body = await res.json();
    body.data.forEach((s: { language: string }) => {
      expect(s.language).toBe('dub');
    });
  });

  it('filters by tag (case-insensitive)', async () => {
    const res = await GET(makeRequest('?tag=trending'));
    const body = await res.json();
    body.data.forEach((s: { tags: string[] }) => {
      expect(s.tags.map((t: string) => t.toLowerCase())).toContain('trending');
    });
  });

  it('returns an empty array when no series match the filter', async () => {
    const res = await GET(makeRequest('?genre=nonexistentgenre12345'));
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});
