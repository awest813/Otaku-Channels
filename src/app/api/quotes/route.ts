import { NextResponse } from 'next/server';

const ANIMECHAN_BASE = process.env.ANIMECHAN_BASE_URL ?? 'https://animechan.io';

export interface AnimeQuote {
  content: string;
  character: { name: string; image: string | null };
  anime: { name: string; image: string | null; slug: string };
}

/**
 * GET /api/quotes
 *
 * Returns random anime quotes from AnimeChan.
 *
 * Query params:
 *   count     — number of quotes (1-10, default 5)
 *   anime     — filter by anime title
 *   character — filter by character name
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const count = Math.min(
    Math.max(1, Number(searchParams.get('count') ?? 5)),
    10
  );
  const anime = searchParams.get('anime');
  const character = searchParams.get('character');

  let path = `/api/v1/quotes/random?count=${count}`;
  if (anime) path += `&anime=${encodeURIComponent(anime)}`;
  if (character) path += `&character=${encodeURIComponent(character)}`;

  try {
    const res = await fetch(`${ANIMECHAN_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch quotes' },
        { status: 502 }
      );
    }

    const raw = await res.json();
    // AnimeChan returns either a single object or an array depending on count
    const quotes: AnimeQuote[] = Array.isArray(raw) ? raw : [raw];

    return NextResponse.json({ data: quotes, total: quotes.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 502 }
    );
  }
}
