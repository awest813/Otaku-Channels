import { NextResponse } from 'next/server';
import { listChannels, BackendError } from '@/lib/backend';

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
      ? (result.data as any[]).filter(
          (ch) =>
            (ch.type ?? '').toLowerCase() === source ||
            (ch.slug ?? '').toLowerCase().includes(source),
        )
      : result.data;

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to fetch live channels' }, { status: 502 });
  }
}
