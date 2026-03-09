'use client';
import { ExternalLink, Loader2, Search } from 'lucide-react';
import * as React from 'react';

import { allContent } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import SearchBar from '@/components/search/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

// Derive genres from the static content for filter chips
const fallbackGenres = Array.from(
  new Set((allContent as (AnimeSeries | Movie)[]).flatMap((i) => i.genres))
).sort();

/** Build a YouTube search URL for an anime query. */
function youtubeAnimeSearchUrl(query: string): string {
  const q = encodeURIComponent(`${query} anime official`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [genre, setGenre] = React.useState<string | null>(null);
  const [apiResults, setApiResults] = React.useState<
    (AnimeSeries | Movie)[] | null
  >(null);
  const [searching, setSearching] = React.useState(false);

  // Debounced API search — fires 400 ms after the user stops typing
  React.useEffect(() => {
    if (!query && !genre) {
      setApiResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (genre) params.set('genre', genre);
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const body = await res.json();
          setApiResults(body.data as (AnimeSeries | Movie)[]);
        } else {
          // Non-OK response: fall back to in-memory
          setApiResults(null);
        }
      } catch {
        // Network error or backend down: fall back to in-memory
        setApiResults(null);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, genre]);

  // In-memory fallback when API is unavailable
  const inMemoryResults = (allContent as (AnimeSeries | Movie)[]).filter(
    (item) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genres.some((g) => g.toLowerCase().includes(q));
      const matchesGenre = !genre || item.genres.includes(genre);
      return matchesQuery && matchesGenre;
    }
  );

  const results = apiResults ?? inMemoryResults;
  const hasFilters = !!(query || genre);

  const clearFilters = () => {
    setQuery('');
    setGenre(null);
    setApiResults(null);
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

      {/* Genre filter */}
      <div className='mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4'>
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
            {fallbackGenres.map((g) => (
              <GenrePill
                key={g}
                genre={g}
                active={genre === g}
                onClick={() => setGenre(g === genre ? null : g)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {searching ? (
        <div className='flex items-center justify-center gap-3 py-16 text-slate-400'>
          <Loader2 className='h-5 w-5 animate-spin' />
          <span className='text-sm'>Searching…</span>
        </div>
      ) : hasFilters ? (
        results.length === 0 ? (
          <div className='space-y-6'>
            <EmptyState
              title={query ? `No results for "${query}"` : 'No matches found'}
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
                  className='bg-red-600/15 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-600/25 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
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
              {(allContent as (AnimeSeries | Movie)[])
                .slice(0, 12)
                .map((item) => (
                  <MediaCard key={item.id} item={item} />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
