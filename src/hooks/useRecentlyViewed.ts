'use client';

import * as React from 'react';

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

function readStorage(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentItem[]) : [];
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

export function useRecentlyViewed() {
  const [items, setItems] = React.useState<RecentItem[]>([]);

  React.useEffect(() => {
    setItems(readStorage());
  }, []);

  const trackView = React.useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(
        0,
        MAX_ITEMS
      );
      writeStorage(next);
      return next;
    });
  }, []);

  return { items, trackView };
}
