import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import SourceBadge from '@/components/ui/SourceBadge';

import type { AnimeSeries, Movie } from '@/types';

type Props = {
  item: AnimeSeries | Movie;
};

export default function MediaCard({ item }: Props) {
  const href = `/series/${item.slug}`;

  return (
    <Link
      href={href}
      className='group relative flex flex-col overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
    >
      <div className='relative aspect-video overflow-hidden bg-slate-800'>
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
          {item.isEmbeddable ? (
            <Play className='h-10 w-10 text-white drop-shadow-lg' />
          ) : (
            <ExternalLink className='h-8 w-8 text-white drop-shadow-lg' />
          )}
        </div>
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <p className='line-clamp-2 text-sm font-semibold text-white'>
          {item.title}
        </p>
        <div className='flex flex-wrap items-center gap-1.5'>
          <SourceBadge sourceType={item.sourceType} />
          {'episodeCount' in item && (
            <span className='text-xs text-slate-500'>
              {item.episodeCount} eps
            </span>
          )}
          <span className='text-xs text-slate-500'>{item.releaseYear}</span>
        </div>
        <div className='mt-auto flex flex-wrap gap-1 pt-1'>
          {item.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className='rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400'
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
