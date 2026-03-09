'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import SectionHeader from '@/components/ui/SectionHeader';

import MediaCard from './MediaCard';

import type { AnimeSeries, Movie } from '@/types';

interface Props {
  title: string;
  items: Array<AnimeSeries | Movie>;
  seeAllHref?: string;
}

export default function MediaRail({ title, items, seeAllHref }: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const SCROLL_PERCENTAGE = 0.75;

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * SCROLL_PERCENTAGE;
    el.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className='space-y-3'>
      <SectionHeader title={title} href={seeAllHref} />
      <div className='relative'>
        <button
          onClick={() => scroll('left')}
          className='absolute left-0 top-1/2 z-10 hidden -translate-x-3 -translate-y-1/2 rounded-full bg-slate-800 p-1.5 text-white shadow-lg ring-1 ring-slate-700 transition-colors hover:bg-cyan-500 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:block'
          aria-label='Scroll left'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <div
          ref={scrollRef}
          className='scrollbar-hide flex gap-3 overflow-x-auto pb-1'
        >
          {items.map((item) => (
            <div key={item.id} className='w-40 flex-none sm:w-48'>
              <MediaCard item={item} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll('right')}
          className='absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-3 rounded-full bg-slate-800 p-1.5 text-white shadow-lg ring-1 ring-slate-700 transition-colors hover:bg-cyan-500 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:block'
          aria-label='Scroll right'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </section>
  );
}
