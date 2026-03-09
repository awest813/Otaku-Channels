import { NextResponse } from 'next/server';

import { getKitsuAnime, kitsuToMovie, kitsuToSeries } from '@/lib/kitsu';

/**
 * GET /api/kitsu/anime/[id]
 *
 * Fetches full anime details from Kitsu by Kitsu ID.
 * Converts to AnimeSeries or Movie type.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Invalid Kitsu ID' }, { status: 400 });
  }

  try {
    const result = await getKitsuAnime(id);
    const anime = result.data;

    const item =
      anime.attributes.subtype?.toLowerCase() === 'movie'
        ? kitsuToMovie(anime)
        : kitsuToSeries(anime);

    return NextResponse.json({ data: item, raw: anime });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch anime from Kitsu' },
      { status: 502 }
    );
  }
}
