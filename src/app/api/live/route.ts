import { NextResponse } from 'next/server';

import { BackendError, listChannels } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';

import { mockLiveChannels } from '@/data/mockData';

/**
 * GET /api/live
 *
 * Returns public live channels from the Fastify backend.
 * Query params: source (filter by channel type — client-side only, backend returns all public)
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source')?.toLowerCase();
  const mode = getDataMode();

  if (mode === 'mock') {
    return NextResponse.json(buildMockResponse(source));
  }

  try {
    const result = await listChannels();

    // Apply optional source/type filter on the response if requested
    const data = source
      ? result.data.filter(
          (ch) => (ch.sourceType ?? '').toLowerCase() === source
        )
      : result.data;

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    if (mode === 'backend') {
      if (err instanceof BackendError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch live channels' },
        { status: 502 }
      );
    }
    // hybrid — fall back to mock
    return NextResponse.json(buildMockResponse(source));
  }
}

function buildMockResponse(source?: string | null) {
  const data = source
    ? mockLiveChannels.filter(
        (ch) => (ch.sourceType ?? '').toLowerCase() === source
      )
    : [...mockLiveChannels];
  return { data, total: data.length };
}
