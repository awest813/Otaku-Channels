import { NextResponse } from 'next/server';

import { BackendError, listAnime } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';

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
    genre: searchParams.get('genre') ?? undefined,
    source: searchParams.get('source') ?? undefined,
    language: searchParams.get('language') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    type: searchParams.get('type') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    page: searchParams.get('page')
      ? Number(searchParams.get('page'))
      : undefined,
    limit: searchParams.get('limit')
      ? Number(searchParams.get('limit'))
      : undefined,
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
  let data = isMovie ? [...mockMovies] : [...mockSeries];

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
