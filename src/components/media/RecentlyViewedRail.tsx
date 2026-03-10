'use client';

import { Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import SourceBadge from '@/components/ui/SourceBadge';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import type { SourceType } from '@/types';

export default function RecentlyViewedRail() {
  const { items } = useRecentlyViewed();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until client-side to avoid hydration mismatch
  if (!mounted || items.length === 0) return null;

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Clock className='h-4 w-4 text-slate-500' />
        <h2 className='text-lg font-semibold text-white md:text-xl'>
          Continue Watching
        </h2>
      </div>
      <div className='flex gap-3 overflow-x-auto pb-1 scrollbar-hide'>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/series/${item.slug}`}
            className='group relative w-40 flex-none overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all hover:ring-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-48'
          >
            <div className='relative aspect-video overflow-hidden bg-slate-800'>
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                sizes='192px'
                className='object-cover transition-transform duration-200 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
            </div>
            <div className='p-3'>
              <p className='line-clamp-2 text-xs font-semibold leading-snug text-white'>
                {item.title}
              </p>
              <div className='mt-1.5 flex items-center gap-1.5'>
                <SourceBadge sourceType={item.sourceType as SourceType} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
