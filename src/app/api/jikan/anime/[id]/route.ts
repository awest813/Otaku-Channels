import { NextResponse } from 'next/server';

import { getJikanAnime, jikanToMovie, jikanToSeries } from '@/lib/jikan';

/**
 * GET /api/jikan/anime/[id]
 *
 * Fetches full anime details from Jikan v4 by MAL ID.
 * Converts to AnimeSeries or Movie type.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const malId = Number(id);

  if (!id || isNaN(malId)) {
    return NextResponse.json({ error: 'Invalid MAL ID' }, { status: 400 });
  }

  try {
    const result = await getJikanAnime(malId);
    const anime = result.data;

    const item =
      anime.type === 'Movie' ? jikanToMovie(anime) : jikanToSeries(anime);

    return NextResponse.json({ data: item, raw: anime });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch anime from Jikan' },
      { status: 502 }
    );
  }
}
