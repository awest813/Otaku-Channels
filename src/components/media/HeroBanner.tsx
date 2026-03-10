import { ExternalLink, Film, Info, Play, Tv2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import GenrePill from '@/components/ui/GenrePill';
import SourceBadge from '@/components/ui/SourceBadge';

import type { AnimeSeries } from '@/types';

export default function HeroBanner({ series }: { series: AnimeSeries }) {
  const episodeCount =
    'episodeCount' in series ? (series.episodeCount as number) : null;

  return (
    <div className='relative h-[480px] overflow-hidden md:h-[580px] lg:h-[640px]'>
      <Image
        src={series.heroImage}
        alt={series.title}
        fill
        sizes='100vw'
        className='object-cover object-center'
        priority
      />
      {/* Cinematic gradient overlays */}
      <div className='absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent' />
      <div className='absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-transparent' />

      <div className='absolute inset-0 flex items-end pb-12 md:items-center md:pb-0'>
        <div className='mx-auto w-full max-w-screen-xl px-4'>
          <div className='max-w-xl space-y-4'>
            {/* Meta row */}
            <div className='flex flex-wrap items-center gap-2'>
              <SourceBadge sourceType={series.sourceType} />
              <span className='text-xs font-medium text-slate-400'>
                {series.releaseYear}
              </span>
              {episodeCount ? (
                <span className='flex items-center gap-1 text-xs text-slate-400'>
                  <Tv2 className='h-3 w-3' />
                  {episodeCount} eps
                </span>
              ) : (
                <span className='flex items-center gap-1 text-xs text-slate-400'>
                  <Film className='h-3 w-3' />
                  Movie
                </span>
              )}
              <span className='rounded bg-slate-800/80 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-400'>
                {series.language}
              </span>
            </div>

            {/* Title */}
            <h1 className='text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl'>
              {series.title}
            </h1>

            {/* Description */}
            <p className='line-clamp-2 text-sm leading-relaxed text-slate-300 md:line-clamp-3 md:text-base'>
              {series.description}
            </p>

            {/* Genre pills */}
            <div className='flex flex-wrap gap-2'>
              {series.genres.slice(0, 4).map((g) => (
                <GenrePill
                  key={g}
                  genre={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                />
              ))}
            </div>

            {/* CTAs */}
            <div className='flex flex-wrap gap-3 pt-1'>
              <Link
                href={
                  series.isEmbeddable
                    ? `/series/${series.slug}`
                    : series.watchUrl
                }
                {...(!series.isEmbeddable
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
              >
                {series.isEmbeddable ? (
                  <>
                    <Play className='h-4 w-4 fill-slate-950' /> Watch Now
                  </>
                ) : (
                  <>
                    <ExternalLink className='h-4 w-4' /> Watch on{' '}
                    {series.sourceName}
                  </>
                )}
              </Link>
              <Link
                href={`/series/${series.slug}`}
                className='flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
              >
                <Info className='h-4 w-4' /> More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent' />
    </div>
  );
}
