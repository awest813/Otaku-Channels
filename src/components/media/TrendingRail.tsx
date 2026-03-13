/**
 * TrendingRail
 *
 * Server component that surfaces the current trending anime from the backend.
 * Falls back to tag-based filtering on mock data when the backend is unavailable.
 *
 * Renders nothing when there are no trending titles to display.
 */

import { getTrendingAnime } from '@/lib/backend';

import { mockSeries } from '@/data/mockData';

import MediaRail from './MediaRail';

import type { AnimeSeries, Movie } from '@/types';

export default async function TrendingRail() {
  let trending: (AnimeSeries | Movie)[] = [];

  try {
    const result = await getTrendingAnime();
    trending = result.data;
  } catch {
    // Backend unavailable — fall back to tag-based mock trending
  }

  // Fallback: titles tagged as Trending in mock data
  if (trending.length === 0) {
    trending = mockSeries.filter((s) => s.tags?.includes('Trending'));
  }

  if (trending.length === 0) return null;

  return (
    <MediaRail
      title='Trending Now'
      description='Most popular anime right now based on view counts'
      items={trending}
      seeAllHref='/browse'
    />
  );
}
