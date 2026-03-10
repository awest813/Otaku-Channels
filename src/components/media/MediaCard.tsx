'use client';

import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Film,
  Play,
  Tv2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { useWatchlist } from '@/hooks/useWatchlist';

import SourceBadge from '@/components/ui/SourceBadge';
import { useToast } from '@/components/ui/Toast';

import type { Anime } from '@/types';

type Props = {
  item: Anime;
};

export default function MediaCard({ item }: Props) {
  const href = `/series/${item.slug}`;
  const isMovie = item.type === 'movie';
  const episodeCount =
    !isMovie && 'episodeCount' in item ? (item as { episodeCount: number }).episodeCount : null;

  const { isInList, toggle } = useWatchlist();
  const { show: showToast } = useToast();
  const inList = isInList(item.id);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle({
      id: item.id,
      slug: item.slug,
      title: item.title,
      thumbnail: item.thumbnail,
      sourceType: item.sourceType,
      releaseYear: item.releaseYear,
    });
    showToast(
      added ? `Added "${item.title}" to My List` : `Removed from My List`,
      added ? 'success' : 'info'
    );
  };

  return (
    <Link
      href={href}
      className='group relative flex flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/10 hover:ring-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
    >
      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-slate-800'>
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />

        {/* Hover overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100' />

        {/* Play / External icon */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <div className='rounded-full bg-white/10 p-3 backdrop-blur-sm'>
            {item.isEmbeddable ? (
              <Play className='h-6 w-6 fill-white text-white' />
            ) : (
              <ExternalLink className='h-5 w-5 text-white' />
            )}
          </div>
        </div>

        {/* Type badge */}
        <div className='absolute left-2 top-2'>
          {isMovie ? (
            <span className='flex items-center gap-1 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm'>
              <Film className='h-3 w-3' /> Movie
            </span>
          ) : null}
        </div>

        {/* Watchlist button */}
        <button
          onClick={handleWatchlistToggle}
          className='absolute right-2 top-2 rounded-md bg-slate-950/70 p-1.5 text-slate-300 opacity-0 backdrop-blur-sm transition-all hover:text-cyan-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group-hover:opacity-100'
          aria-label={
            inList
              ? `Remove ${item.title} from My List`
              : `Add ${item.title} to My List`
          }
        >
          {inList ? (
            <BookmarkCheck className='h-4 w-4 text-cyan-400' />
          ) : (
            <Bookmark className='h-4 w-4' />
          )}
        </button>

        {/* External source indicator */}
        {!item.isEmbeddable && (
          <div className='absolute bottom-2 right-2 rounded-md bg-slate-950/80 px-1.5 py-0.5 text-xs text-slate-400 opacity-0 transition-opacity group-hover:opacity-100'>
            Opens externally
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <p className='line-clamp-2 text-sm font-semibold leading-snug text-white'>
          {item.title}
        </p>

        {/* Meta row */}
        <div className='flex flex-wrap items-center gap-1.5'>
          <SourceBadge sourceType={item.sourceType} />
          {episodeCount ? (
            <span className='flex items-center gap-0.5 text-xs text-slate-500'>
              <Tv2 className='h-3 w-3' />
              {episodeCount} eps
            </span>
          ) : null}
          <span className='text-xs text-slate-500'>{item.releaseYear}</span>
        </div>

        {/* Genre tags */}
        <div className='mt-auto flex flex-wrap gap-1 pt-1'>
          {item.genres.slice(0, 2).map((g) => (
            <span
              key={g}
              className='rounded-md bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400'
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* In-list indicator strip */}
      {inList && (
        <div className='absolute left-0 top-0 h-full w-0.5 bg-cyan-400' />
      )}
    </Link>
  );
}
