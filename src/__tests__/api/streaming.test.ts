/**
 * GET /api/streaming/search — contract tests
 * GET /api/streaming/info — contract tests
 * GET /api/streaming/sources — contract tests
 *
 * Verifies that the streaming API routes correctly validate params,
 * delegate to backend functions, and return proper error responses.
 *
 * @jest-environment node
 */
jest.mock('@/lib/backend');

import {
  BackendError,
  getStreamingInfo,
  getStreamingSources,
  searchStreaming,
} from '@/lib/backend';

import { GET as getStreamingInfoRoute } from '@/app/api/streaming/info/route';
import { GET as getStreamingSearchRoute } from '@/app/api/streaming/search/route';
import { GET as getStreamingSourcesRoute } from '@/app/api/streaming/sources/route';

const mockSearchStreaming = searchStreaming as jest.MockedFunction<
  typeof searchStreaming
>;
const mockGetStreamingInfo = getStreamingInfo as jest.MockedFunction<
  typeof getStreamingInfo
>;
const mockGetStreamingSources = getStreamingSources as jest.MockedFunction<
  typeof getStreamingSources
>;

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── /api/streaming/search ────────────────────────────────────────────────────

describe('GET /api/streaming/search', () => {
  it('returns 400 when q param is missing', async () => {
    const res = await getStreamingSearchRoute(req('/api/streaming/search'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('q');
  });

  it('returns 400 when q param is empty string', async () => {
    const res = await getStreamingSearchRoute(req('/api/streaming/search?q='));
    expect(res.status).toBe(400);
  });

  it('returns search results for a valid query', async () => {
    mockSearchStreaming.mockResolvedValueOnce({
      data: [
        {
          id: 'demon-slayer',
          title: 'Demon Slayer',
          url: 'https://gogoanime.com/demon-slayer',
        },
      ],
    } as never);

    const res = await getStreamingSearchRoute(
      req('/api/streaming/search?q=demon+slayer')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].title).toBe('Demon Slayer');
  });

  it('passes provider param to backend', async () => {
    mockSearchStreaming.mockResolvedValueOnce({ data: [] } as never);

    await getStreamingSearchRoute(
      req('/api/streaming/search?q=naruto&provider=zoro')
    );

    expect(mockSearchStreaming).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'naruto', provider: 'zoro' })
    );
  });

  it('passes page param to backend', async () => {
    mockSearchStreaming.mockResolvedValueOnce({ data: [] } as never);

    await getStreamingSearchRoute(req('/api/streaming/search?q=naruto&page=2'));

    expect(mockSearchStreaming).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'naruto', page: 2 })
    );
  });

  it('returns backend error status when BackendError is thrown', async () => {
    mockSearchStreaming.mockRejectedValueOnce(
      new BackendError(404, 'Provider not found')
    );

    const res = await getStreamingSearchRoute(
      req('/api/streaming/search?q=test')
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Provider not found');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockSearchStreaming.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await getStreamingSearchRoute(
      req('/api/streaming/search?q=test')
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Streaming search failed');
  });
});

// ─── /api/streaming/info ─────────────────────────────────────────────────────

describe('GET /api/streaming/info', () => {
  it('returns 400 when id param is missing', async () => {
    const res = await getStreamingInfoRoute(req('/api/streaming/info'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('id');
  });

  it('returns 400 when id param is empty string', async () => {
    const res = await getStreamingInfoRoute(req('/api/streaming/info?id='));
    expect(res.status).toBe(400);
  });

  it('returns episode list for a valid anime id', async () => {
    mockGetStreamingInfo.mockResolvedValueOnce({
      data: {
        id: 'demon-slayer',
        title: 'Demon Slayer',
        episodes: [
          { id: 'ep-1', title: 'Episode 1', number: 1 },
          { id: 'ep-2', title: 'Episode 2', number: 2 },
        ],
      },
    } as never);

    const res = await getStreamingInfoRoute(
      req('/api/streaming/info?id=demon-slayer')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.episodes).toHaveLength(2);
    expect(body.data.title).toBe('Demon Slayer');
  });

  it('passes provider param to backend', async () => {
    mockGetStreamingInfo.mockResolvedValueOnce({ data: null } as never);

    await getStreamingInfoRoute(
      req('/api/streaming/info?id=naruto&provider=animepahe')
    );

    expect(mockGetStreamingInfo).toHaveBeenCalledWith('naruto', 'animepahe');
  });

  it('returns backend error status when BackendError is thrown', async () => {
    mockGetStreamingInfo.mockRejectedValueOnce(
      new BackendError(404, 'Anime not found')
    );

    const res = await getStreamingInfoRoute(
      req('/api/streaming/info?id=unknown')
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Anime not found');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockGetStreamingInfo.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await getStreamingInfoRoute(req('/api/streaming/info?id=test'));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch streaming info');
  });
});

// ─── /api/streaming/sources ──────────────────────────────────────────────────

describe('GET /api/streaming/sources', () => {
  it('returns 400 when episodeId param is missing', async () => {
    const res = await getStreamingSourcesRoute(req('/api/streaming/sources'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('episodeId');
  });

  it('returns 400 when episodeId param is empty string', async () => {
    const res = await getStreamingSourcesRoute(
      req('/api/streaming/sources?episodeId=')
    );
    expect(res.status).toBe(400);
  });

  it('returns video sources for a valid episode id', async () => {
    mockGetStreamingSources.mockResolvedValueOnce({
      data: {
        sources: [
          {
            url: 'https://cdn.example.com/ep1-720p.m3u8',
            quality: '720p',
            isM3U8: true,
          },
          {
            url: 'https://cdn.example.com/ep1-1080p.m3u8',
            quality: '1080p',
            isM3U8: true,
          },
        ],
        subtitles: [],
      },
    } as never);

    const res = await getStreamingSourcesRoute(
      req('/api/streaming/sources?episodeId=demon-slayer-ep-1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.sources).toHaveLength(2);
    expect(body.data.sources[0].quality).toBe('720p');
  });

  it('passes provider param to backend', async () => {
    mockGetStreamingSources.mockResolvedValueOnce({ data: null } as never);

    await getStreamingSourcesRoute(
      req('/api/streaming/sources?episodeId=ep-1&provider=zoro')
    );

    expect(mockGetStreamingSources).toHaveBeenCalledWith('ep-1', 'zoro');
  });

  it('returns backend error status when BackendError is thrown', async () => {
    mockGetStreamingSources.mockRejectedValueOnce(
      new BackendError(403, 'Region blocked')
    );

    const res = await getStreamingSourcesRoute(
      req('/api/streaming/sources?episodeId=ep-1')
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Region blocked');
  });

  it('returns 502 when backend is unreachable', async () => {
    mockGetStreamingSources.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const res = await getStreamingSourcesRoute(
      req('/api/streaming/sources?episodeId=ep-1')
    );
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('Failed to fetch episode sources');
  });
});
