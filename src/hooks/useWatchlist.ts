'use client';

import * as React from 'react';

const STORAGE_KEY = 'anime-tv-watchlist';

export interface WatchlistItem {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  sourceType: string;
  releaseYear: number;
}

function readStorage(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
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

export function useWatchlist() {
  const [list, setList] = React.useState<WatchlistItem[]>([]);

  // Hydrate from localStorage after mount
  React.useEffect(() => {
    setList(readStorage());
  }, []);

  const isInList = React.useCallback(
    (id: string) => list.some((i) => i.id === id),
    [list]
  );

  const add = React.useCallback((item: WatchlistItem) => {
    setList((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      const next = [item, ...prev];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setList((prev) => {
      const next = prev.filter((i) => i.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

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

  return { list, isInList, add, remove, toggle };
}
