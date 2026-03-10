/**
 * POST /api/analytics
 *
 * Receives analytics events from the client and forwards them to the
 * backend watch-history endpoint (which also records recommendation signals).
 *
 * Body: { event, animeId, episodeId?, sourceType?, completed? }
 *
 * Events:
 *   viewed_title          — user viewed a series detail page
 *   started_watch         — user clicked play / external watch link
 *   completed_episode     — episode watched to completion
 *   added_watchlist       — user added a title to My List
 *   clicked_external      — user clicked an external provider link
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

const AnalyticsEventSchema = z.object({
  event: z.enum([
    'viewed_title',
    'started_watch',
    'completed_episode',
    'added_watchlist',
    'clicked_external',
  ]),
  animeId: z.string(),
  episodeId: z.string().optional(),
  sourceType: z.string().optional(),
  completed: z.boolean().optional(),
});

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';
if (!process.env.BACKEND_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[analytics] BACKEND_URL is not set; defaulting to http://localhost:3001'
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = AnalyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid event' },
      { status: 400 }
    );
  }

  const { event, animeId, episodeId, sourceType } = parsed.data;
  const completed =
    event === 'completed_episode' ? true : parsed.data.completed ?? false;

  // Forward to backend watch-history (which records recommendation signals)
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/watch-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward cookies so the backend can authenticate the user
        cookie: request.headers.get('cookie') ?? '',
      },
      body: JSON.stringify({ animeId, episodeId, sourceType, completed }),
      cache: 'no-store',
    });
    if (!res.ok) {
      // Non-fatal: analytics events are best-effort
      return NextResponse.json({ ok: false, forwarded: false });
    }
  } catch {
    // Backend unavailable — analytics are best-effort, do not fail the client
    return NextResponse.json({ ok: true, forwarded: false });
  }

  return NextResponse.json({ ok: true, forwarded: true, event });
}
