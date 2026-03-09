import { NextResponse } from 'next/server';

import { BackendError, listChannels } from '@/lib/backend';

import type { LiveChannel } from '@/types';

/**
 * GET /api/live
 *
 * Returns public live channels from the Fastify backend.
 * Query params: source (filter by channel type — client-side only, backend returns all public)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source')?.toLowerCase();

  try {
    const result = await listChannels();

    // Apply optional source/type filter on the response if requested
    const data = source
      ? (result.data as LiveChannel[]).filter(
          (ch) => (ch.sourceType ?? '').toLowerCase() === source
        )
      : result.data;

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: 'Failed to fetch live channels' },
      { status: 502 }
    );
  }
}
