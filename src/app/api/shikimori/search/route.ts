import { NextResponse } from 'next/server';

import {
  searchShikimori,
  shikimoriToMovie,
  shikimoriToSeries,
} from '@/lib/shikimori';

/**
 * GET /api/shikimori/search
 *
 * Searches anime via the Shikimori GraphQL API.
 *
 * Query params:
 *   q     — required, search query
 *   limit — max results (default: 20)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 50);

  if (!q) {
    return NextResponse.json(
      { error: 'Missing required param: q' },
      { status: 400 }
    );
  }

  try {
    const results = await searchShikimori(q, limit);

    const items = results.map((anime) => {
      if (anime.kind === 'movie') return shikimoriToMovie(anime);
      return shikimoriToSeries(anime);
    });

    return NextResponse.json({
      data: items,
      total: items.length,
      page: 1,
      hasNextPage: false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Shikimori search failed', data: [], total: 0, page: 1 },
      { status: 502 }
    );
  }
}
