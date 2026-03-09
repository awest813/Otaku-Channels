import { NextResponse } from 'next/server';

import { jikanToMovie, jikanToSeries, searchJikan } from '@/lib/jikan';

/**
 * GET /api/jikan/search
 *
 * Searches anime via the Jikan v4 (MyAnimeList) API.
 *
 * Query params:
 *   q    — required, search query
 *   page — page number (default: 1)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const page = Number(searchParams.get('page') ?? '1');

  if (!q) {
    return NextResponse.json(
      { error: 'Missing required param: q' },
      { status: 400 }
    );
  }

  try {
    const result = await searchJikan(q, page);

    const items = (result.data ?? []).map((anime) => {
      if (anime.type === 'Movie') return jikanToMovie(anime);
      return jikanToSeries(anime);
    });

    return NextResponse.json({
      data: items,
      total: items.length,
      page,
      hasNextPage: result.pagination?.has_next_page ?? false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Jikan search failed', data: [], total: 0, page },
      { status: 502 }
    );
  }
}
