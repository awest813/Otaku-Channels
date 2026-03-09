import { NextResponse } from 'next/server';

import { getEpisodesBySeries, getSeriesBySlug } from '@/data/mockData';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/series/:slug/episodes
 *
 * Returns all episodes for the AnimeSeries matching `slug`.
 * Returns 404 if the series itself doesn't exist.
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);

  if (!series) {
    return NextResponse.json(
      { error: `Series "${slug}" not found` },
      { status: 404 }
    );
  }

  const episodes = getEpisodesBySeries(slug);
  return NextResponse.json({ data: episodes, total: episodes.length });
}
