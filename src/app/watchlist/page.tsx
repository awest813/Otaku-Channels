'use client';

import { Bookmark, BookmarkX } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useWatchlist } from '@/hooks/useWatchlist';

import MediaCardSkeleton from '@/components/media/MediaCardSkeleton';
import Skeleton from '@/components/Skeleton';
import SourceBadge from '@/components/ui/SourceBadge';
import { useToast } from '@/components/ui/Toast';

import type { SourceType } from '@/types';

export default function WatchlistPage() {
  const { list, remove } = useWatchlist();
  const { show: showToast } = useToast();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-busy='true'
        aria-label='Loading My List'
        className='mx-auto max-w-screen-xl px-4 py-8'
      >
        <div className='mb-6 flex items-center gap-3'>
          <Skeleton className='h-6 w-6 rounded' />
          <Skeleton className='h-7 w-24 rounded-lg' />
        </div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <div className='mb-6 flex items-center gap-3'>
        <Bookmark className='h-6 w-6 text-cyan-400' />
        <div>
          <h1 className='text-2xl font-bold text-white md:text-3xl'>My List</h1>
          {list.length > 0 && (
            <p className='mt-0.5 text-sm text-slate-500'>
              {list.length} title{list.length !== 1 ? 's' : ''} saved
            </p>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
          <div className='rounded-full bg-slate-800/50 p-6'>
            <Bookmark className='h-10 w-10 text-slate-600' />
          </div>
          <div>
            <p className='text-lg font-semibold text-slate-300'>
              Your list is empty
            </p>
            <p className='mt-1 text-sm text-slate-500'>
              Bookmark anime to watch later — use the{' '}
              <Bookmark className='inline h-3.5 w-3.5' /> icon on any card.
            </p>
          </div>
          <Link
            href='/browse'
            className='mt-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
          >
            Browse Anime
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {list.map((item) => (
            <div key={item.id} className='group relative'>
              <Link
                href={`/series/${item.slug}`}
                className='flex flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all hover:ring-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <div className='relative aspect-video overflow-hidden bg-slate-800'>
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes='(max-width: 640px) 50vw, 20vw'
                    className='object-cover transition-transform duration-200 group-hover:scale-105'
                  />
                </div>
                <div className='p-3'>
                  <p className='line-clamp-2 text-sm font-semibold leading-snug text-white'>
                    {item.title}
                  </p>
                  <div className='mt-1.5 flex items-center gap-1.5'>
                    <SourceBadge sourceType={item.sourceType as SourceType} />
                    <span className='text-xs text-slate-500'>
                      {item.releaseYear}
                    </span>
                  </div>
                </div>
              </Link>
              {/* Remove button */}
              <button
                onClick={() => {
                  remove(item.id);
                  showToast(`Removed "${item.title}" from My List`, 'info');
                }}
                className='absolute right-2 top-2 rounded-md bg-slate-950/80 p-1.5 text-slate-300 opacity-0 backdrop-blur-sm transition-all hover:text-red-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 group-hover:opacity-100'
                aria-label={`Remove ${item.title} from My List`}
              >
                <BookmarkX className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
