'use client';

import * as React from 'react';
import { z } from 'zod';

import { useAuth } from '@/context/auth';

const STORAGE_KEY = 'anime-tv-watchlist';

export interface WatchlistItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  sourceType: string;
  releaseYear: number;
}

const WatchlistItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  sourceType: z.string(),
  releaseYear: z.number(),
});

const WatchlistSchema = z.array(WatchlistItemSchema);

function readStorage(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = WatchlistSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WatchlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function getAuthHeaders(contentType?: string): HeadersInit | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = localStorage.getItem('access_token');
  if (!token && !contentType) return undefined;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

export function useWatchlist() {
  const { user } = useAuth();
  const [list, setList] = React.useState<WatchlistItem[]>([]);
  const [synced, setSynced] = React.useState(false);

  // Hydrate: if logged in, try backend first then merge with localStorage
  React.useEffect(() => {
    if (user) {
      fetch('/api/user/watchlist', {
        credentials: 'include',
        headers: getAuthHeaders(),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (
            data: {
              data?: { items?: Array<{ animeId: string; note?: string }> };
            } | null
          ) => {
            if (data?.data?.items) {
              // Backend has a list of watchlist items — extract what we need.
              // The backend watchlist items only store animeId; for display we
              // fall back to the locally cached thumbnails/titles if available.
              const local = readStorage();
              const localMap = new Map(local.map((i) => [i.id, i]));
              const merged: WatchlistItem[] = data.data.items
                .map((item) => localMap.get(item.animeId))
                .filter((i): i is WatchlistItem => i !== undefined);

              // Keep local items that aren't on the backend yet (optimistic)
              const backendIds = new Set(data.data.items.map((i) => i.animeId));
              const localOnly = local.filter((i) => !backendIds.has(i.id));
              const combined = [...merged, ...localOnly];
              setList(combined);
              writeStorage(combined);
            } else {
              setList(readStorage());
            }
          }
        )
        .catch(() => setList(readStorage()))
        .finally(() => setSynced(true));
    } else {
      setList(readStorage());
      setSynced(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Re-run only when the user's identity changes (login/logout)

  const isInList = React.useCallback(
    (id: string) => list.some((i) => i.id === id),
    [list]
  );

  const add = React.useCallback(
    (item: WatchlistItem) => {
      setList((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev;
        const next = [item, ...prev];
        writeStorage(next);
        return next;
      });
      // Sync to backend when logged in
      if (user) {
        fetch('/api/user/watchlist', {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders('application/json'),
          body: JSON.stringify({ animeId: item.id }),
        }).catch((err) => {
          // Non-fatal — item already added locally
          // eslint-disable-next-line no-console
          console.warn('[useWatchlist] backend sync failed:', err);
        });
      }
    },
    [user]
  );

  const remove = React.useCallback(
    (id: string) => {
      setList((prev) => {
        const next = prev.filter((i) => i.id !== id);
        writeStorage(next);
        return next;
      });
      // Sync removal to backend when logged in
      if (user) {
        fetch(`/api/user/watchlist?animeId=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: getAuthHeaders(),
        }).catch((err) => {
          // Non-fatal — item already removed locally
          // eslint-disable-next-line no-console
          console.warn('[useWatchlist] backend remove sync failed:', err);
        });
      }
    },
    [user]
  );

  const toggle = React.useCallback(
    (item: WatchlistItem) => {
      if (isInList(item.id)) {
        remove(item.id);
        return false;
      } else {
        add(item);
        return true;
      }
    },
    [isInList, add, remove]
  );

  return { list, isInList, add, remove, toggle, synced };
}
