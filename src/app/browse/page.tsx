import { Suspense } from 'react';

import { listAnime } from '@/lib/backend';

import { allContent as mockAllContent } from '@/data/mockData';

import MediaCardSkeleton from '@/components/media/MediaCardSkeleton';
import Skeleton from '@/components/Skeleton';

import BrowseContent from './BrowseContent';

import type { AnimeSeries, Movie } from '@/types';

async function getBrowseData(): Promise<{
  items: (AnimeSeries | Movie)[];
}> {
  try {
    const [seriesResult, moviesResult] = await Promise.all([
      listAnime({ limit: 200 }),
      listAnime({ type: 'MOVIE', limit: 100 }),
    ]);
    const combined = [...seriesResult.data, ...moviesResult.data] as (
      | AnimeSeries
      | Movie
    )[];
    if (combined.length > 0) return { items: combined };
  } catch {
    // Backend unavailable — fall through to mock data
  }
  return { items: mockAllContent as (AnimeSeries | Movie)[] };
}

function BrowsePageSkeleton() {
  return (
    <div
      aria-busy='true'
      aria-label='Loading browse page'
      className='mx-auto max-w-screen-xl px-4 py-8'
    >
      {/* Page header */}
      <div className='mb-6'>
        <Skeleton className='h-8 w-28 rounded-lg' />
        <Skeleton className='mt-1.5 h-4 w-64 rounded' />
      </div>

      {/* Filter panel */}
      <div className='mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4'>
        {[...Array(4)].map((_, row) => (
          <div key={row}>
            <Skeleton className='mb-2 h-3 w-16 rounded' />
            <div className='flex flex-wrap gap-2'>
              {Array.from({ length: 5 + row }).map((_, i) => (
                <Skeleton key={i} className='h-6 w-16 rounded-full' />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results count */}
      <Skeleton className='mb-4 h-4 w-24 rounded' />

      {/* Card grid */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
        {Array.from({ length: 18 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default async function BrowsePage() {
  const { items } = await getBrowseData();

  const allGenres = Array.from(new Set(items.flatMap((i) => i.genres))).sort();

  const sourceNames = Array.from(
    new Set(items.map((i) => i.sourceName))
  ).sort();

  return (
    <Suspense fallback={<BrowsePageSkeleton />}>
      <BrowseContent
        initialItems={items}
        allGenres={allGenres}
        sourceNames={sourceNames}
      />
    </Suspense>
  );
}
