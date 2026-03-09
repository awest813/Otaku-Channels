import { Radio } from 'lucide-react';
import type { Metadata } from 'next';

import { mockLiveChannels } from '@/data/mockData';

import LiveChannelCard from '@/components/media/LiveChannelCard';

export const metadata: Metadata = { title: 'Live Channels' };

export default function LivePage() {
  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <div className='mb-6 flex items-center gap-3'>
        <Radio className='h-6 w-6 text-red-400' />
        <h1 className='text-2xl font-bold text-white md:text-3xl'>Live Channels</h1>
        <span className='flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-semibold text-red-400'>
          <span className='h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse' />
          LIVE
        </span>
      </div>
      <p className='mb-8 max-w-2xl text-slate-400'>
        Free 24/7 anime streaming channels. Tune in to live and scheduled programming from official sources.
      </p>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {mockLiveChannels.map((ch) => (
          <LiveChannelCard key={ch.id} channel={ch} />
        ))}
      </div>

      {/* Program guide preview */}
      <div className='mt-10'>
        <h2 className='mb-4 text-xl font-bold text-white'>Program Guide</h2>
        <div className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900'>
          <div className='grid grid-cols-[80px_1fr_1fr_1fr] border-b border-slate-800 bg-slate-800/50 text-xs font-semibold text-slate-400'>
            <div className='px-3 py-2'>CH</div>
            <div className='px-3 py-2'>NOW PLAYING</div>
            <div className='px-3 py-2'>UP NEXT</div>
            <div className='px-3 py-2 text-right'>SOURCE</div>
          </div>
          {mockLiveChannels.map((ch) => (
            <div key={ch.id} className='grid grid-cols-[80px_1fr_1fr_1fr] border-b border-slate-800/50 text-sm last:border-0 hover:bg-slate-800/30 transition-colors'>
              <div className='px-3 py-3 font-mono text-cyan-300'>{ch.channelNumber}</div>
              <div className='px-3 py-3 text-white'>{ch.nowPlaying}</div>
              <div className='px-3 py-3 text-slate-400'>{ch.nextUp ?? '—'}</div>
              <div className='px-3 py-3 text-right text-xs text-slate-500'>{ch.sourceName}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
