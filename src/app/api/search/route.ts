import { NextResponse } from 'next/server';

import { allContent } from '@/data/mockData';

/**
 * GET /api/search
 *
 * Query params (at least one required):
 *   q      — free-text query matched against title, description, and genres
 *   genre  — filter by genre name (case-insensitive)
 *   source — filter by sourceName (case-insensitive)
 *
 * Returns a 400 if no query params are provided.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();
  const genre = searchParams.get('genre')?.toLowerCase();
  const source = searchParams.get('source')?.toLowerCase();

  if (!q && !genre && !source) {
    return NextResponse.json(
      { error: 'Provide at least one of: q, genre, source' },
      { status: 400 }
    );
  }

  const results = allContent.filter((item) => {
    if (q) {
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesGenre = item.genres.some((g) => g.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesGenre) return false;
    }
    if (genre && !item.genres.some((g) => g.toLowerCase() === genre))
      return false;
    if (source && item.sourceName.toLowerCase() !== source) return false;
    return true;
  });

  return NextResponse.json({ data: results, total: results.length });
}
