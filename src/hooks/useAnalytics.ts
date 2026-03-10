'use client';

/**
 * useAnalytics — lightweight analytics event tracker.
 *
 * Fires best-effort POST requests to /api/analytics. All calls are
 * non-blocking and silently swallow errors so that a failed analytics
 * event never disrupts the user experience.
 *
 * Events:
 *   viewed_title          — user viewed a series detail page
 *   started_watch         — user clicked play or an external watch link
 *   completed_episode     — episode watched to completion
 *   added_watchlist       — user added a title to My List
 *   clicked_external      — user clicked an external provider link
 */

import * as React from 'react';

export type AnalyticsEvent =
  | 'viewed_title'
  | 'started_watch'
  | 'completed_episode'
  | 'added_watchlist'
  | 'clicked_external';

export interface TrackEventParams {
  event: AnalyticsEvent;
  animeId: string;
  episodeId?: string;
  sourceType?: string;
  completed?: boolean;
}

async function fireEvent(params: TrackEventParams): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch {
    // Best-effort — never propagate analytics failures
  }
}

export function useAnalytics() {
  const track = React.useCallback((params: TrackEventParams) => {
    // Fire-and-forget in the background
    void fireEvent(params);
  }, []);

  const trackViewedTitle = React.useCallback(
    (animeId: string) => track({ event: 'viewed_title', animeId }),
    [track]
  );

  const trackStartedWatch = React.useCallback(
    (animeId: string, episodeId?: string, sourceType?: string) =>
      track({ event: 'started_watch', animeId, episodeId, sourceType }),
    [track]
  );

  const trackCompletedEpisode = React.useCallback(
    (animeId: string, episodeId?: string) =>
      track({
        event: 'completed_episode',
        animeId,
        episodeId,
        completed: true,
      }),
    [track]
  );

  const trackAddedWatchlist = React.useCallback(
    (animeId: string) => track({ event: 'added_watchlist', animeId }),
    [track]
  );

  const trackClickedExternal = React.useCallback(
    (animeId: string, sourceType?: string) =>
      track({ event: 'clicked_external', animeId, sourceType }),
    [track]
  );

  return {
    track,
    trackViewedTitle,
    trackStartedWatch,
    trackCompletedEpisode,
    trackAddedWatchlist,
    trackClickedExternal,
  };
}
