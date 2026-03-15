'use client';

/**
 * ChannelCard — enhanced TV-guide style card for pseudo-live themed channels.
 *
 * Displays a progress bar showing how far into the current slot we are,
 * plus the "now playing" and "up next" labels.  Designed for the /channels
 * TV-guide page and the home-page rail.
 */
import { Play, Radio, Tv } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { ChannelWithSchedule, NowPlayingResult } from '@/types';

interface Props {
  channel: ChannelWithSchedule;
  nowPlaying?: NowPlayingResult;
}

export default function ChannelCard({ channel, nowPlaying }: Props) {
  const progress = nowPlaying?.current.progressPercent ?? 0;
  const currentLabel = nowPlaying?.current.label ?? channel.nowPlaying;
  const nextLabel = nowPlaying?.next?.label ?? channel.nextUp;
  const remaining = nowPlaying?.current.remainingSec;

  const remainingText =
    remaining != null
      ? remaining >= 3600
        ? `${Math.floor(remaining / 3600)}h ${String(
            Math.floor((remaining % 3600) / 60)
          ).padStart(2, '0')}m left`
        : `${Math.floor(remaining / 60)}m left`
      : null;

  return (
    <Link
      href={channel.watchUrl}
      className='group relative flex flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/10 hover:ring-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
    >
      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden bg-slate-800'>
        {channel.thumbnail ? (
          <Image
            src={channel.thumbnail}
            alt={channel.name}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            className='object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Tv className='h-10 w-10 text-slate-600' />
          </div>
        )}

        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent' />

        {/* LIVE badge */}
        <div className='absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white' />
          LIVE
        </div>

        {/* Channel number */}
        <div className='absolute right-2 top-2 rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 backdrop-blur-sm'>
          CH {channel.channelNumber}
        </div>

        {/* Genre tag (bottom-left of image) */}
        {channel.genre && (
          <div className='absolute bottom-2 left-2 rounded-full bg-slate-950/70 px-2 py-0.5 text-xs font-medium text-slate-300 backdrop-blur-sm'>
            {channel.genre}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className='h-0.5 w-full bg-slate-800'>
        <div
          className='h-full bg-cyan-500 transition-all duration-1000'
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Info */}
      <div className='flex flex-1 flex-col gap-1.5 px-3 py-3'>
        <div className='flex items-center gap-2'>
          <Radio className='h-3.5 w-3.5 shrink-0 text-red-400' />
          <p className='truncate text-sm font-semibold text-white'>
            {channel.name}
          </p>
        </div>

        {channel.tagline && (
          <p className='line-clamp-1 text-[11px] italic text-slate-500'>
            {channel.tagline}
          </p>
        )}

        <p className='line-clamp-1 text-xs text-slate-400'>
          <Play className='mr-1 inline h-3 w-3 fill-green-400 text-green-400' />
          {currentLabel || 'Loading…'}
        </p>

        {nextLabel && (
          <p className='line-clamp-1 text-xs text-slate-600'>
            Next: {nextLabel}
          </p>
        )}

        {remainingText && (
          <p className='mt-auto pt-0.5 text-[11px] text-slate-600'>
            {remainingText}
          </p>
        )}
      </div>
    </Link>
  );
}
