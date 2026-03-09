/**
 * @jest-environment node
 */
import { GET } from '@/app/api/quotes/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/quotes${queryString}`);
}

const MOCK_QUOTE = {
  content: 'Believe it!',
  character: { name: 'Naruto Uzumaki', image: null },
  anime: { name: 'Naruto', image: null, slug: 'naruto' },
};

describe('GET /api/quotes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns 200 with default count of 5 quotes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        MOCK_QUOTE,
        MOCK_QUOTE,
        MOCK_QUOTE,
        MOCK_QUOTE,
        MOCK_QUOTE,
      ],
    } as Response);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('returns quotes with required fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [MOCK_QUOTE],
    } as Response);

    const res = await GET(makeRequest('?count=1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    body.data.forEach(
      (quote: {
        content: string;
        character: { name: string };
        anime: { name: string };
      }) => {
        expect(typeof quote.content).toBe('string');
        expect(quote.character).toBeDefined();
        expect(quote.anime).toBeDefined();
      }
    );
  });

  it('clamps count to 10 maximum', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [MOCK_QUOTE],
    } as Response);

    const res = await GET(makeRequest('?count=999'));
    expect(res.status).toBe(200);
    // Verify the URL called had count=10 (clamped)
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('count=10');
  });

  it('includes anime filter in request URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_QUOTE,
    } as Response);

    const res = await GET(makeRequest('?anime=Naruto&count=1'));
    expect(res.status).toBe(200);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('anime=Naruto');
  });

  it('includes character filter in request URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_QUOTE,
    } as Response);

    const res = await GET(makeRequest('?character=Goku&count=1'));
    expect(res.status).toBe(200);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('character=Goku');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const res = await GET(makeRequest('?count=1'));
    expect(res.status).toBe(502);
  });
});
