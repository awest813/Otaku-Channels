'use client';
import { ExternalLink } from 'lucide-react';
import * as React from 'react';

import { allContent, sourceProviders } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import SearchBar from '@/components/search/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

const allGenres = Array.from(
  new Set(allContent.flatMap((i) => i.genres))
).sort();

/** Build a YouTube search URL for an anime query. */
function youtubeAnimeSearchUrl(query: string): string {
  const q = encodeURIComponent(`${query} anime official`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [genre, setGenre] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<string | null>(null);

  const results = (allContent as Array<AnimeSeries | Movie>).filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q));
    const matchesGenre = !genre || item.genres.includes(genre);
    const matchesSource = !source || item.sourceName === source;
    return matchesQuery && matchesGenre && matchesSource;
  });

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-white md:text-3xl'>Search</h1>
      <SearchBar value={query} onChange={setQuery} className='mb-6' />

      <div className='mb-6 space-y-4'>
        <div>
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

        <div>
          <label className='mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Filter by source
          </label>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSource(null)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !source
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}
            >
              All Sources
            </button>
            {sourceProviders.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSource(source === sp.name ? null : sp.name)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  source === sp.name
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {query || genre || source ? (
        results.length === 0 ? (
          <div className='space-y-4'>
            <EmptyState
              message={
                query
                  ? `No results for "${query}"`
                  : 'No anime matches these filters.'
              }
            />
            {query && (
              <div className='flex flex-col items-center gap-2'>
                <p className='text-sm text-slate-400'>
                  Try searching for this on YouTube:
                </p>
                <a
                  href={youtubeAnimeSearchUrl(query)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500'
                >
                  <ExternalLink className='h-4 w-4' />
                  Search &quot;{query}&quot; on YouTube
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
              <p className='text-sm text-slate-400'>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {query && (
                <a
                  href={youtubeAnimeSearchUrl(query)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 rounded-md bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-600/30 hover:text-red-300'
                >
                  <ExternalLink className='h-3.5 w-3.5' />
                  Also search YouTube
                </a>
              )}
            </div>
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
