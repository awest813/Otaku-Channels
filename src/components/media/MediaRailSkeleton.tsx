import * as React from 'react';

import Skeleton from '@/components/Skeleton';

import MediaCardSkeleton from './MediaCardSkeleton';

interface Props {
  /** Number of placeholder cards to display. Defaults to 5. */
  count?: number;
}

export default function MediaRailSkeleton({ count = 5 }: Props) {
  return (
    <section
      aria-busy='true'
      aria-label='Loading content'
      className='space-y-3'
    >
      {/* Section header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1.5'>
          <Skeleton className='h-5 w-40 rounded' />
          <Skeleton className='h-3.5 w-56 rounded' />
        </div>
        <Skeleton className='h-4 w-14 rounded' />
      </div>

      {/* Card row */}
      <div className='flex gap-3 overflow-hidden'>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className='w-40 flex-none sm:w-48 lg:w-52'>
            <MediaCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
