'use client';

/**
 * TVGuideRail — horizontal scrollable TV-guide component.
 *
 * Shows a compact schedule row per channel: channel number, channel name,
 * "now playing" slot with an inline progress bar, and "up next".
 * Clicking a row navigates to the channel detail page.
 */
import { ChevronRight, Radio } from 'lucide-react';
import Link from 'next/link';

import type { ChannelWithSchedule } from '@/types';

interface Props {
  channels: ChannelWithSchedule[];
}

export default function TVGuideRail({ channels }: Props) {
  if (channels.length === 0) return null;

  return (
    <div className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60'>
      {/* Header */}
      <div className='grid grid-cols-[72px_1fr_1fr_auto] border-b border-slate-800 bg-slate-800/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
        <span>CH</span>
        <span>Now Playing</span>
        <span className='hidden sm:block'>Up Next</span>
        <span />
      </div>

      {/* Rows */}
      {channels.map((ch) => {
        return (
          <Link
            key={ch.id}
            href={ch.watchUrl}
            className='group grid grid-cols-[72px_1fr_1fr_auto] items-center gap-2 border-b border-slate-800/50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-800/40'
          >
            {/* Channel number */}
            <div className='flex items-center gap-1.5'>
              <Radio className='h-3 w-3 shrink-0 text-red-400' />
              <span className='font-mono text-sm font-semibold text-cyan-300'>
                {ch.channelNumber}
              </span>
            </div>

            {/* Now playing */}
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-white'>
                {ch.name}
              </p>
              <div className='mt-1 flex items-center gap-2'>
                <span className='h-1 w-1 shrink-0 animate-pulse rounded-full bg-green-400' />
                <p className='truncate text-xs text-slate-400'>
                  {ch.nowPlaying}
                </p>
              </div>
            </div>

            {/* Up next */}
            <div className='hidden min-w-0 sm:block'>
              {ch.nextUp ? (
                <p className='truncate text-xs text-slate-500'>{ch.nextUp}</p>
              ) : (
                <span className='text-xs text-slate-700'>—</span>
              )}
            </div>

            {/* Arrow */}
            <ChevronRight className='h-4 w-4 shrink-0 text-slate-700 transition-colors group-hover:text-slate-400' />
          </Link>
        );
      })}
    </div>
  );
}
