'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useRailKeyboard } from '@/hooks/useRailKeyboard';

import SectionHeader from '@/components/ui/SectionHeader';

import MediaCard from './MediaCard';

import type { AnimeSeries, Movie } from '@/types';

interface Props {
  title: string;
  description?: string;
  items: Array<AnimeSeries | Movie>;
  seeAllHref?: string;
}

export default function MediaRail({
  title,
  description,
  items,
  seeAllHref,
}: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const SCROLL_PERCENTAGE = 0.75;

  const { railProps, getItemProps } = useRailKeyboard(items.length);

  const checkScrollability = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    const ro = new ResizeObserver(checkScrollability);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      ro.disconnect();
    };
  }, [checkScrollability]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * SCROLL_PERCENTAGE;
    el.scrollBy({
      left: dir === 'right' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  if (!items.length) return null;

  return (
    <section className='space-y-3'>
      <SectionHeader
        title={title}
        href={seeAllHref}
        description={description}
      />
      <div className='relative'>
        {/* Left fade + scroll button */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-slate-950 to-transparent transition-opacity duration-200',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className='absolute left-0 top-1/2 z-20 hidden -translate-x-4 -translate-y-1/2 rounded-full bg-slate-800 p-2 text-white shadow-xl ring-1 ring-slate-700 transition-all hover:bg-slate-700 hover:ring-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-0 md:block'
          aria-label='Scroll left'
        >
          <ChevronLeft className='h-4 w-4' />
        </button>

        {/* Cards */}
        <div
          ref={(el: HTMLDivElement | null) => {
            (
              scrollRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
            (
              railProps.ref as React.MutableRefObject<HTMLDivElement | null>
            ).current = el;
          }}
          className='scrollbar-hide flex gap-3 overflow-x-auto pb-1'
          onKeyDown={railProps.onKeyDown}
          onBlur={railProps.onBlur}
          onFocus={railProps.onFocus}
          role={railProps.role}
          aria-label={title}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className='w-40 flex-none sm:w-48 lg:w-52'
              {...getItemProps(i)}
            >
              <MediaCard item={item} />
            </div>
          ))}
        </div>

        {/* Right fade + scroll button */}
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-slate-950 to-transparent transition-opacity duration-200',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className='absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 translate-x-4 rounded-full bg-slate-800 p-2 text-white shadow-xl ring-1 ring-slate-700 transition-all hover:bg-slate-700 hover:ring-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-0 md:block'
          aria-label='Scroll right'
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </section>
  );
}
