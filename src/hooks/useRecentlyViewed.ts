'use client';

import * as React from 'react';
import { z } from 'zod';

import { useAuth } from '@/context/auth';

const STORAGE_KEY = 'anime-tv-recently-viewed';
const MAX_ITEMS = 12;

export interface RecentItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  sourceType: string;
  releaseYear: number;
  viewedAt: number;
}

const RecentItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  sourceType: z.string(),
  releaseYear: z.number(),
  viewedAt: z.number(),
});

const RecentItemsSchema = z.array(RecentItemSchema);

function readStorage(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = RecentItemsSchema.safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

function writeStorage(items: RecentItem[]) {
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

export function useRecentlyViewed() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<RecentItem[]>([]);

  React.useEffect(() => {
    if (user) {
      fetch('/api/user/watch-history', {
        credentials: 'include',
        headers: getAuthHeaders(),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (
            data: {
              data?: Array<{
                animeId: string;
                watchedAt: string;
                anime?: {
                  id: string;
                  slug: string;
                  title: string;
                  posterUrl: string;
                };
              }>;
            } | null
          ) => {
            if (data?.data?.length) {
              const local = readStorage();
              const localMap = new Map(local.map((i) => [i.id, i]));

              const fromBackend: RecentItem[] = data.data
                .slice(0, MAX_ITEMS)
                .map((entry) => {
                  const cached = localMap.get(entry.animeId);
                  return {
                    id: entry.animeId,
                    slug: entry.anime?.slug ?? entry.animeId,
                    title: entry.anime?.title ?? cached?.title ?? 'Unknown',
                    thumbnail:
                      entry.anime?.posterUrl ?? cached?.thumbnail ?? '',
                    sourceType: cached?.sourceType ?? 'youtube',
                    releaseYear: cached?.releaseYear ?? 0,
                    viewedAt: new Date(entry.watchedAt).getTime(),
                  };
                });

              setItems(fromBackend);
            } else {
              setItems(readStorage());
            }
          }
        )
        .catch(() => setItems(readStorage()));
    } else {
      setItems(readStorage());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Re-run only when the user's identity changes (login/logout)

  const trackView = React.useCallback(
    (item: Omit<RecentItem, 'viewedAt'>) => {
      setItems((prev) => {
        const filtered = prev.filter((i) => i.id !== item.id);
        const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
          0,
          MAX_ITEMS
        );
        writeStorage(next);
        return next;
      });
      // Sync to backend when logged in
      if (user) {
        fetch('/api/user/watch-history', {
          method: 'POST',
          credentials: 'include',
          headers: getAuthHeaders('application/json'),
          body: JSON.stringify({ animeId: item.id }),
        }).catch((err) => {
          // Non-fatal — view already tracked locally
          // eslint-disable-next-line no-console
          console.warn('[useRecentlyViewed] backend sync failed:', err);
        });
      }
    },
    [user]
  );

  return { items, trackView };
}
