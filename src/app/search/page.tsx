'use client';
import * as React from 'react';

import { allContent } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import SearchBar from '@/components/search/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

const allGenres = Array.from(
  new Set(allContent.flatMap((i) => i.genres))
).sort();

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [genre, setGenre] = React.useState<string | null>(null);

  const results = (allContent as Array<AnimeSeries | Movie>).filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q));
    const matchesGenre = !genre || item.genres.includes(genre);
    return matchesQuery && matchesGenre;
  });

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-white md:text-3xl'>Search</h1>
      <SearchBar value={query} onChange={setQuery} className='mb-6' />

      <div className='mb-6'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
          Filter by genre
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

      {query || genre ? (
        results.length === 0 ? (
          <EmptyState message={`No results for "${query}"`} />
        ) : (
          <>
            <p className='mb-4 text-sm text-slate-400'>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {results.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )
      ) : (
        <div className='space-y-6'>
          <p className='text-slate-500'>
            Start typing to search all anime and movies.
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {allContent.slice(0, 12).map((item) => (
              <MediaCard key={item.id} item={item as AnimeSeries | Movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
