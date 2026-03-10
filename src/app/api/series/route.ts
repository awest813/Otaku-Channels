import { NextResponse } from 'next/server';

import { BackendError, listAnime } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';
import { clampLimit, clampPage, clampYear, sanitizeQuery } from '@/lib/params';

import { mockMovies, mockSeries } from '@/data/mockData';

import type { SeriesListParams } from '@/types/api';

/**
 * GET /api/series
 *
 * Query params forwarded to the backend:
 *   genre, source, language, tag, type, status, sort, page, limit
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = getDataMode();

  const params: SeriesListParams = {
    genre: sanitizeQuery(searchParams.get('genre')),
    source: sanitizeQuery(searchParams.get('source')),
    language: sanitizeQuery(searchParams.get('language')),
    tag: sanitizeQuery(searchParams.get('tag')),
    type: sanitizeQuery(searchParams.get('type')),
    status: sanitizeQuery(searchParams.get('status')),
    year: clampYear(searchParams.get('year')),
    sort: sanitizeQuery(searchParams.get('sort')),
    page: clampPage(searchParams.get('page')),
    limit: clampLimit(searchParams.get('limit')),
  };

  // mock-only mode
  if (mode === 'mock') {
    return NextResponse.json(buildMockResponse(params));
  }

  // backend or hybrid
  try {
    const result = await listAnime(params);
    return NextResponse.json(result);
  } catch (err) {
    if (mode === 'backend') {
      // strict mode — propagate the error
      if (err instanceof BackendError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch series' },
        { status: 502 }
      );
    }
    // hybrid — fall back to mock data
    return NextResponse.json(buildMockResponse(params));
  }
}

function buildMockResponse(params: SeriesListParams) {
  const isMovie = params.type === 'MOVIE';
  let data: ((typeof mockSeries)[number] | (typeof mockMovies)[number])[] =
    isMovie ? [...mockMovies] : [...mockSeries];

  if (params.genre) {
    const g = params.genre.toLowerCase();
    data = data.filter((item) =>
      item.genres.some((genre) => genre.toLowerCase() === g)
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
      item.tags.some((tag) => tag.toLowerCase() === t)
    );
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? data.length;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return { data: paged, total: data.length, page, limit };
}
