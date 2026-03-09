import { NextResponse } from 'next/server';
import { getStreamingInfo, BackendError } from '@/lib/backend';

/**
 * GET /api/streaming/info
 *
 * Query params:
 *   id       — required, provider-specific anime ID
 *   provider — gogoanime | zoro | animepahe (default: gogoanime)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id')?.trim();

  if (!id) {
    return NextResponse.json({ error: 'Missing required param: id' }, { status: 400 });
  }

  try {
    const result = await getStreamingInfo(id, (searchParams.get('provider') as any) ?? undefined);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to fetch streaming info' }, { status: 502 });
  }
}
