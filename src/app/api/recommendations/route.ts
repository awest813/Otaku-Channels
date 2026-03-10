/**
 * GET /api/recommendations?animeId=...
 *
 * Returns similar anime titles based on the given animeId.
 *
 * Priority chain:
 *   1. Backend /api/v1/recommendations/similar/:animeId
 *   2. Client-side heuristic fallback (genre overlap from mock data)
 */

import { NextResponse } from 'next/server';

import { BackendError, getSimilarAnime } from '@/lib/backend';
import { getSharedGenreRecs } from '@/lib/recommendations';

import { allContent } from '@/data/mockData';

import type { AnimeSeries, Movie } from '@/types';

const MAX_RESULTS = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const animeId = searchParams.get('animeId')?.trim();
  const slug = searchParams.get('slug')?.trim();

  if (!animeId && !slug) {
    return NextResponse.json(
      { error: 'Provide animeId or slug' },
      { status: 400 }
    );
  }

  // 1. Try backend similar endpoint
  if (animeId) {
    try {
      const result = await getSimilarAnime(animeId);
      if (result.data.length > 0) {
        return NextResponse.json({ data: result.data });
      }
    } catch (err) {
      if (err instanceof BackendError && err.status < 500) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      // Backend unavailable — fall through to heuristics
    }
  }

  // 2. Heuristic fallback: genre overlap from mock data
  const all = allContent as (AnimeSeries | Movie)[];
  const base =
    all.find((i) => i.id === animeId) ?? all.find((i) => i.slug === slug);

  if (!base) {
    return NextResponse.json({ data: [] });
  }

  const similar = getSharedGenreRecs(base, all, MAX_RESULTS);
  return NextResponse.json({ data: similar });
}
