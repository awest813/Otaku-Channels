import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { LiveChannel } from '@/types';

export default function LiveChannelCard({ channel }: { channel: LiveChannel }) {
  return (
    <Link
      href={channel.watchUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='group relative flex flex-col overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/5 hover:ring-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
    >
      <div className='relative aspect-video overflow-hidden bg-slate-800'>
        <Image
          src={channel.thumbnail}
          alt={channel.name}
          fill
          sizes='(max-width: 640px) 50vw, 33vw'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent' />

        {/* Live badge */}
        <div className='absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white' />
          LIVE
        </div>

        {/* Channel number */}
        <div className='absolute right-2 top-2 rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 backdrop-blur-sm'>
          CH {channel.channelNumber}
        </div>

        {/* External link on hover */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
          <div className='rounded-full bg-white/10 p-3 backdrop-blur-sm'>
            <ExternalLink className='h-5 w-5 text-white' />
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <div className='flex items-start justify-between gap-2'>
          <p className='font-semibold leading-tight text-white'>{channel.name}</p>
        </div>
        <p className='line-clamp-1 text-xs text-slate-400'>
          <span className='font-medium text-green-400'>▶ Now: </span>
          {channel.nowPlaying}
        </p>
        {channel.nextUp && (
          <p className='line-clamp-1 text-xs text-slate-600'>
            Next: {channel.nextUp}
          </p>
        )}
        <p className='mt-auto pt-1 text-xs text-slate-600'>{channel.sourceName}</p>
      </div>
    </Link>
  );
}
