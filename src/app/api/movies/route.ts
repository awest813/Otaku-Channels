import { NextResponse } from 'next/server';

import { BackendError, listAnime } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';
import { clampLimit, clampPage, sanitizeQuery } from '@/lib/params';

import { mockMovies } from '@/data/mockData';

import type { SeriesListParams } from '@/types/api';

/**
 * GET /api/movies
 *
 * Proxies to /api/v1/anime with type=MOVIE.
 * Query params: genre, source, language, sort, page, limit
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = getDataMode();

  const params: SeriesListParams = {
    type: 'MOVIE',
    genre: sanitizeQuery(searchParams.get('genre')),
    source: sanitizeQuery(searchParams.get('source')),
    language: sanitizeQuery(searchParams.get('language')),
    sort: sanitizeQuery(searchParams.get('sort')),
    page: clampPage(searchParams.get('page')),
    limit: clampLimit(searchParams.get('limit')),
  };

  if (mode === 'mock') {
    return NextResponse.json(buildMockResponse(params));
  }

  try {
    const result = await listAnime(params);
    return NextResponse.json(result);
  } catch (err) {
    if (mode === 'backend') {
      if (err instanceof BackendError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch movies' },
        { status: 502 }
      );
    }
    // hybrid — fall back to mock
    return NextResponse.json(buildMockResponse(params));
  }
}

function buildMockResponse(params: SeriesListParams) {
  let data = [...mockMovies];

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

  const page = params.page ?? 1;
  const limit = params.limit ?? data.length;
  const start = (page - 1) * limit;
  const paged = data.slice(start, start + limit);

  return { data: paged, total: data.length, page, limit };
}
