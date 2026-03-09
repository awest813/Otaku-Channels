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
      className='group relative flex flex-col overflow-hidden rounded-lg bg-slate-900 ring-1 ring-slate-800 transition-all hover:shadow-lg hover:shadow-cyan-500/10 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
    >
      <div className='relative aspect-video overflow-hidden bg-slate-800'>
        <Image
          src={channel.thumbnail}
          alt={channel.name}
          fill
          sizes='(max-width: 640px) 50vw, 33vw'
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          unoptimized
        />
        <div className='absolute inset-0 bg-slate-950/50' />
        <div className='absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-white' />
          LIVE
        </div>
        <div className='absolute right-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 font-mono text-xs text-cyan-300'>
          CH {channel.channelNumber}
        </div>
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <div className='flex items-center justify-between'>
          <p className='font-semibold text-white'>{channel.name}</p>
          <ExternalLink className='h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-cyan-400' />
        </div>
        <p className='line-clamp-1 text-xs text-slate-400'>
          <span className='text-green-400'>▶ Now: </span>
          {channel.nowPlaying}
        </p>
        {channel.nextUp && (
          <p className='line-clamp-1 text-xs text-slate-500'>
            <span>Next: </span>
            {channel.nextUp}
          </p>
        )}
      </div>
    </Link>
  );
}
