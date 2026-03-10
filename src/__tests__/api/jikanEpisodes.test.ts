/**
 * GET /api/jikan/episodes/[id] — contract tests
 *
 * These tests verify request validation and response shapes without making
 * real Jikan API calls. The Jikan library functions are mocked.
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/jikan/episodes/[id]/route';

// Mock the Jikan library to avoid real network calls
jest.mock('@/lib/jikan', () => ({
  getJikanAnime: jest.fn(),
  getJikanEpisodes: jest.fn(),
}));

import { getJikanAnime, getJikanEpisodes } from '@/lib/jikan';

const mockGetAnime = getJikanAnime as jest.MockedFunction<typeof getJikanAnime>;
const mockGetEpisodes = getJikanEpisodes as jest.MockedFunction<
  typeof getJikanEpisodes
>;

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

function makeAnimeResponse() {
  return {
    data: {
      mal_id: 12345,
      url: 'https://myanimelist.net/anime/12345',
      images: { jpg: { image_url: 'https://example.com/thumb.jpg' } },
      streaming: [
        { name: 'Crunchyroll', url: 'https://crunchyroll.com/anime' },
      ],
    },
  };
}

function makeEpisodesResponse(count = 3) {
  return {
    data: Array.from({ length: count }, (_, i) => ({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      title_romanji: null,
      filler: false,
      recap: false,
    })),
    pagination: { has_next_page: false },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/jikan/episodes/[id] — contract', () => {
  it('returns 400 for non-numeric id', async () => {
    const res = await GET(req('/api/jikan/episodes/abc'), {
      params: Promise.resolve({ id: 'abc' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
  });

  it('returns 400 for missing id', async () => {
    const res = await GET(req('/api/jikan/episodes/'), {
      params: Promise.resolve({ id: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 200 with episode list for a valid MAL ID', async () => {
    mockGetAnime.mockResolvedValueOnce(makeAnimeResponse() as never);
    mockGetEpisodes.mockResolvedValueOnce(makeEpisodesResponse(3) as never);

    const res = await GET(req('/api/jikan/episodes/12345'), {
      params: Promise.resolve({ id: '12345' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);
    expect(typeof body.total).toBe('number');
    expect(body.total).toBe(3);
  });

  it('each episode has the required canonical fields', async () => {
    mockGetAnime.mockResolvedValueOnce(makeAnimeResponse() as never);
    mockGetEpisodes.mockResolvedValueOnce(makeEpisodesResponse(2) as never);

    const res = await GET(req('/api/jikan/episodes/12345'), {
      params: Promise.resolve({ id: '12345' }),
    });
    const body = await res.json();
    body.data.forEach(
      (ep: {
        id: string;
        seriesSlug: string;
        title: string;
        episodeNumber: number;
        thumbnail: string;
        watchUrl: string;
      }) => {
        expect(typeof ep.id).toBe('string');
        expect(typeof ep.seriesSlug).toBe('string');
        expect(typeof ep.title).toBe('string');
        expect(typeof ep.episodeNumber).toBe('number');
        expect(typeof ep.thumbnail).toBe('string');
        expect(typeof ep.watchUrl).toBe('string');
      }
    );
  });

  it('prefers Crunchyroll URL when available', async () => {
    mockGetAnime.mockResolvedValueOnce(makeAnimeResponse() as never);
    mockGetEpisodes.mockResolvedValueOnce(makeEpisodesResponse(1) as never);

    const res = await GET(req('/api/jikan/episodes/12345'), {
      params: Promise.resolve({ id: '12345' }),
    });
    const body = await res.json();
    expect(body.data[0].watchUrl).toBe('https://crunchyroll.com/anime');
    expect(body.data[0].sourceName).toBe('Crunchyroll');
  });

  it('falls back to MAL URL when Crunchyroll is not in streaming list', async () => {
    mockGetAnime.mockResolvedValueOnce({
      data: {
        mal_id: 12345,
        url: 'https://myanimelist.net/anime/12345',
        images: { jpg: { image_url: '' } },
        streaming: [],
      },
    } as never);
    mockGetEpisodes.mockResolvedValueOnce(makeEpisodesResponse(1) as never);

    const res = await GET(req('/api/jikan/episodes/12345'), {
      params: Promise.resolve({ id: '12345' }),
    });
    const body = await res.json();
    expect(body.data[0].watchUrl).toBe('https://myanimelist.net/anime/12345');
    expect(body.data[0].sourceName).toBe('MyAnimeList');
  });

  it('includes pagination info', async () => {
    mockGetAnime.mockResolvedValueOnce(makeAnimeResponse() as never);
    mockGetEpisodes.mockResolvedValueOnce({
      ...makeEpisodesResponse(25),
      pagination: { has_next_page: true },
    } as never);

    const res = await GET(req('/api/jikan/episodes/12345?page=1'), {
      params: Promise.resolve({ id: '12345' }),
    });
    const body = await res.json();
    expect(body.page).toBe(1);
    expect(body.hasNextPage).toBe(true);
  });

  it('returns 502 when Jikan API fails', async () => {
    mockGetAnime.mockRejectedValueOnce(new Error('Jikan unavailable'));
    mockGetEpisodes.mockRejectedValueOnce(new Error('Jikan unavailable'));

    const res = await GET(req('/api/jikan/episodes/12345'), {
      params: Promise.resolve({ id: '12345' }),
    });
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.total).toBe(0);
  });
});
