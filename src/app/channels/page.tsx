import { Radio } from 'lucide-react';
import type { Metadata } from 'next';

import { computeNowPlaying, listChannelsLive } from '@/lib/channelSchedule';

import { themedChannels } from '@/data/channels';

import ChannelCard from '@/components/media/ChannelCard';
import TVGuideRail from '@/components/media/TVGuideRail';

export const metadata: Metadata = {
  title: 'Channels — Anime TV',
  description:
    'Browse 7 themed 24/7 pseudo-live anime channels — Shonen Station, Retro Vault, Mecha Core, Chill Nights, Fantasy Realm, Dub Central, and Movie Night.',
};

export const dynamic = 'force-dynamic';

export default function ChannelsPage() {
  // Compute live state at render time (server component — no stale data).
  const nowMs = Date.now();
  const liveChannels = listChannelsLive(nowMs);

  // Pre-compute NowPlayingResult for each channel so ChannelCard can show
  // the progress bar without a client-side computation.
  const nowPlayingMap = Object.fromEntries(
    themedChannels.map((ch) => [ch.slug, computeNowPlaying(ch, nowMs)])
  );

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      {/* Page header */}
      <div className='mb-2 flex items-center gap-3'>
        <Radio className='h-6 w-6 text-red-400' />
        <h1 className='text-2xl font-bold text-white md:text-3xl'>Channels</h1>
        <span className='flex items-center gap-1.5 rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-semibold text-red-400'>
          <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-red-400' />
          LIVE
        </span>
      </div>
      <p className='mb-8 max-w-2xl text-slate-400'>
        Seven themed 24/7 anime channels — tune in and watch the same content as
        everyone else, in real time. No sign-up required.
      </p>

      {/* Channel cards grid */}
      <section aria-label='Themed channels'>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {liveChannels.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              nowPlaying={nowPlayingMap[ch.slug]}
            />
          ))}
        </div>
      </section>

      {/* TV Guide table */}
      <section aria-label='Program guide' className='mt-12'>
        <h2 className='mb-4 text-xl font-bold text-white'>Program Guide</h2>
        <TVGuideRail channels={liveChannels} />
      </section>
    </div>
  );
}
