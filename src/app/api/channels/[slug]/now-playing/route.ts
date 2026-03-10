/**
 * GET /api/channels/[slug]/now-playing
 *
 * Returns the currently-airing slot and the next slot for a channel,
 * including progress percentage and seconds remaining.
 *
 * Returns 404 when the slug is not found.
 */
import { NextResponse } from 'next/server';

import { computeNowPlaying } from '@/lib/channelSchedule';

import { getChannelBySlug } from '@/data/channels';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const channel = getChannelBySlug(slug);

  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  const nowPlaying = computeNowPlaying(channel);

  return NextResponse.json({ data: nowPlaying });
}
