'use client';

import * as React from 'react';
import '@/lib/env';

const contentRows = [
  'Now Airing',
  'Free on YouTube',
  'Classic Anime',
  'Anime Movies',
  'Dubbed Picks',
  '24/7 Channels',
];

const channelGuide = [
  { number: '101', name: 'Shonen Station' },
  { number: '102', name: 'Retro Vault' },
  { number: '103', name: 'Mecha Core' },
  { number: '104', name: 'Anime Movie Night' },
  { number: '105', name: 'YouTube Premieres' },
];

const sources = [
  'YouTube',
  'Pluto TV',
  'Tubi',
  'RetroCrush',
  'Official RSS Feeds',
];

export default function HomePage() {
  return (
    <main className='min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white'>
      <section className='layout py-10'>
        <p className='text-sm uppercase tracking-[0.2em] text-cyan-300'>
          Otaku Channels
        </p>
        <h1 className='mt-3 text-3xl font-bold md:text-5xl'>
          A browser-based anime TV guide for legally free streams
        </h1>
        <p className='mt-4 max-w-3xl text-slate-200'>
          Discover officially free anime episodes, clips, movies, and live
          channels in one couch-friendly launcher. Watch from official embeds
          when allowed or open the source platform when required.
        </p>

        <div className='mt-8 grid gap-4 md:grid-cols-3'>
          <article className='rounded-lg border border-slate-700 bg-slate-900/60 p-4'>
            <h2 className='text-lg font-semibold text-cyan-200'>
              Source layer
            </h2>
            <ul className='mt-2 space-y-1 text-sm text-slate-200'>
              {sources.map((source) => (
                <li key={source}>• {source}</li>
              ))}
            </ul>
          </article>

          <article className='rounded-lg border border-slate-700 bg-slate-900/60 p-4'>
            <h2 className='text-lg font-semibold text-cyan-200'>
              Unified metadata
            </h2>
            <p className='mt-2 text-sm text-slate-200'>
              Every item is normalized with title, series, episode, runtime,
              dub/sub labels, source attribution, and region + embed rules.
            </p>
          </article>

          <article className='rounded-lg border border-slate-700 bg-slate-900/60 p-4'>
            <h2 className='text-lg font-semibold text-cyan-200'>
              Playback guardrails
            </h2>
            <p className='mt-2 text-sm text-slate-200'>
              No proxying, ripping, ad-stripping, or rebroadcasting. This app is
              discovery + official launch only.
            </p>
          </article>
        </div>

        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          <section>
            <h2 className='text-2xl font-semibold'>TV-style rows</h2>
            <div className='mt-3 grid grid-cols-2 gap-3'>
              {contentRows.map((row) => (
                <div
                  key={row}
                  className='rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm'
                >
                  {row}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold'>
              Free anime cable-box channels
            </h2>
            <div className='mt-3 space-y-2'>
              {channelGuide.map((channel) => (
                <div
                  key={channel.number}
                  className='flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm'
                >
                  <span className='font-mono text-cyan-300'>
                    CH {channel.number}
                  </span>
                  <span>{channel.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
