import * as React from 'react';

import Skeleton from '@/components/Skeleton';

export default function HeroBannerSkeleton() {
  return (
    <div
      aria-busy='true'
      aria-label='Loading hero banner'
      className='relative h-[480px] overflow-hidden md:h-[580px] lg:h-[640px]'
    >
      {/* Background image placeholder */}
      <Skeleton className='h-full w-full rounded-none' />

      {/* Gradient overlays (match HeroBanner) */}
      <div className='absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent' />

      {/* Content overlay */}
      <div className='absolute inset-0 flex items-end pb-12 md:items-center md:pb-0'>
        <div className='mx-auto w-full max-w-screen-xl px-4'>
          <div className='max-w-xl space-y-4'>
            {/* Meta row */}
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-16 rounded' />
              <Skeleton className='h-4 w-8 rounded' />
              <Skeleton className='h-4 w-10 rounded' />
            </div>

            {/* Title */}
            <Skeleton className='h-10 w-3/4 rounded md:h-14' />

            {/* Description lines */}
            <Skeleton className='h-4 w-full rounded' />
            <Skeleton className='h-4 w-5/6 rounded' />
            <Skeleton className='hidden h-4 w-4/5 rounded md:block' />

            {/* Genre pills */}
            <div className='flex gap-2'>
              <Skeleton className='h-6 w-16 rounded-full' />
              <Skeleton className='h-6 w-16 rounded-full' />
              <Skeleton className='h-6 w-14 rounded-full' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </div>

            {/* CTA buttons */}
            <div className='flex gap-3 pt-1'>
              <Skeleton className='h-10 w-32 rounded-lg' />
              <Skeleton className='h-10 w-28 rounded-lg' />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent' />
    </div>
  );
}
