/**
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import { sourceProviders } from '@/data/mockData';

import { GET } from '@/app/api/providers/route';

describe('GET /api/providers', () => {
  const req = () => new Request('http://localhost/api/providers');

  it('returns all source providers', async () => {
    const res = await GET(req());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(sourceProviders.length);
    expect(body.total).toBe(sourceProviders.length);
  });

  it('each provider has an id, name, type, and baseUrl', async () => {
    const res = await GET(req());
    const body = await res.json();
    body.data.forEach(
      (provider: {
        id: string;
        name: string;
        type: string;
        baseUrl: string;
      }) => {
        expect(provider.id).toBeTruthy();
        expect(provider.name).toBeTruthy();
        expect(provider.type).toBeTruthy();
        expect(provider.baseUrl).toBeTruthy();
      }
    );
  });
});
