import { NextResponse } from 'next/server';

import {
  getShikimoriAnime,
  shikimoriToMovie,
  shikimoriToSeries,
} from '@/lib/shikimori';

/**
 * GET /api/shikimori/anime/[id]
 *
 * Fetches full anime details from Shikimori GraphQL API by Shikimori ID.
 * Converts to AnimeSeries or Movie type.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Invalid Shikimori ID' },
      { status: 400 }
    );
  }

  try {
    const anime = await getShikimoriAnime(id);

    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    const item =
      anime.kind === 'movie'
        ? shikimoriToMovie(anime)
        : shikimoriToSeries(anime);

    return NextResponse.json({ data: item, raw: anime });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch anime from Shikimori' },
      { status: 502 }
    );
  }
}
