import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getAnime } from '@/lib/backend';

import {
  getEpisodeById,
  getRelatedSeries,
  getSeriesBySlug,
  mockSeries,
} from '@/data/mockData';

import SourceBadge from '@/components/ui/SourceBadge';
import WatchPlayerShell from '@/components/watch/WatchPlayerShell';

import type { AnimeSeries } from '@/types';

interface Props {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Try backend for series; fall back to mock
  try {
    const result = await getAnime(id);
    const s = result.data as AnimeSeries;
    return { title: `Watch: ${s.title}` };
  } catch {
    const series = mockSeries.find((s) => s.id === id);
    if (series) return { title: `Watch: ${series.title}` };
    const episode = getEpisodeById(id);
    if (episode) return { title: `Watch: ${episode.title}` };
    return { title: 'Watch' };
  }
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;

  // Try backend first, fall back to mock data
  let series: AnimeSeries | null = null;
  try {
    const result = await getAnime(id);
    series = result.data as AnimeSeries;
  } catch {
    series = mockSeries.find((s) => s.id === id) ?? null;
  }

  const episode = series ? null : getEpisodeById(id);
  const episodeParent = episode ? getSeriesBySlug(episode.seriesSlug) : null;

  if (!series && !episode) {
    return (
      <div className='mx-auto max-w-screen-xl px-4 py-16 text-center'>
        <p className='text-slate-400'>Content not found.</p>
        <Link
          href='/'
          className='mt-4 inline-block rounded-lg bg-slate-800 px-4 py-2 text-sm text-cyan-400 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  const isEmbeddable = series?.isEmbeddable ?? episode?.isEmbeddable ?? false;
  const watchUrl = series?.watchUrl ?? episode?.watchUrl ?? '';
  const sourceName = series?.sourceName ?? episode?.sourceName ?? '';
  const sourceType =
    series?.sourceType ?? episodeParent?.sourceType ?? 'youtube';
  const title = series?.title ?? episode?.title ?? '';
  const description = series?.description ?? episode?.description ?? '';
  const backHref = series
    ? `/series/${series.slug}`
    : episodeParent
    ? `/series/${episodeParent.slug}`
    : '/';
  const backLabel = series
    ? series.title
    : episodeParent
    ? episodeParent.title
    : 'Home';

  const relatedSeries = series
    ? getRelatedSeries(series, 5)
    : episodeParent
    ? getRelatedSeries(episodeParent, 5)
    : mockSeries.slice(0, 5);

  // Episode context
  const episodeNumber = episode?.title.match(/Episode\s+(\d+)/i)?.[1];

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-6'>
      {/* Back navigation */}
      <Link
        href={backHref}
        className='mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
      >
        <ArrowLeft className='h-4 w-4' />
        <span>Back to {backLabel}</span>
      </Link>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Player + Info */}
        <div className='space-y-5 lg:col-span-2'>
          <WatchPlayerShell
            isEmbeddable={isEmbeddable}
            watchUrl={watchUrl}
            sourceName={sourceName}
          />

          {/* Title + context */}
          <div className='space-y-3'>
            <div>
              {episode && episodeParent && (
                <p className='mb-1 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  {episodeParent.title}
                  {episodeNumber && ` · Episode ${episodeNumber}`}
                </p>
              )}
              <h1 className='text-xl font-bold text-white md:text-2xl'>
                {title}
              </h1>
              <div className='mt-2 flex flex-wrap items-center gap-3'>
                <SourceBadge sourceType={sourceType} />
                {series && (
                  <span className='text-sm text-slate-500'>
                    {series.releaseYear}
                  </span>
                )}
              </div>
            </div>

            <p className='text-sm leading-relaxed text-slate-400'>
              {description}
            </p>

            {/* Source trust panel */}
            <div className='flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4'>
              <Shield className='mt-0.5 h-4 w-4 shrink-0 text-green-400' />
              <div>
                <p className='text-xs font-semibold text-slate-300'>
                  Content source: {sourceName}
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  {isEmbeddable
                    ? `Embedded via ${sourceName}. Anime TV does not host any video.`
                    : `This title plays on ${sourceName}. Clicking the button opens the official watch page.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className='space-y-4'>
          <h2 className='text-base font-semibold text-white'>Related Series</h2>
          <div className='space-y-2'>
            {relatedSeries.map((s) => (
              <Link
                key={s.id}
                href={`/series/${s.slug}`}
                className='group flex items-center gap-3 rounded-xl bg-slate-900 p-2.5 ring-1 ring-slate-800 transition-all hover:ring-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <div className='relative h-14 w-24 shrink-0 overflow-hidden rounded-lg'>
                  <Image
                    src={s.thumbnail}
                    alt={s.title}
                    fill
                    sizes='96px'
                    className='object-cover transition-transform duration-200 group-hover:scale-105'
                    unoptimized
                  />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='line-clamp-2 text-sm font-medium leading-snug text-white transition-colors group-hover:text-cyan-300'>
                    {s.title}
                  </p>
                  <p className='mt-1 text-xs text-slate-500'>{s.releaseYear}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
