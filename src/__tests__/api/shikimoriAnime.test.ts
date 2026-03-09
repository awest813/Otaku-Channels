/**
 * @jest-environment node
 */
import { GET } from '@/app/api/shikimori/anime/[id]/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

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

describe('GET /api/shikimori/anime/:id', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns anime details for a valid Shikimori ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [MOCK_SHIKIMORI_ANIME] },
      }),
    } as Response);

    const res = await GET(
      new Request('http://localhost/api/shikimori/anime/20'),
      { params: Promise.resolve({ id: '20' }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.title).toBe('Naruto');
    expect(body.data.sourceType).toBe('shikimori');
    expect(body).toHaveProperty('raw');
  });

  it('returns 404 when anime not found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [] },
      }),
    } as Response);

    const res = await GET(
      new Request('http://localhost/api/shikimori/anime/99999'),
      { params: Promise.resolve({ id: '99999' }) }
    );
    expect(res.status).toBe(404);
  });

  it('returns movie type for movie kind', async () => {
    const movieAnime = { ...MOCK_SHIKIMORI_ANIME, kind: 'movie' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { animes: [movieAnime] },
      }),
    } as Response);

    const res = await GET(
      new Request('http://localhost/api/shikimori/anime/20'),
      { params: Promise.resolve({ id: '20' }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.type).toBe('movie');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await GET(
      new Request('http://localhost/api/shikimori/anime/20'),
      { params: Promise.resolve({ id: '20' }) }
    );
    expect(res.status).toBe(502);
  });
});
