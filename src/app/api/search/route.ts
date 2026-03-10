import { NextResponse } from 'next/server';

import { BackendError, searchAnime } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';
import { jikanToMovie, jikanToSeries, searchJikan } from '@/lib/jikan';
import { clampLimit, clampPage, clampYear, sanitizeQuery } from '@/lib/params';

import { allContent } from '@/data/mockData';

import type { AnimeSeries, Movie } from '@/types';

/**
 * GET /api/search
 *
 * Searches anime. Priority chain (varies by DATA_MODE):
 *   backend → Jikan API → mock data → empty results
 *
 * Query params:
 *   q      — search query (required if genre/source not provided)
 *   genre  — filter by genre
 *   source — filter by sourceType
 *   type, year, season, sort, page, limit
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = sanitizeQuery(searchParams.get('q'));
  const genre = sanitizeQuery(searchParams.get('genre'));
  const source = sanitizeQuery(searchParams.get('source'));
  const language = sanitizeQuery(searchParams.get('language'));
  const page = clampPage(searchParams.get('page')) ?? 1;
  const mode = getDataMode();

  if (!q && !genre && !source && !language) {
    return NextResponse.json(
      { error: 'Provide at least one search parameter: q, genre, or source' },
      { status: 400 }
    );
  }

  // mock-only mode — search in-memory
  if (mode === 'mock') {
    return NextResponse.json(
      buildMockSearchResponse(q, genre, source, language, page)
    );
  }

  // 1. Try backend
  try {
    const result = await searchAnime({
      q: q ?? '',
      genre,
      source,
      language,
      type: sanitizeQuery(searchParams.get('type')),
      year: clampYear(searchParams.get('year')),
      season: sanitizeQuery(searchParams.get('season')),
      sort: sanitizeQuery(searchParams.get('sort')),
      page,
      limit: clampLimit(searchParams.get('limit')),
    });
    return NextResponse.json({ ...result, source: 'backend' });
  } catch (err) {
    if (
      err instanceof BackendError &&
      err.status !== 502 &&
      err.status !== 503
    ) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Backend unavailable — fall through to Jikan
  }

  // 2. Fallback: Jikan API (when there's a text query)
  if (q) {
    try {
      const jikanResult = await searchJikan(q, page);

      const items = (jikanResult.data ?? []).map((anime) => {
        if (anime.type === 'Movie') return jikanToMovie(anime);
        return jikanToSeries(anime);
      });

      return NextResponse.json({
        data: items,
        total: items.length,
        page,
        limit: items.length,
        query: q,
        source: 'jikan',
      });
    } catch (jikanErr) {
      // eslint-disable-next-line no-console
      console.error('[/api/search] Jikan fallback failed:', jikanErr);
    }
  }

  // 3. Hybrid mode: fall back to mock data
  if (mode === 'hybrid') {
    return NextResponse.json(
      buildMockSearchResponse(q, genre, source, language, page, true)
    );
  }

  // 4. Last resort: empty results
  return NextResponse.json({
    data: [],
    total: 0,
    page,
    limit: 0,
    query: q ?? '',
    source: 'mock',
    fallback: true,
  });
}

function buildMockSearchResponse(
  q: string | undefined,
  genre: string | undefined,
  source: string | undefined,
  language: string | undefined,
  page: number,
  fallback = false
) {
  let data = allContent as (AnimeSeries | Movie)[];

  if (q) {
    const lq = q.toLowerCase();
    data = data.filter(
      (item) =>
        item.title.toLowerCase().includes(lq) ||
        item.description.toLowerCase().includes(lq) ||
        item.genres.some((g) => g.toLowerCase().includes(lq))
    );
  }
  if (genre) {
    const lg = genre.toLowerCase();
    data = data.filter((item) =>
      item.genres.some((g) => g.toLowerCase() === lg)
    );
  }
  if (source) {
    data = data.filter((item) => item.sourceType === source);
  }
  if (language) {
    data = data.filter(
      (item) => item.language === language || item.language === 'both'
    );
  }

  return {
    data,
    total: data.length,
    page,
    limit: data.length,
    query: q ?? '',
    source: 'mock' as const,
    fallback,
  };
}
