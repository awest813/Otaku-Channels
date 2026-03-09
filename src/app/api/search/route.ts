import { NextResponse } from 'next/server';
import { searchAnime, BackendError } from '@/lib/backend';

/**
 * GET /api/search
 *
 * Query params:
 *   q      — required, free-text query
 *   genre  — filter by genre slug
 *   source — filter by sourceType
 *   type, year, season, sort, page, limit
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return NextResponse.json(
      { error: 'Provide at least one search query: q' },
      { status: 400 },
    );
  }

  try {
    const result = await searchAnime({
      q,
      genre: searchParams.get('genre') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined,
      season: searchParams.get('season') ?? undefined,
      sort: (searchParams.get('sort') as any) ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 502 });
  }
}
