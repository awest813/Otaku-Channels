/**
 * @jest-environment node
 */
import { GET } from '@/app/api/kitsu/search/route';

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

function makeRequest(queryString = ''): Request {
  return new Request(`http://localhost/api/kitsu/search${queryString}`);
}

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

describe('GET /api/kitsu/search', () => {
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
        data: [MOCK_KITSU_ANIME],
        meta: { count: 1 },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=one+piece'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1);
    expect(body.data[0].title).toBe('One Piece');
    expect(body.data[0].sourceType).toBe('kitsu');
  });

  it('converts movie subtype to movie type', async () => {
    const movieAnime = {
      ...MOCK_KITSU_ANIME,
      id: '99',
      attributes: {
        ...MOCK_KITSU_ANIME.attributes,
        subtype: 'movie',
        canonicalTitle: 'One Piece Film Red',
        titles: { en: null, en_jp: 'One Piece Film Red', ja_jp: null },
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [movieAnime],
        meta: { count: 1 },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=one+piece+film'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data[0].type).toBe('movie');
  });

  it('returns 502 when upstream fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const res = await GET(makeRequest('?q=naruto'));
    expect(res.status).toBe(502);
  });

  it('includes total count from Kitsu meta', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [MOCK_KITSU_ANIME],
        meta: { count: 42 },
      }),
    } as Response);

    const res = await GET(makeRequest('?q=one+piece'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(42);
  });
});
