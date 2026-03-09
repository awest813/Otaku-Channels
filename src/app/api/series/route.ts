import { NextResponse } from 'next/server';

import { mockSeries } from '@/data/mockData';

/**
 * GET /api/series
 *
 * Query params:
 *   genre    — filter by genre name (case-insensitive)
 *   source   — filter by sourceType (e.g. "youtube", "tubi")
 *   language — filter by language ("sub" | "dub" | "both")
 *   tag      — filter by tag name (case-insensitive)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre')?.toLowerCase();
  const source = searchParams.get('source')?.toLowerCase();
  const language = searchParams.get('language')?.toLowerCase();
  const tag = searchParams.get('tag')?.toLowerCase();

  let results = mockSeries;

  if (genre) {
    results = results.filter((s) =>
      s.genres.some((g) => g.toLowerCase() === genre)
    );
  }
  if (source) {
    results = results.filter((s) => s.sourceType.toLowerCase() === source);
  }
  if (language) {
    results = results.filter((s) => s.language.toLowerCase() === language);
  }
  if (tag) {
    results = results.filter((s) =>
      s.tags.some((t) => t.toLowerCase() === tag)
    );
  }

  return NextResponse.json({ data: results, total: results.length });
}
