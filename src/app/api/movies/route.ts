import { NextResponse } from 'next/server';

import { mockMovies } from '@/data/mockData';

/**
 * GET /api/movies
 *
 * Query params:
 *   genre    — filter by genre name (case-insensitive)
 *   source   — filter by sourceType (e.g. "youtube", "tubi")
 *   language — filter by language ("sub" | "dub" | "both")
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre')?.toLowerCase();
  const source = searchParams.get('source')?.toLowerCase();
  const language = searchParams.get('language')?.toLowerCase();

  let results = mockMovies;

  if (genre) {
    results = results.filter((m) =>
      m.genres.some((g) => g.toLowerCase() === genre)
    );
  }
  if (source) {
    results = results.filter((m) => m.sourceType.toLowerCase() === source);
  }
  if (language) {
    results = results.filter((m) => m.language.toLowerCase() === language);
  }

  return NextResponse.json({ data: results, total: results.length });
}
