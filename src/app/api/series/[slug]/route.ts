import { NextResponse } from 'next/server';

import { getSeriesBySlug } from '@/data/mockData';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/series/:slug
 *
 * Returns the AnimeSeries matching `slug`, or 404 if not found.
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);

  if (!series) {
    return NextResponse.json(
      { error: `Series "${slug}" not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: series });
}
