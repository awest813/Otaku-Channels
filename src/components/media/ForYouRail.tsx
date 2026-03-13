'use client';

/**
 * ForYouRail
 *
 * Shows a "Recommended for you" rail personalised by the genres the user has
 * been watching most recently.
 *
 * Strategy:
 *   1. Derive preferred genres from `useRecentlyViewed` history (top-2 by
 *      frequency, with de-duplication).
 *   2. Fetch `/api/recommendations/for-you?genres=...` which tries the backend
 *      for-you endpoint (auth-gated) then falls back to a genre-overlap
 *      heuristic against the full catalogue.
 *   3. Filter out items the user has already seen so the rail stays fresh.
 *
 * Renders nothing when:
 *   • The user has no watch history
 *   • No matching recommendations are found
 */

import * as React from 'react';

import { getForYouRecommendations } from '@/lib/api-client';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

import { allContent } from '@/data/mockData';

import MediaRail from './MediaRail';
import MediaRailSkeleton from './MediaRailSkeleton';

import type { AnimeSeries, Movie } from '@/types';

/** Maximum number of genre preferences to derive from history. */
const MAX_GENRE_SIGNALS = 3;

/** Number of recent items to include when deriving genre preferences. */
const HISTORY_WINDOW = 6;

/**
 * Derive the user's top-N genre preferences from their recently viewed items.
 * Genres are ranked by how many recent views mention them.
 */
function deriveTopGenres(
  recentIds: string[],
  catalogue: (AnimeSeries | Movie)[],
  maxGenres: number
): string[] {
  const counts = new Map<string, number>();

  for (const id of recentIds) {
    const item = catalogue.find((c) => c.id === id || c.slug === id);
    if (!item) continue;
    for (const genre of item.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxGenres)
    .map(([genre]) => genre);
}

export default function ForYouRail() {
  const { items: recentItems } = useRecentlyViewed();
  const [recs, setRecs] = React.useState<(AnimeSeries | Movie)[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Stable dependency: only the IDs of the most recent items
  const recentIds = recentItems.slice(0, HISTORY_WINDOW).map((i) => i.id);
  const recentIdsKey = recentIds.join(',');

  React.useEffect(() => {
    if (recentIds.length === 0) {
      setRecs(null);
      return;
    }

    const catalogue = allContent as (AnimeSeries | Movie)[];
    const topGenres = deriveTopGenres(recentIds, catalogue, MAX_GENRE_SIGNALS);

    if (topGenres.length === 0) {
      setRecs(null);
      return;
    }

    setLoading(true);

    const seenIds = new Set(recentIds);

    getForYouRecommendations(topGenres)
      .then((result) => {
        const fresh = (result.data as (AnimeSeries | Movie)[]).filter(
          (item) => !seenIds.has(item.id)
        );
        setRecs(fresh.length > 0 ? fresh : null);
      })
      .catch(() => {
        // Best-effort: silently render nothing on failure
        setRecs(null);
      })
      .finally(() => setLoading(false));
    // recentIdsKey is a stable string derived from recentIds — safe as the sole dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentIdsKey]);

  if (!mounted || recentIds.length === 0) return null;
  if (loading) return <MediaRailSkeleton />;
  if (!recs || recs.length === 0) return null;

  return (
    <MediaRail
      title='Recommended for You'
      description='Based on your watch history'
      items={recs}
      seeAllHref='/browse'
    />
  );
}
