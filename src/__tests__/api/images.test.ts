/**
 * @jest-environment node
 */
import { GET } from '@/app/api/images/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/images${queryString}`);
}

describe('GET /api/images', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns 200 with a single image URL by default', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://i.waifu.pics/test.jpg' }),
    } as Response);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
  });

  it('returns 400 for an invalid image type', async () => {
    const res = await GET(makeRequest('?type=invalid-type'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('accepts a valid SFW type', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: 'https://i.waifu.pics/neko.jpg' }),
    } as Response);

    const res = await GET(makeRequest('?type=neko'));
    expect(res.status).toBe(200);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/sfw/neko');
  });

  it('returns an array when many=true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        files: ['https://i.waifu.pics/1.jpg', 'https://i.waifu.pics/2.jpg'],
      }),
    } as Response);

    const res = await GET(makeRequest('?many=true'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('calls the /many endpoint when many=true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ files: [] }),
    } as Response);

    await GET(makeRequest('?type=neko&many=true'));
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/many/sfw/neko');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const res = await GET(makeRequest('?type=waifu'));
    expect(res.status).toBe(502);
  });
});
