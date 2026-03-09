import { NextResponse } from 'next/server';

import {
  BackendError,
  ConsumetProvider,
  getStreamingSources,
} from '@/lib/backend';

/**
 * GET /api/streaming/sources
 *
 * Query params:
 *   episodeId — required, provider-specific episode ID
 *   provider  — gogoanime | zoro | animepahe (default: gogoanime)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const episodeId = searchParams.get('episodeId')?.trim();

  if (!episodeId) {
    return NextResponse.json(
      { error: 'Missing required param: episodeId' },
      { status: 400 }
    );
  }

  try {
    const result = await getStreamingSources(
      episodeId,
      (searchParams.get('provider') as ConsumetProvider) ?? undefined
    );
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: 'Failed to fetch episode sources' },
      { status: 502 }
    );
  }
}
