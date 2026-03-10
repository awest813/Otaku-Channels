/**
 * GET /api/search/suggestions?q=...
 *
 * Returns up to 8 instant title suggestions for the search bar autocomplete.
 *
 * Priority chain:
 *   1. Backend /api/v1/search/suggest (PostgreSQL full-text prefix search)
 *   2. In-memory match from mock data (when backend is unavailable)
 */

import { NextResponse } from 'next/server';

import { BackendError, getSearchSuggestions } from '@/lib/backend';

import { allContent } from '@/data/mockData';

import type { AnimeSeries, Movie } from '@/types';

const MAX_SUGGESTIONS = 8;

export interface SearchSuggestion {
  slug: string;
  title: string;
  posterUrl: string | null;
}

function buildMockSuggestions(q: string): SearchSuggestion[] {
  const lq = q.toLowerCase();
  return (allContent as (AnimeSeries | Movie)[])
    .filter((item) => item.title.toLowerCase().includes(lq))
    .slice(0, MAX_SUGGESTIONS)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      posterUrl: item.thumbnail || null,
    }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';

  if (q.length < 1) {
    return NextResponse.json({ data: [] });
  }

  // 1. Try backend full-text prefix search
  try {
    const result = await getSearchSuggestions(q);
    return NextResponse.json({ data: result.data });
  } catch (err) {
    // Only swallow connection errors / 5xx — pass 4xx through
    if (err instanceof BackendError && err.status < 500) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }
  }

  // 2. Fallback: in-memory match
  return NextResponse.json({ data: buildMockSuggestions(q) });
}
