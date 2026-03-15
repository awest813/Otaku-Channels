/**
 * GET /api/recommendations/for-you?genres=Action,Fantasy&limit=12
 *
 * Returns genre-based "Recommended for you" anime.
 *
 * Priority chain:
 *   1. Backend /api/v1/recommendations/for-you (requires auth — skipped when
 *      no Authorization header is forwarded)
 *   2. Client-supplied genre hints (comma-separated `genres` param) ranked by
 *      genre overlap heuristic against the full catalogue
 *   3. Static popular picks from mock data as a final fallback
 */

import { NextResponse } from 'next/server';

import { BackendError, listAnime } from '@/lib/backend';
import { clampLimit } from '@/lib/params';
import { getSharedGenreRecs } from '@/lib/recommendations';

import { allContent } from '@/data/mockData';

import type { AnimeSeries, Movie } from '@/types';

const MAX_RESULTS = 12;
const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genreParam = searchParams.get('genres')?.trim();
  const limit = Math.min(
    clampLimit(searchParams.get('limit')) ?? MAX_RESULTS,
    MAX_RESULTS
  );

  const genres = genreParam
    ? genreParam
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
    : [];

  // 1. Attempt backend for-you route if auth token is present
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/recommendations/for-you`, {
        headers: { Authorization: authHeader, Accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: unknown[] };
        const data = json.data ?? [];
        if (data.length > 0) {
          return NextResponse.json({ data: data.slice(0, limit) });
        }
      }
    } catch {
      // Backend unavailable — fall through
    }
  }

  // 2. Genre-heuristic fallback using client-supplied genre hints
  if (genres.length > 0) {
    try {
      // Fetch all anime for the first preferred genre from the catalogue
      const result = await listAnime({ genre: genres[0], limit: 200 });
      const all = result.data as (AnimeSeries | Movie)[];

      if (all.length > 0) {
        // Build a synthetic "base" item representing the user's preferences
        const base = {
          id: '__forYou__',
          genres,
          releaseYear: 0,
          sourceType: 'youtube',
        } as unknown as AnimeSeries;

        const recs = getSharedGenreRecs(base, all, limit);
        if (recs.length > 0) return NextResponse.json({ data: recs });
      }
    } catch (err) {
      if (err instanceof BackendError && err.status < 500) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      // Backend unavailable — fall through to mock data
    }
  }

  // 3. Static fallback: filter mock data by preferred genres, or return varied picks
  const catalogue = allContent as (AnimeSeries | Movie)[];
  let picks: (AnimeSeries | Movie)[] = [];

  if (genres.length > 0) {
    picks = catalogue
      .filter((item) => item.genres.some((g) => genres.includes(g)))
      .slice(0, limit);
  }

  if (picks.length === 0) {
    picks = catalogue.slice(0, limit);
  }

  return NextResponse.json({ data: picks });
}
