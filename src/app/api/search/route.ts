import { NextResponse } from 'next/server';

import { BackendError, searchAnime } from '@/lib/backend';
import { jikanToMovie, jikanToSeries, searchJikan } from '@/lib/jikan';

/**
 * GET /api/search
 *
 * Searches anime. Tries the Fastify backend first, then falls back to
 * the Jikan (MyAnimeList) API so the endpoint always returns results.
 *
 * Query params:
 *   q      — search query (required if genre/source not provided)
 *   genre  — filter by genre
 *   source — filter by sourceType
 *   type, year, season, sort, page, limit
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const genre = searchParams.get('genre') ?? undefined;
  const source = searchParams.get('source') ?? undefined;

  if (!q && !genre && !source) {
    return NextResponse.json(
      { error: 'Provide at least one search parameter: q, genre, or source' },
      { status: 400 }
    );
  }

  // 1. Try backend
  try {
    const result = await searchAnime({
      q: q ?? '',
      genre,
      source,
      type: searchParams.get('type') ?? undefined,
      year: searchParams.get('year')
        ? Number(searchParams.get('year'))
        : undefined,
      season: searchParams.get('season') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      page: searchParams.get('page')
        ? Number(searchParams.get('page'))
        : undefined,
      limit: searchParams.get('limit')
        ? Number(searchParams.get('limit'))
        : undefined,
    });
    return NextResponse.json(result);
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
      const page = searchParams.get('page')
        ? Number(searchParams.get('page'))
        : 1;
      const jikanResult = await searchJikan(q, page);

      const items = (jikanResult.data ?? []).map((anime) => {
        if (anime.type === 'Movie') return jikanToMovie(anime);
        return jikanToSeries(anime);
      });

      return NextResponse.json({
        data: items,
        total: items.length,
        page,
        query: q,
        source: 'jikan',
      });
    } catch {
      // Jikan also failed
    }
  }

  // 3. Last resort: empty results
  return NextResponse.json({
    data: [],
    total: 0,
    page: 1,
    query: q ?? '',
  });
}
