import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import {
  getEpisodeById,
  getRelatedSeries,
  getSeriesBySlug,
  mockSeries,
} from '@/data/mockData';

import WatchPlayerShell from '@/components/watch/WatchPlayerShell';

interface Props {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const series = mockSeries.find((s) => s.id === id);
  if (series) return { title: `Watch: ${series.title}` };
  const episode = getEpisodeById(id);
  if (episode) return { title: `Watch: ${episode.title}` };
  return { title: 'Watch' };
}

export default async function WatchPage({ params }: Props) {
  const { id } = await params;

  // Try series first, then fall back to an individual episode
  const series = mockSeries.find((s) => s.id === id);
  const episode = series ? null : getEpisodeById(id);
  const episodeParent = episode ? getSeriesBySlug(episode.seriesSlug) : null;

  if (!series && !episode) {
    return (
      <div className='mx-auto max-w-screen-xl px-4 py-16 text-center text-slate-400'>
        <p>Content not found.</p>
        <Link
          href='/'
          className='mt-4 inline-block text-cyan-400 hover:underline'
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Unified playback fields (at this point at least one of series/episode exists)
  const isEmbeddable = series?.isEmbeddable ?? episode?.isEmbeddable ?? false;
  const watchUrl = series?.watchUrl ?? episode?.watchUrl ?? '';
  const sourceName = series?.sourceName ?? episode?.sourceName ?? '';
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

  // Related series for the sidebar.
  // Falls back to general picks when an episode's parent series isn't found.
  const relatedSeries = series
    ? getRelatedSeries(series, 5)
    : episodeParent
    ? getRelatedSeries(episodeParent, 5)
    : mockSeries.slice(0, 5);

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-6'>
      <Link
        href={backHref}
        className='mb-4 flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-cyan-400'
      >
        <ArrowLeft className='h-4 w-4' /> Back to {backLabel}
      </Link>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-2'>
          <WatchPlayerShell
            isEmbeddable={isEmbeddable}
            watchUrl={watchUrl}
            sourceName={sourceName}
          />
          <div>
            <h1 className='text-xl font-bold text-white'>{title}</h1>
            <p className='mt-1 text-sm text-slate-400'>
              {series ? `${series.releaseYear} · ` : ''}
              {sourceName}
            </p>
            <p className='mt-3 text-sm text-slate-300'>{description}</p>
          </div>
        </div>
        <div className='space-y-3'>
          <h2 className='text-base font-semibold text-white'>Related Series</h2>
          {relatedSeries.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className='flex items-center gap-3 rounded-lg bg-slate-900 p-2.5 ring-1 ring-slate-800 transition-all hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
            >
              <div className='relative h-12 w-20 shrink-0 overflow-hidden rounded'>
                <Image
                  src={s.thumbnail}
                  alt={s.title}
                  fill
                  sizes='80px'
                  className='object-cover'
                  unoptimized
                />
              </div>
              <div className='min-w-0'>
                <p className='line-clamp-1 text-sm font-medium text-white'>
                  {s.title}
                </p>
                <p className='text-xs text-slate-500'>{s.releaseYear}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
