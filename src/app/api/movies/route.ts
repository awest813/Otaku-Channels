import { NextResponse } from 'next/server';
import { listAnime, BackendError } from '@/lib/backend';

/**
 * GET /api/movies
 *
 * Proxies to /api/v1/anime with type=MOVIE.
 * Query params: genre, source, language, sort, page, limit
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await listAnime({
      type: 'MOVIE',
      genre: searchParams.get('genre') ?? undefined,
      source: searchParams.get('source') ?? undefined,
      language: searchParams.get('language') ?? undefined,
      sort: (searchParams.get('sort') as any) ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 502 });
  }
}
