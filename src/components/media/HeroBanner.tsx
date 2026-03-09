import { ExternalLink, Info, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import GenrePill from '@/components/ui/GenrePill';
import SourceBadge from '@/components/ui/SourceBadge';

import type { AnimeSeries } from '@/types';

export default function HeroBanner({ series }: { series: AnimeSeries }) {
  return (
    <div className='relative h-[420px] overflow-hidden md:h-[520px]'>
      <Image
        src={series.heroImage}
        alt={series.title}
        fill
        sizes='100vw'
        className='object-cover'
        priority
        unoptimized
      />
      <div className='absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent' />
      <div className='absolute inset-0 flex items-end pb-10 md:items-center md:pb-0'>
        <div className='mx-auto w-full max-w-screen-xl px-4'>
          <div className='max-w-lg space-y-4'>
            <div className='flex items-center gap-2'>
              <SourceBadge sourceType={series.sourceType} />
              <span className='text-xs text-slate-400'>
                {series.releaseYear}
              </span>
            </div>
            <h1 className='text-3xl font-bold leading-tight text-white md:text-5xl'>
              {series.title}
            </h1>
            <p className='line-clamp-3 text-sm text-slate-300 md:text-base'>
              {series.description}
            </p>
            <div className='flex flex-wrap gap-2'>
              {series.genres.map((g) => (
                <GenrePill key={g} genre={g} />
              ))}
            </div>
            <div className='flex flex-wrap gap-3 pt-2'>
              <Link
                href={`/series/${series.slug}`}
                className='flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                {series.isEmbeddable ? (
                  <>
                    <Play className='h-4 w-4' /> Watch Now
                  </>
                ) : (
                  <>
                    <ExternalLink className='h-4 w-4' /> Watch on Source
                  </>
                )}
              </Link>
              <Link
                href={`/series/${series.slug}`}
                className='flex items-center gap-2 rounded-md bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <Info className='h-4 w-4' /> More Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
