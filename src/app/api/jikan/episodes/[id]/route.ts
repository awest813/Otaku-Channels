import { NextResponse } from 'next/server';

import { getJikanAnime, getJikanEpisodes } from '@/lib/jikan';

import type { Episode } from '@/types';

/**
 * GET /api/jikan/episodes/[id]
 *
 * Fetches episode list for an anime by MAL ID from Jikan v4.
 * Episodes don't have streaming URLs; they link to the series watch URL.
 *
 * Query params:
 *   page — page (default: 1)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const malId = Number(id);
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');

  if (!id || isNaN(malId)) {
    return NextResponse.json({ error: 'Invalid MAL ID' }, { status: 400 });
  }

  try {
    // Fetch anime info (for thumbnail, streaming links) in parallel with episodes
    const [animeResult, episodesResult] = await Promise.all([
      getJikanAnime(malId),
      getJikanEpisodes(malId, page),
    ]);

    const anime = animeResult.data;
    const thumbnail = anime.images?.jpg?.image_url ?? '';

    // Determine a watch URL: prefer Crunchyroll, fall back to MAL URL
    const streaming = anime.streaming ?? [];
    const cr = streaming.find((s) => s.name === 'Crunchyroll');
    const watchUrl = cr?.url ?? anime.url;

    const episodes: Episode[] = (episodesResult.data ?? []).map((ep) => ({
      id: `jikan-ep-${malId}-${ep.mal_id}`,
      seriesSlug: `jikan-${malId}`,
      title: ep.title || ep.title_romanji || `Episode ${ep.mal_id}`,
      description: ep.filler
        ? 'Filler episode'
        : ep.recap
        ? 'Recap episode'
        : '',
      thumbnail,
      episodeNumber: ep.mal_id,
      seasonNumber: 1,
      duration: '~24 min',
      watchUrl,
      isEmbeddable: false,
      sourceName: cr ? 'Crunchyroll' : 'MyAnimeList',
    }));

    return NextResponse.json({
      data: episodes,
      total: episodes.length,
      page,
      hasNextPage: episodesResult.pagination?.has_next_page ?? false,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch episodes from Jikan', data: [], total: 0 },
      { status: 502 }
    );
  }
}
