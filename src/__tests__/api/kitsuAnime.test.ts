/**
 * @jest-environment node
 */
import { GET } from '@/app/api/kitsu/anime/[id]/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

const MOCK_KITSU_ANIME = {
  id: '12',
  type: 'anime',
  attributes: {
    slug: 'one-piece',
    synopsis: 'A pirate adventure',
    canonicalTitle: 'One Piece',
    titles: { en: 'One Piece', en_jp: 'One Piece', ja_jp: 'ワンピース' },
    averageRating: '83.61',
    startDate: '1999-10-20',
    endDate: null,
    subtype: 'TV',
    status: 'current',
    episodeCount: null,
    nsfw: false,
    posterImage: {
      tiny: null,
      small: null,
      medium: null,
      large: 'https://media.kitsu.io/anime/poster/12/large.jpg',
      original: null,
    },
    coverImage: null,
  },
};

describe('GET /api/kitsu/anime/:id', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns anime details for a valid Kitsu ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: MOCK_KITSU_ANIME,
      }),
    } as Response);

    const res = await GET(new Request('http://localhost/api/kitsu/anime/12'), {
      params: Promise.resolve({ id: '12' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.title).toBe('One Piece');
    expect(body.data.sourceType).toBe('kitsu');
    expect(body).toHaveProperty('raw');
  });

  it('returns movie type for movie subtype', async () => {
    const movieAnime = {
      ...MOCK_KITSU_ANIME,
      attributes: {
        ...MOCK_KITSU_ANIME.attributes,
        subtype: 'movie',
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: movieAnime }),
    } as Response);

    const res = await GET(new Request('http://localhost/api/kitsu/anime/12'), {
      params: Promise.resolve({ id: '12' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.type).toBe('movie');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await GET(new Request('http://localhost/api/kitsu/anime/12'), {
      params: Promise.resolve({ id: '12' }),
    });
    expect(res.status).toBe(502);
  });
});
