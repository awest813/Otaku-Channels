import * as React from 'react';

import { cn } from '@/lib/utils';

import Skeleton from '@/components/Skeleton';

type Props = {
  className?: string;
};

export default function MediaCardSkeleton({ className }: Props) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'flex flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800',
        className
      )}
    >
      {/* Thumbnail */}
      <Skeleton className='aspect-video w-full rounded-none' />

      {/* Info */}
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        {/* Title lines */}
        <Skeleton className='h-3.5 w-full rounded' />
        <Skeleton className='h-3.5 w-3/4 rounded' />

        {/* Meta row */}
        <div className='flex items-center gap-1.5'>
          <Skeleton className='h-4 w-14 rounded' />
          <Skeleton className='h-3 w-8 rounded' />
        </div>

        {/* Genre tags */}
        <div className='mt-auto flex gap-1 pt-1'>
          <Skeleton className='h-4 w-12 rounded' />
          <Skeleton className='h-4 w-14 rounded' />
        </div>
      </div>
    </div>
  );
}
