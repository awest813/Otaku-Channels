/**
 * @jest-environment node
 */
import { mockLiveChannels } from '@/data/mockData';

import { GET } from '@/app/api/live/route';

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/live${queryString}`);
}

describe('GET /api/live', () => {
  it('returns all live channels when no filters are applied', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(mockLiveChannels.length);
    expect(body.total).toBe(mockLiveChannels.length);
  });

  it('filters by sourceType', async () => {
    const res = await GET(makeRequest('?source=pluto'));
    const body = await res.json();
    body.data.forEach((ch: { sourceType: string }) => {
      expect(ch.sourceType).toBe('pluto');
    });
  });

  it('returns an empty array when no channels match the source filter', async () => {
    const res = await GET(makeRequest('?source=nonexistentsource'));
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});
