/**
 * Route contract smoke tests
 *
 * These tests verify that every wired route:
 *   1. Returns HTTP 200 with the expected JSON envelope shape
 *   2. Returns normalised data matching the frontend UI types
 *   3. Falls back to mock data (DATA_MODE=mock) instead of 502
 *
 * All tests run with the manual backend mock (@/lib/__mocks__/backend)
 * so they work without a live Fastify server.
 *
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import {
  mockLiveChannels,
  mockMovies,
  mockSeries,
  sourceProviders,
} from '@/data/mockData';

import { GET as getLive } from '@/app/api/live/route';
import { GET as getMovies } from '@/app/api/movies/route';
import { GET as getProviders } from '@/app/api/providers/route';
import { GET as getSearch } from '@/app/api/search/route';
import { GET as getSeriesEpisodes } from '@/app/api/series/[slug]/episodes/route';
import { GET as getSeriesSlug } from '@/app/api/series/[slug]/route';
import { GET as getSeries } from '@/app/api/series/route';

// ─── helpers ─────────────────────────────────────────────────────────────────

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

async function jsonBody(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

// ─── /api/series ─────────────────────────────────────────────────────────────

describe('GET /api/series — contract', () => {
  it('returns 200 with { data, total, page, limit }', async () => {
    const res = await getSeries(req('/api/series'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.page).toBe('number');
    expect(typeof body.limit).toBe('number');
  });

  it('every item has required AnimeSeries fields', async () => {
    const res = await getSeries(req('/api/series'));
    const body = await jsonBody(res);
    (body.data as Record<string, unknown>[]).forEach((item) => {
      expect(typeof item.id).toBe('string');
      expect(typeof item.slug).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.thumbnail).toBe('string');
      expect(item.type).toBe('series');
      expect(Array.isArray(item.genres)).toBe(true);
    });
  });

  it('total matches full mock dataset size', async () => {
    const res = await getSeries(req('/api/series'));
    const body = await jsonBody(res);
    expect(body.total).toBe(mockSeries.length);
  });

  it('genre filter narrows results to matching items only', async () => {
    const res = await getSeries(req('/api/series?genre=action'));
    const body = await jsonBody(res);
    (body.data as { genres: string[] }[]).forEach((item) => {
      expect(item.genres.map((g) => g.toLowerCase())).toContain('action');
    });
  });

  it('returns empty data array for an unknown genre', async () => {
    const res = await getSeries(req('/api/series?genre=zzznogenre9999'));
    const body = await jsonBody(res);
    expect((body.data as unknown[]).length).toBe(0);
    expect(body.total).toBe(0);
  });
});

// ─── /api/series/:slug ───────────────────────────────────────────────────────

describe('GET /api/series/:slug — contract', () => {
  const knownSlug = mockSeries[0].slug;

  it('returns 200 with { data: AnimeSeries } for a known slug', async () => {
    const res = await getSeriesSlug(req(`/api/series/${knownSlug}`), {
      params: Promise.resolve({ slug: knownSlug }),
    });
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect((body.data as Record<string, unknown>).slug).toBe(knownSlug);
    expect((body.data as Record<string, unknown>).type).toBe('series');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getSeriesSlug(req('/api/series/does-not-exist'), {
      params: Promise.resolve({ slug: 'does-not-exist' }),
    });
    expect(res.status).toBe(404);
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
  });
});

// ─── /api/series/:slug/episodes ──────────────────────────────────────────────

describe('GET /api/series/:slug/episodes — contract', () => {
  it('returns 200 with { data: Episode[], total } for a known slug', async () => {
    const res = await getSeriesEpisodes(
      req('/api/series/demon-slayer-highlights/episodes'),
      { params: Promise.resolve({ slug: 'demon-slayer-highlights' }) }
    );
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('every episode has required fields', async () => {
    const res = await getSeriesEpisodes(
      req('/api/series/demon-slayer-highlights/episodes'),
      { params: Promise.resolve({ slug: 'demon-slayer-highlights' }) }
    );
    const body = await jsonBody(res);
    (body.data as Record<string, unknown>[]).forEach((ep) => {
      expect(typeof ep.id).toBe('string');
      expect(typeof ep.episodeNumber).toBe('number');
      expect(typeof ep.title).toBe('string');
      expect(typeof ep.seriesSlug).toBe('string');
    });
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getSeriesEpisodes(
      req('/api/series/does-not-exist/episodes'),
      { params: Promise.resolve({ slug: 'does-not-exist' }) }
    );
    expect(res.status).toBe(404);
  });
});

// ─── /api/movies ─────────────────────────────────────────────────────────────

describe('GET /api/movies — contract', () => {
  it('returns 200 with paginated envelope', async () => {
    const res = await getMovies(req('/api/movies'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('every item has type=movie', async () => {
    const res = await getMovies(req('/api/movies'));
    const body = await jsonBody(res);
    (body.data as { type: string }[]).forEach((item) => {
      expect(item.type).toBe('movie');
    });
  });

  it('total matches mock movies count', async () => {
    const res = await getMovies(req('/api/movies'));
    const body = await jsonBody(res);
    expect(body.total).toBe(mockMovies.length);
  });
});

// ─── /api/live ───────────────────────────────────────────────────────────────

describe('GET /api/live — contract', () => {
  it('returns 200 with { data, total }', async () => {
    const res = await getLive(req('/api/live'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('every channel has required LiveChannel fields', async () => {
    const res = await getLive(req('/api/live'));
    const body = await jsonBody(res);
    (body.data as Record<string, unknown>[]).forEach((ch) => {
      expect(typeof ch.id).toBe('string');
      expect(typeof ch.slug).toBe('string');
      expect(typeof ch.name).toBe('string');
      expect(typeof ch.channelNumber).toBe('string');
    });
  });

  it('total matches mock channels count', async () => {
    const res = await getLive(req('/api/live'));
    const body = await jsonBody(res);
    expect(body.total).toBe(mockLiveChannels.length);
  });

  it('source filter narrows results', async () => {
    const res = await getLive(req('/api/live?source=pluto'));
    const body = await jsonBody(res);
    (body.data as { sourceType: string }[]).forEach((ch) => {
      expect(ch.sourceType).toBe('pluto');
    });
  });
});

// ─── /api/search ─────────────────────────────────────────────────────────────

describe('GET /api/search — contract', () => {
  it('returns 400 with no params', async () => {
    const res = await getSearch(req('/api/search'));
    expect(res.status).toBe(400);
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
  });

  it('returns 200 with { data, total, page, limit, query } for ?q=blade', async () => {
    const res = await getSearch(req('/api/search?q=blade'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.query).toBe('string');
  });

  it('results match query text', async () => {
    const res = await getSearch(req('/api/search?q=demon'));
    const body = await jsonBody(res);
    expect((body.data as unknown[]).length).toBeGreaterThan(0);
    (
      body.data as { title: string; description: string; genres: string[] }[]
    ).forEach((item) => {
      const combined = [item.title, item.description, ...item.genres]
        .join(' ')
        .toLowerCase();
      expect(combined).toContain('demon');
    });
  });

  it('genre-only search returns matching items', async () => {
    const res = await getSearch(req('/api/search?genre=action'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    (body.data as { genres: string[] }[]).forEach((item) => {
      expect(item.genres.map((g) => g.toLowerCase())).toContain('action');
    });
  });

  it('returns empty results for an unmatched query', async () => {
    const res = await getSearch(req('/api/search?q=zzznomatch9999'));
    const body = await jsonBody(res);
    expect((body.data as unknown[]).length).toBe(0);
  });
});

// ─── /api/providers ──────────────────────────────────────────────────────────

describe('GET /api/providers — contract', () => {
  it('returns 200 with { data, total }', async () => {
    const res = await getProviders(req('/api/providers'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(body.total).toBe(sourceProviders.length);
  });

  it('every provider has id, name, type, baseUrl', async () => {
    const res = await getProviders(req('/api/providers'));
    const body = await jsonBody(res);
    (body.data as Record<string, unknown>[]).forEach((p) => {
      expect(typeof p.id).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.type).toBe('string');
      expect(typeof p.baseUrl).toBe('string');
    });
  });
});

// ─── DATA_MODE=mock fallback ─────────────────────────────────────────────────

describe('DATA_MODE=mock fallback', () => {
  const originalMode = process.env.DATA_MODE;
  const originalBackend = process.env.BACKEND_URL;

  beforeEach(() => {
    process.env.DATA_MODE = 'mock';
    delete process.env.BACKEND_URL;
  });

  afterEach(() => {
    if (originalMode === undefined) delete process.env.DATA_MODE;
    else process.env.DATA_MODE = originalMode;
    if (originalBackend === undefined) delete process.env.BACKEND_URL;
    else process.env.BACKEND_URL = originalBackend;
  });

  it('/api/series returns mock series without calling backend', async () => {
    const res = await getSeries(req('/api/series'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.total).toBe(mockSeries.length);
  });

  it('/api/movies returns mock movies without calling backend', async () => {
    const res = await getMovies(req('/api/movies'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.total).toBe(mockMovies.length);
  });

  it('/api/live returns mock channels without calling backend', async () => {
    const res = await getLive(req('/api/live'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.total).toBe(mockLiveChannels.length);
  });

  it('/api/search returns mock results', async () => {
    const res = await getSearch(req('/api/search?q=demon'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.source).toBe('mock');
  });

  it('/api/providers returns mock providers', async () => {
    const res = await getProviders(req('/api/providers'));
    expect(res.status).toBe(200);
    const body = await jsonBody(res);
    expect(body.total).toBe(sourceProviders.length);
  });
});
