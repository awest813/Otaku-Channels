import { Calendar, ExternalLink, Languages, Play, Tv2 } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  getEpisodesBySeries,
  getRelatedSeries,
  getSeriesBySlug,
} from '@/data/mockData';

import EpisodeList from '@/components/media/EpisodeList';
import MediaRail from '@/components/media/MediaRail';
import GenrePill from '@/components/ui/GenrePill';
import SourceBadge from '@/components/ui/SourceBadge';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: 'Not Found' };
  return { title: series.title, description: series.description };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const episodes = getEpisodesBySeries(slug);
  const related = getRelatedSeries(series);

  return (
    <div>
      {/* Hero */}
      <div className='relative h-[360px] overflow-hidden md:h-[460px]'>
        <Image
          src={series.heroImage}
          alt={series.title}
          fill
          sizes='100vw'
          className='object-cover'
          priority
          unoptimized
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent' />
      </div>

      <div className='mx-auto max-w-screen-xl px-4 py-8'>
        {/* Main info */}
        <div className='flex flex-col gap-6 md:flex-row md:items-start'>
          <div className='flex-1 space-y-4'>
            <div className='flex items-center gap-2'>
              <SourceBadge sourceType={series.sourceType} />
            </div>
            <h1 className='text-3xl font-bold text-white md:text-4xl'>
              {series.title}
            </h1>

            <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400'>
              <span className='flex items-center gap-1.5'>
                <Calendar className='h-4 w-4' />
                {series.releaseYear}
              </span>
              {'episodeCount' in series && (
                <span className='flex items-center gap-1.5'>
                  <Tv2 className='h-4 w-4' />
                  {series.episodeCount} Episodes
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <Languages className='h-4 w-4' />
                {series.language.toUpperCase()}
              </span>
            </div>

            <div className='flex flex-wrap gap-2'>
              {series.genres.map((g) => (
                <GenrePill key={g} genre={g} />
              ))}
            </div>

            <p className='max-w-2xl text-slate-300'>{series.description}</p>

            <div className='flex flex-wrap gap-3 pt-2'>
              {series.isEmbeddable ? (
                <Link
                  href={`/watch/youtube/${series.id}`}
                  className='flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <Play className='h-4 w-4' /> Watch Now
                </Link>
              ) : (
                <a
                  href={series.watchUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <ExternalLink className='h-4 w-4' /> Watch on{' '}
                  {series.sourceName}
                </a>
              )}
            </div>

            <p className='pt-1 text-xs text-slate-600'>
              Content provided by {series.sourceName}. Anime TV links to
              official sources only and does not host any video content.
            </p>
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <div className='mt-10 space-y-4'>
            <h2 className='text-xl font-bold text-white'>Episodes</h2>
            <EpisodeList episodes={episodes} />
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className='mt-10'>
            <MediaRail title='More Like This' items={related} />
          </div>
        )}
      </div>
    </div>
  );
}
