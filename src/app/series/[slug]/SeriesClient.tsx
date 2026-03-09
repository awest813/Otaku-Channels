'use client';

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ExternalLink,
  Languages,
  Play,
  Shield,
  Tv2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useWatchlist } from '@/hooks/useWatchlist';

import EpisodeList from '@/components/media/EpisodeList';
import MediaRail from '@/components/media/MediaRail';
import GenrePill from '@/components/ui/GenrePill';
import SourceBadge from '@/components/ui/SourceBadge';
import { useToast } from '@/components/ui/Toast';

import type { AnimeSeries, Episode, Movie } from '@/types';

interface Props {
  series: AnimeSeries;
  episodes: Episode[];
  related: AnimeSeries[];
}

export default function SeriesClient({ series, episodes, related }: Props) {
  const { isInList, toggle } = useWatchlist();
  const { show: showToast } = useToast();
  const { trackView } = useRecentlyViewed();
  const inList = isInList(series.id);

  // Track view on mount
  React.useEffect(() => {
    trackView({
      id: series.id,
      slug: series.slug,
      title: series.title,
      thumbnail: series.thumbnail,
      sourceType: series.sourceType,
      releaseYear: series.releaseYear,
    });
  }, [series, trackView]);

  const handleWatchlist = () => {
    const added = toggle({
      id: series.id,
      slug: series.slug,
      title: series.title,
      thumbnail: series.thumbnail,
      sourceType: series.sourceType,
      releaseYear: series.releaseYear,
    });
    showToast(
      added
        ? `Added "${series.title}" to My List`
        : `Removed from My List`,
      added ? 'success' : 'info'
    );
  };

  const episodeCount =
    'episodeCount' in series ? (series.episodeCount as number) : null;

  return (
    <div>
      {/* Hero */}
      <div className='relative h-[320px] overflow-hidden md:h-[420px]'>
        <Image
          src={series.heroImage}
          alt={series.title}
          fill
          sizes='100vw'
          className='object-cover object-top'
          priority
          unoptimized
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent' />
      </div>

      <div className='mx-auto max-w-screen-xl px-4 py-6'>
        {/* Back navigation */}
        <Link
          href='/browse'
          className='mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Browse
        </Link>

        {/* Main layout */}
        <div className='flex flex-col gap-8 md:flex-row md:items-start md:gap-10'>
          {/* Poster */}
          <div className='hidden md:block md:w-48 lg:w-56 shrink-0'>
            <div className='relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-slate-800 shadow-2xl'>
              <Image
                src={series.thumbnail}
                alt={series.title}
                fill
                sizes='224px'
                className='object-cover'
                unoptimized
              />
            </div>
          </div>

          {/* Info */}
          <div className='flex-1 space-y-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <SourceBadge sourceType={series.sourceType} />
              <span className='rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium uppercase text-slate-400'>
                {series.language}
              </span>
            </div>

            <h1 className='text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl'>
              {series.title}
            </h1>

            <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400'>
              <span className='flex items-center gap-1.5'>
                <Calendar className='h-4 w-4' />
                {series.releaseYear}
              </span>
              {episodeCount != null && (
                <span className='flex items-center gap-1.5'>
                  <Tv2 className='h-4 w-4' />
                  {episodeCount} Episodes
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <Languages className='h-4 w-4' />
                {series.language === 'sub'
                  ? 'Subtitled'
                  : series.language === 'dub'
                  ? 'Dubbed'
                  : 'Sub & Dub'}
              </span>
            </div>

            <div className='flex flex-wrap gap-2'>
              {series.genres.map((g) => (
                <GenrePill
                  key={g}
                  genre={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                />
              ))}
            </div>

            <p className='max-w-2xl leading-relaxed text-slate-300'>
              {series.description}
            </p>

            {/* CTAs */}
            <div className='flex flex-wrap gap-3'>
              {series.isEmbeddable ? (
                <Link
                  href={`/watch/youtube/${series.id}`}
                  className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <Play className='h-4 w-4 fill-slate-950' /> Watch Now
                </Link>
              ) : (
                <a
                  href={series.watchUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <ExternalLink className='h-4 w-4' /> Watch on {series.sourceName}
                </a>
              )}
              <button
                onClick={handleWatchlist}
                className={`flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                  inList
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {inList ? (
                  <>
                    <BookmarkCheck className='h-4 w-4' /> In My List
                  </>
                ) : (
                  <>
                    <Bookmark className='h-4 w-4' /> Add to My List
                  </>
                )}
              </button>
            </div>

            {/* Source trust panel */}
            <div className='flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4'>
              <Shield className='mt-0.5 h-4 w-4 shrink-0 text-green-400' />
              <div>
                <p className='text-xs font-semibold text-slate-300'>
                  Official source: {series.sourceName}
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Anime TV links to officially licensed content only. No video
                  is hosted or proxied by this site.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <div className='mt-12 space-y-4'>
            <h2 className='text-xl font-bold text-white'>
              Episodes{' '}
              <span className='text-base font-normal text-slate-500'>
                ({episodes.length})
              </span>
            </h2>
            <EpisodeList episodes={episodes} />
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className='mt-12'>
            <MediaRail
              title='More Like This'
              items={related as Array<AnimeSeries | Movie>}
              description={`Because you viewed ${series.title}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
