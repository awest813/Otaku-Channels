import { NextResponse } from 'next/server';

import { BackendError, listAnime } from '@/lib/backend';

/**
 * GET /api/series
 *
 * Query params forwarded to the backend:
 *   genre, source, language, tag, type, status, sort, page, limit
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await listAnime({
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
    });

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 502 }
    );
  }
}
