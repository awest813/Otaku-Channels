import { NextResponse } from 'next/server';

import { kitsuToMovie, kitsuToSeries, searchKitsu } from '@/lib/kitsu';

/**
 * GET /api/kitsu/search
 *
 * Searches anime via the Kitsu REST API.
 *
 * Query params:
 *   q    — required, search query
 *   limit — max results (default: 20)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 20);

  if (!q) {
    return NextResponse.json(
      { error: 'Missing required param: q' },
      { status: 400 }
    );
  }

  try {
    const result = await searchKitsu(q, limit);

    const items = (result.data ?? []).map((anime) => {
      if (anime.attributes.subtype?.toLowerCase() === 'movie')
        return kitsuToMovie(anime);
      return kitsuToSeries(anime);
    });

    return NextResponse.json({
      data: items,
      total: result.meta?.count ?? items.length,
      page: 1,
      hasNextPage: false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Kitsu search failed', data: [], total: 0, page: 1 },
      { status: 502 }
    );
  }
}
