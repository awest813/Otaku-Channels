import { NextResponse } from 'next/server';
import { searchStreaming, BackendError } from '@/lib/backend';

/**
 * GET /api/streaming/search
 *
 * Query params:
 *   q        — required, anime title to search
 *   provider — gogoanime | zoro | animepahe (default: gogoanime)
 *   page     — page number (default: 1)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return NextResponse.json({ error: 'Missing required param: q' }, { status: 400 });
  }

  try {
    const result = await searchStreaming({
      q,
      provider: (searchParams.get('provider') as any) ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Streaming search failed' }, { status: 502 });
  }
}
