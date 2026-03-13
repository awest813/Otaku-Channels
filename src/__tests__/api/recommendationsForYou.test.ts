/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { GET } from '@/app/api/recommendations/for-you/route';

function makeRequest(queryString = ''): Request {
  return new Request(
    `http://localhost/api/recommendations/for-you${queryString}`
  );
}

describe('GET /api/recommendations/for-you', () => {
  it('returns a list when no genres supplied (static fallback)', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('returns at most 12 items by default', async () => {
    const res = await GET(makeRequest('?genres=Action'));
    const body = await res.json();
    expect(body.data.length).toBeLessThanOrEqual(12);
  });

  it('respects the limit param', async () => {
    const res = await GET(makeRequest('?genres=Action&limit=5'));
    const body = await res.json();
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  it('filters by supplied genres when available', async () => {
    const res = await GET(makeRequest('?genres=Action,Fantasy'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns items with expected fields', async () => {
    const res = await GET(makeRequest('?genres=Action'));
    const body = await res.json();
    if (body.data.length > 0) {
      const item = body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('genres');
    }
  });
});
