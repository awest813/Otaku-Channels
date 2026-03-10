import { ArrowLeft, Radio } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  computeNowPlaying,
  computeSchedule,
  formatSlotTime,
} from '@/lib/channelSchedule';

import { getChannelBySlug, themedChannels } from '@/data/channels';

import NowPlayingBanner from '@/components/media/NowPlayingBanner';

export const dynamic = 'force-dynamic';

// ─── Static params for pre-rendering ─────────────────────────────────────────

export function generateStaticParams() {
  return themedChannels.map((ch) => ({ slug: ch.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const channel = getChannelBySlug(slug);
  if (!channel)
    return { title: 'Channel Not Found', description: 'Channel not found.' };
  return {
    title: `${channel.name} — Anime TV`,
    description: channel.description,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const channel = getChannelBySlug(slug);

  if (!channel) notFound();

  const nowMs = Date.now();
  const nowPlaying = computeNowPlaying(channel, nowMs);
  const schedule = computeSchedule(channel, nowMs);

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      {/* Back link */}
      <Link
        href='/channels'
        className='mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white'
      >
        <ArrowLeft className='h-4 w-4' />
        All Channels
      </Link>

      {/* Channel header */}
      <div className='mb-6 flex items-start gap-4'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 ring-1 ring-slate-700'>
          <Radio className='h-6 w-6 text-red-400' />
        </div>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold text-white md:text-3xl'>
              {channel.name}
            </h1>
            <span className='rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300'>
              CH {channel.channelNumber}
            </span>
          </div>
          {channel.tagline && (
            <p className='mt-0.5 text-sm italic text-slate-400'>
              {channel.tagline}
            </p>
          )}
          <p className='mt-2 max-w-2xl text-sm text-slate-400'>
            {channel.description}
          </p>
          {/* Genre / mood tags */}
          <div className='mt-3 flex flex-wrap gap-2'>
            {channel.genre && (
              <span className='rounded-full bg-cyan-950/50 px-3 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-cyan-800/40'>
                {channel.genre}
              </span>
            )}
            {channel.mood && (
              <span className='rounded-full bg-purple-950/50 px-3 py-0.5 text-xs font-medium text-purple-400 ring-1 ring-purple-800/40'>
                {channel.mood}
              </span>
            )}
            {channel.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className='rounded-full bg-slate-800 px-3 py-0.5 text-xs font-medium text-slate-400'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
        {/* Left — full schedule */}
        <section aria-label='Full schedule'>
          <h2 className='mb-4 text-lg font-bold text-white'>Full Schedule</h2>
          <div className='overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60'>
            {/* Table header */}
            <div className='grid grid-cols-[80px_1fr_auto] border-b border-slate-800 bg-slate-800/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
              <span>Time</span>
              <span>Program</span>
              <span className='text-right'>Duration</span>
            </div>

            {/* Schedule rows */}
            {schedule.map((entry) => {
              const mins = Math.round(entry.durationSec / 60);
              return (
                <div
                  key={entry.slotIndex}
                  className={`grid grid-cols-[80px_1fr_auto] items-start gap-2 border-b border-slate-800/50 px-4 py-3 transition-colors last:border-0 ${
                    entry.isNow
                      ? 'bg-cyan-950/30 ring-1 ring-inset ring-cyan-800/30'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Time */}
                  <div className='font-mono text-xs text-slate-500'>
                    {formatSlotTime(entry.startsAtMs)}
                    {entry.isNow && (
                      <span className='ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] font-bold text-white'>
                        ON AIR
                      </span>
                    )}
                  </div>

                  {/* Program info */}
                  <div className='min-w-0'>
                    <p
                      className={`truncate text-sm font-medium ${
                        entry.isNow ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {entry.label}
                    </p>
                    {entry.seriesTitle !== entry.label && (
                      <p className='mt-0.5 truncate text-xs text-slate-500'>
                        {entry.seriesTitle}
                      </p>
                    )}
                    {/* Progress bar for now-playing row */}
                    {entry.isNow && (
                      <div className='mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800'>
                        <div
                          className='h-full rounded-full bg-cyan-500 transition-all'
                          style={{
                            width: `${nowPlaying.current.progressPercent}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Duration */}
                  <div className='text-right text-xs text-slate-600'>
                    {mins >= 60
                      ? `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(
                          2,
                          '0'
                        )}m`
                      : `${mins}m`}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right — now playing sidebar */}
        <aside>
          <h2 className='mb-4 text-lg font-bold text-white'>Now Airing</h2>
          <NowPlayingBanner nowPlaying={nowPlaying} />

          {/* Channel stats */}
          <div className='mt-6 rounded-xl bg-slate-900 p-4 ring-1 ring-slate-800'>
            <h3 className='mb-3 text-sm font-semibold text-slate-300'>
              Channel Info
            </h3>
            <dl className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-slate-500'>Channel</dt>
                <dd className='font-mono font-semibold text-cyan-300'>
                  CH {channel.channelNumber}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-slate-500'>Slots in rotation</dt>
                <dd className='text-slate-300'>
                  {channel.scheduleSlots.length}
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-slate-500'>Cycle length</dt>
                <dd className='text-slate-300'>
                  {Math.round(
                    channel.scheduleSlots.reduce(
                      (s, sl) => s + sl.durationSec,
                      0
                    ) / 60
                  )}{' '}
                  min
                </dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-slate-500'>Genre</dt>
                <dd className='text-slate-300'>{channel.genre ?? '—'}</dd>
              </div>
              <div className='flex justify-between'>
                <dt className='text-slate-500'>Mood</dt>
                <dd className='text-slate-300'>{channel.mood ?? '—'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
