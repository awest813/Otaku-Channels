/**
 * @jest-environment node
 */
import { GET } from '@/app/api/shikimori/search/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/shikimori/search${queryString}`);
}

const MOCK_SHIKIMORI_ANIME = {
  id: '20',
  malId: 20,
  name: 'Naruto',
  english: 'Naruto',
  japanese: 'ナルト',
  kind: 'tv',
  score: 7.98,
  status: 'released',
  episodes: 220,
  airedOn: { year: 2002, date: '2002-10-03' },
  description: 'A ninja story.',
  poster: {
    originalUrl: 'https://shikimori.one/poster/naruto.jpg',
    mainUrl: 'https://shikimori.one/poster/naruto_main.jpg',
  },
  genres: [
    { name: 'Action', russian: 'Экшен' },
    { name: 'Adventure', russian: 'Приключения' },
  ],
};

describe('GET /api/shikimori/search', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns 400 when no query param provided', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('returns results matching title query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [MOCK_SHIKIMORI_ANIME] },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=naruto'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe('Naruto');
    expect(body.data[0].sourceType).toBe('shikimori');
  });

  it('includes genres from Shikimori response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [MOCK_SHIKIMORI_ANIME] },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=naruto'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data[0].genres).toContain('Action');
    expect(body.data[0].genres).toContain('Adventure');
  });

  it('converts movie kind to movie type', async () => {
    const movieAnime = { ...MOCK_SHIKIMORI_ANIME, id: '999', kind: 'movie' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [movieAnime] },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=naruto+movie'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data[0].type).toBe('movie');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await GET(makeRequest('?q=naruto'));
    expect(res.status).toBe(502);
  });
});
