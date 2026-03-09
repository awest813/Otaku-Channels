'use client';
import * as React from 'react';

import { allContent } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

const allGenres = Array.from(
  new Set(allContent.flatMap((i) => i.genres))
).sort();
/** Derive the source list from content that actually exists in mock data. */
const sources = [
  'All',
  ...Array.from(new Set(allContent.map((i) => i.sourceName))).sort(),
];
const languages = ['All', 'sub', 'dub', 'both'];

export default function BrowsePage() {
  const [genre, setGenre] = React.useState<string | null>(null);
  const [source, setSource] = React.useState('All');
  const [lang, setLang] = React.useState('All');

  const filtered = (allContent as Array<AnimeSeries | Movie>).filter((item) => {
    if (genre && !item.genres.includes(genre)) return false;
    if (source !== 'All' && item.sourceName !== source) return false;
    if (lang !== 'All') {
      const l = item.language;
      if (l !== lang && l !== 'both') return false;
    }
    return true;
  });

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-white md:text-3xl'>
        Browse All Anime
      </h1>

      <div className='mb-6 space-y-4'>
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Genre
          </p>
          <div className='flex flex-wrap gap-2'>
            <GenrePill
              genre='All'
              active={!genre}
              onClick={() => setGenre(null)}
            />
            {allGenres.map((g) => (
              <GenrePill
                key={g}
                genre={g}
                active={genre === g}
                onClick={() => setGenre(g === genre ? null : g)}
              />
            ))}
          </div>
        </div>
        <div className='flex flex-wrap gap-4'>
          <div>
            <label className='mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500'>
              Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className='rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none'
            >
              {sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500'>
              Language
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className='rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none'
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message='No anime matches these filters.' />
      ) : (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
