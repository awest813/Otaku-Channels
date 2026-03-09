import { NextResponse } from 'next/server';
import { getAnimeEpisodes, BackendError } from '@/lib/backend';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/series/:slug/episodes
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const result = await getAnimeEpisodes(slug);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: `Failed to fetch episodes for "${slug}"` }, { status: 502 });
  }
}
