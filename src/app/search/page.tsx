'use client';
import { ExternalLink, Search } from 'lucide-react';
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
        active
          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
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

  const hasFilters = !!(query || genre || source);

  const clearFilters = () => {
    setQuery('');
    setGenre(null);
    setSource(null);
  };

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='mb-1 text-2xl font-bold text-white md:text-3xl'>
          Search
        </h1>
        <p className='text-sm text-slate-500'>
          Search across all officially licensed free anime
        </p>
      </div>

      {/* Search input */}
      <SearchBar
        value={query}
        onChange={setQuery}
        className='mb-6'
        placeholder='Search by title, genre, or description…'
      />

      {/* Filters */}
      <div className='mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4'>
        {/* Genre filter */}
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

        {/* Source filter */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Source
          </p>
          <div className='flex flex-wrap gap-2'>
            <FilterChip
              label='All Sources'
              active={!source}
              onClick={() => setSource(null)}
            />
            {sourceProviders.map((sp) => (
              <FilterChip
                key={sp.id}
                label={sp.name}
                active={source === sp.name}
                onClick={() =>
                  setSource(source === sp.name ? null : sp.name)
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {hasFilters ? (
        results.length === 0 ? (
          <div className='space-y-6'>
            <EmptyState
              title={
                query ? `No results for "${query}"` : 'No matches found'
              }
              message={
                query
                  ? 'Try a different spelling, or search YouTube for more anime.'
                  : 'Try adjusting your filters.'
              }
              action={
                hasFilters
                  ? { label: 'Clear filters', onClick: clearFilters }
                  : undefined
              }
            />
            {query && (
              <div className='flex flex-col items-center gap-3'>
                <p className='text-sm text-slate-500'>
                  Can&apos;t find it? Search on YouTube:
                </p>
                <a
                  href={youtubeAnimeSearchUrl(query)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                >
                  <Search className='h-4 w-4' />
                  Search &quot;{query}&quot; on YouTube
                </a>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
              <p className='text-sm text-slate-500' aria-live='polite'>
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {query && (
                <a
                  href={youtubeAnimeSearchUrl(query)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 rounded-lg bg-red-600/15 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-600/25 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
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
          <div>
            <p className='mb-3 text-sm font-medium text-slate-400'>
              Popular picks to get you started
            </p>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {allContent.slice(0, 12).map((item) => (
                <MediaCard key={item.id} item={item as AnimeSeries | Movie} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
