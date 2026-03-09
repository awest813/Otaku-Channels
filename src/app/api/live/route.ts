import { NextResponse } from 'next/server';

import { mockLiveChannels } from '@/data/mockData';

/**
 * GET /api/live
 *
 * Returns all live channels.
 *
 * Query params:
 *   source — filter by sourceType (e.g. "pluto", "youtube")
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source')?.toLowerCase();

  let results = mockLiveChannels;

  if (source) {
    results = results.filter((ch) => ch.sourceType.toLowerCase() === source);
  }

  return NextResponse.json({ data: results, total: results.length });
}
