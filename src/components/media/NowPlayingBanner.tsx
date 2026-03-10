'use client';

/**
 * NowPlayingBanner — hero-style "now airing" section for a channel detail page.
 *
 * Displays the currently-airing slot with a progress bar, remaining-time
 * countdown, and the "up next" slot below.
 */
import { Clock, Play, SkipForward } from 'lucide-react';

import { formatRemaining } from '@/lib/channelSchedule';

import type { NowPlayingResult } from '@/types';

interface Props {
  nowPlaying: NowPlayingResult;
}

export default function NowPlayingBanner({ nowPlaying }: Props) {
  const { current, next } = nowPlaying;

  return (
    <div className='overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800'>
      {/* Now playing */}
      <div className='px-6 py-5'>
        <div className='mb-3 flex items-center gap-2'>
          <div className='flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-1 text-xs font-bold text-red-400 ring-1 ring-red-600/30'>
            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-400' />
            NOW AIRING
          </div>
        </div>

        <div className='flex items-start gap-3'>
          <div className='mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/30'>
            <Play className='h-4 w-4 fill-cyan-400 text-cyan-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-base font-semibold text-white md:text-lg'>
              {current.label}
            </p>
            {current.seriesTitle !== current.label && (
              <p className='mt-0.5 text-sm text-slate-400'>
                {current.seriesTitle}
              </p>
            )}
            {current.description && (
              <p className='mt-1.5 line-clamp-2 text-sm text-slate-500'>
                {current.description}
              </p>
            )}
            {current.tags && current.tags.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-1.5'>
                {current.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Remaining time */}
          <div className='hidden shrink-0 flex-col items-end gap-1 sm:flex'>
            <div className='flex items-center gap-1 text-xs text-slate-400'>
              <Clock className='h-3.5 w-3.5' />
              <span>{formatRemaining(current.remainingSec)} left</span>
            </div>
            <p className='text-[11px] text-slate-600'>
              {Math.round(current.progressPercent)}% complete
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className='mt-4'>
          <div className='mb-1 flex items-center justify-between text-[11px] text-slate-500'>
            <span>Progress</span>
            <span>{formatRemaining(current.remainingSec)} remaining</span>
          </div>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
            <div
              className='h-full rounded-full bg-cyan-500 transition-all duration-1000'
              style={{ width: `${current.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Up next */}
      {next && (
        <div className='border-t border-slate-800 bg-slate-950/50 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <SkipForward className='h-4 w-4 shrink-0 text-slate-500' />
            <div className='min-w-0'>
              <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
                Up Next
              </p>
              <p className='mt-0.5 truncate text-sm font-medium text-slate-300'>
                {next.label}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
