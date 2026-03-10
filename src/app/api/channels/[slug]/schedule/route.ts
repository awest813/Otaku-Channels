/**
 * GET /api/channels/[slug]/schedule
 *
 * Returns the full ordered schedule for a channel in the current cycle,
 * annotated with absolute start/end timestamps (UTC epoch-ms) and an `isNow`
 * flag for the currently-airing slot.
 *
 * Returns 404 when the slug is not found.
 */
import { NextResponse } from 'next/server';

import { computeSchedule } from '@/lib/channelSchedule';

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

  const schedule = computeSchedule(channel);

  return NextResponse.json({
    channelSlug: slug,
    data: schedule,
    total: schedule.length,
  });
}
