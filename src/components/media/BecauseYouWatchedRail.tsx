'use client';

/**
 * BecauseYouWatchedRail
 *
 * Shows a "Because you watched <Title>" recommendation rail.
 * Picks the most recently viewed item from local history, fetches similar
 * titles from /api/recommendations, and falls back to client-side heuristics
 * from the mock catalogue when the API is unavailable.
 *
 * Renders nothing when:
 *   • No recently-viewed items exist
 *   • No similar titles can be found
 */

import * as React from 'react';

import { getRecommendations } from '@/lib/api-client';
import { getCombinedRecs } from '@/lib/recommendations';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

import { allContent } from '@/data/mockData';

import MediaRail from './MediaRail';
import MediaRailSkeleton from './MediaRailSkeleton';

import type { AnimeSeries, Movie } from '@/types';

export default function BecauseYouWatchedRail() {
  const { items: recentItems } = useRecentlyViewed();
  const [recs, setRecs] = React.useState<(AnimeSeries | Movie)[] | null>(null);
  const [basedOnTitle, setBasedOnTitle] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const latestItem = recentItems[0];

  React.useEffect(() => {
    if (!latestItem) {
      setRecs(null);
      return;
    }

    setLoading(true);
    setBasedOnTitle(latestItem.title);

    getRecommendations({ animeId: latestItem.id, slug: latestItem.slug })
      .then((result) => {
        if (result.data.length > 0) {
          setRecs(result.data as (AnimeSeries | Movie)[]);
        } else {
          // Heuristic fallback using mock catalogue
          const all = allContent as (AnimeSeries | Movie)[];
          const base = all.find(
            (i) => i.id === latestItem.id || i.slug === latestItem.slug
          );
          if (base) {
            const fallbackRecs = getCombinedRecs(base, all, 12);
            setRecs(fallbackRecs.length > 0 ? fallbackRecs : null);
          } else {
            setRecs(null);
          }
        }
      })
      .catch(() => {
        // Heuristic fallback
        const all = allContent as (AnimeSeries | Movie)[];
        const base = all.find(
          (i) => i.id === latestItem.id || i.slug === latestItem.slug
        );
        if (base) {
          const fallbackRecs = getCombinedRecs(base, all, 12);
          setRecs(fallbackRecs.length > 0 ? fallbackRecs : null);
        } else {
          setRecs(null);
        }
      })
      .finally(() => setLoading(false));
    // latestItem.id is the stable identifier for the last-viewed anime.
    // Including slug covers cases where the same item is stored under a
    // different id (e.g. mock vs. backend). Other latestItem fields (title,
    // thumbnail) are display-only and do not affect which recommendations to
    // fetch, so they are intentionally omitted to avoid redundant refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestItem?.id, latestItem?.slug]);

  if (!mounted || !latestItem) return null;
  if (loading) return <MediaRailSkeleton />;
  if (!recs || recs.length === 0) return null;

  return (
    <MediaRail
      title={`Because you watched ${basedOnTitle}`}
      description="More like what you've been watching"
      items={recs}
      seeAllHref='/browse'
    />
  );
}
