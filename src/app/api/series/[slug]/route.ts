import { NextResponse } from 'next/server';

import { BackendError, getAnime } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';

import { getSeriesBySlug } from '@/data/mockData';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/series/:slug
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const mode = getDataMode();

  if (mode === 'mock') {
    return mockResponse(slug);
  }

  try {
    const result = await getAnime(slug);
    return NextResponse.json(result);
  } catch (err) {
    if (mode === 'backend') {
      if (err instanceof BackendError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch series "${slug}"` },
        { status: 502 }
      );
    }
    // hybrid — fall back to mock
    return mockResponse(slug);
  }
}

function mockResponse(slug: string) {
  const series = getSeriesBySlug(slug);
  if (!series) {
    return NextResponse.json(
      { error: `Series "${slug}" not found` },
      { status: 404 }
    );
  }
  return NextResponse.json({ data: series });
}
