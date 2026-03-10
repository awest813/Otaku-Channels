/**
 * Jest manual mock for @/lib/backend
 *
 * All exported functions use mock data so API route tests can run
 * without a running backend server.
 */

import {
  allContent,
  getEpisodesBySeries,
  getRelatedSeries,
  getSeriesBySlug,
  mockLiveChannels,
  mockMovies,
  mockSeries,
  sourceProviders,
} from '@/data/mockData';

import type { AnimeSeries, Movie } from '@/types';

export class BackendError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'BackendError';
  }
}

export const listAnime = jest.fn(
  async (
    params: {
      type?: string;
      genre?: string;
      source?: string;
      language?: string;
      tag?: string;
      page?: number;
      limit?: number;
      [key: string]: unknown;
    } = {}
  ) => {
    const isMovie = params.type === 'MOVIE';
    let data: (AnimeSeries | Movie)[] = isMovie
      ? [...mockMovies]
      : [...mockSeries];

    if (params.genre) {
      const g = params.genre.toLowerCase();
      data = data.filter((item) =>
        item.genres.some((genre: string) => genre.toLowerCase() === g)
      );
    }
    if (params.source) {
      data = data.filter((item) => item.sourceType === params.source);
    }
    if (params.language) {
      data = data.filter((item) => item.language === params.language);
    }
    if (params.tag) {
      const t = params.tag.toLowerCase();
      data = data.filter((item) =>
        item.tags.some((tag: string) => tag.toLowerCase() === t)
      );
    }

    return { data, total: data.length, page: 1, limit: 20 };
  }
);

export const getAnime = jest.fn(async (slug: string) => {
  const series = getSeriesBySlug(slug);
  if (!series) {
    throw new BackendError(404, `Series "${slug}" not found`);
  }
  return { data: series };
});

export const getAnimeEpisodes = jest.fn(async (slug: string) => {
  const series = getSeriesBySlug(slug);
  if (!series) {
    throw new BackendError(404, `Series "${slug}" not found`);
  }
  const episodes = getEpisodesBySeries(slug);
  return { data: episodes, total: episodes.length };
});

export const getTrendingAnime = jest.fn(async () => ({
  data: mockSeries.slice(0, 6),
}));

export const getFeaturedAnime = jest.fn(async () => ({
  data: mockSeries.slice(0, 3),
}));

export const getRelatedAnime = jest.fn(async (slug: string) => {
  const series = getSeriesBySlug(slug);
  if (!series) {
    throw new BackendError(404, `Series "${slug}" not found`);
  }
  return { data: getRelatedSeries(series) };
});

export const listChannels = jest.fn(async () => ({
  data: mockLiveChannels,
  total: mockLiveChannels.length,
}));

export const getChannelNowPlaying = jest.fn(async () => ({
  data: null,
}));

export const listAllowedDomains = jest.fn(async () => ({
  data: sourceProviders,
  total: sourceProviders.length,
}));

export const searchAnime = jest.fn(
  async (params: {
    q?: string;
    genre?: string;
    source?: string;
    [key: string]: unknown;
  }) => {
    let data: (AnimeSeries | Movie)[] = [...allContent];

    if (params.q) {
      const q = params.q.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.genres.some((g: string) => g.toLowerCase().includes(q))
      );
    }
    if (params.genre) {
      const g = params.genre.toLowerCase();
      data = data.filter((item) =>
        item.genres.some((genre: string) => genre.toLowerCase() === g)
      );
    }
    if (params.source) {
      const s = params.source.toLowerCase();
      data = data.filter((item) => item.sourceName.toLowerCase() === s);
    }

    return {
      data,
      total: data.length,
      page: 1,
      limit: 20,
      query: params.q ?? '',
    };
  }
);

export const listStreamingProviders = jest.fn(async () => ({ data: [] }));
export const searchStreaming = jest.fn(async () => ({ data: [] }));
export const getStreamingInfo = jest.fn(async () => ({ data: null }));
export const getStreamingSources = jest.fn(async () => ({ data: null }));
