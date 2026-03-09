/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { GET } from '@/app/api/search/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/search${queryString}`);
}

describe('GET /api/search', () => {
  it('returns 400 when no query params are provided', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns results matching a title query', async () => {
    const res = await GET(makeRequest('?q=blade'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    body.data.forEach(
      (item: { title: string; description: string; genres: string[] }) => {
        const combined = [item.title, item.description, ...item.genres]
          .join(' ')
          .toLowerCase();
        expect(combined).toContain('blade');
      }
    );
  });

  it('returns results filtered by genre alone', async () => {
    const res = await GET(makeRequest('?genre=action'));
    expect(res.status).toBe(200);
    const body = await res.json();
    body.data.forEach((item: { genres: string[] }) => {
      expect(item.genres.map((g: string) => g.toLowerCase())).toContain(
        'action'
      );
    });
  });

  it('returns results filtered by source alone', async () => {
    const res = await GET(makeRequest('?source=youtube+official'));
    const body = await res.json();
    body.data.forEach((item: { sourceName: string }) => {
      expect(item.sourceName.toLowerCase()).toBe('youtube official');
    });
  });

  it('returns empty results for a query with no matches', async () => {
    const res = await GET(makeRequest('?q=zzznomatch9999'));
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});
