import { NextResponse } from 'next/server';

const WAIFUPICS_BASE =
  process.env.WAIFUPICS_BASE_URL ?? 'https://api.waifu.pics';

const SFW_TYPES = new Set([
  'waifu',
  'neko',
  'shinobu',
  'megumin',
  'bully',
  'cuddle',
  'cry',
  'hug',
  'awoo',
  'kiss',
  'lick',
  'pat',
  'smug',
  'bonk',
  'yeet',
  'blush',
  'smile',
  'wave',
  'highfive',
  'handhold',
  'nom',
  'bite',
  'glomp',
  'slap',
  'kill',
  'kick',
  'happy',
  'wink',
  'poke',
  'dance',
  'cringe',
]);

/**
 * GET /api/images
 *
 * Returns random SFW anime images from Waifu.pics.
 *
 * Query params:
 *   type  — image category (waifu, neko, shinobu, etc., default "waifu")
 *   many  — set to "true" to get up to 30 images instead of 1
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const type = searchParams.get('type') ?? 'waifu';
  if (!SFW_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Invalid image type. Allowed: ${[...SFW_TYPES].join(', ')}` },
      { status: 400 }
    );
  }

  const many = searchParams.get('many') === 'true';

  try {
    if (many) {
      const res = await fetch(`${WAIFUPICS_BASE}/many/sfw/${type}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exclude: [] }),
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      });

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch images' },
          { status: 502 }
        );
      }

      const data = (await res.json()) as { files: string[] };
      return NextResponse.json({
        data: data.files,
        total: data.files.length,
      });
    }

    const res = await fetch(`${WAIFUPICS_BASE}/sfw/${type}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { url: string };
    return NextResponse.json({ data: data.url ?? null });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 502 }
    );
  }
}
