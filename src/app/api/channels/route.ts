/**
 * GET /api/channels
 *
 * Returns all themed pseudo-live channels with their current "now playing" and
 * "up next" entries computed deterministically from the schedule engine.
 *
 * Query params:
 *   genre  – filter by channel genre (case-insensitive)
 *   mood   – filter by channel mood (case-insensitive)
 */
import { NextResponse } from 'next/server';

import { listChannelsLive } from '@/lib/channelSchedule';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre')?.toLowerCase();
  const mood = searchParams.get('mood')?.toLowerCase();

  let channels = listChannelsLive();

  if (genre) {
    channels = channels.filter((ch) => ch.genre?.toLowerCase() === genre);
  }
  if (mood) {
    channels = channels.filter((ch) => ch.mood?.toLowerCase() === mood);
  }

  return NextResponse.json({ data: channels, total: channels.length });
}
