/**
 * GET /api/channels/[slug]
 *
 * Returns a single themed channel with its current "now playing" and "up next"
 * entries.  Returns 404 when the slug is not found.
 */
import { NextResponse } from 'next/server';

import { getChannelLive } from '@/lib/channelSchedule';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const channel = getChannelLive(slug);

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  return NextResponse.json({ data: channel });
}
