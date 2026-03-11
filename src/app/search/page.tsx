'use client';
import { ExternalLink, Loader2, Search } from 'lucide-react';
import * as React from 'react';

import { searchContent } from '@/lib/api-client';

import { allContent, sourceProviders } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import SearchBar from '@/components/search/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

// Derive genres from the static content for filter chips
const fallbackGenres = Array.from(
  new Set((allContent as (AnimeSeries | Movie)[]).flatMap((i) => i.genres))
).sort();

// Derive source names from source providers
const sourceOptions = sourceProviders.map((p) => ({
  id: p.id,
  name: p.name,
}));

const languageOptions = [
  { id: 'sub', label: 'Subtitled' },
  { id: 'dub', label: 'Dubbed' },
  { id: 'both', label: 'Sub & Dub' },
];

/** Build a YouTube search URL for an anime query. */
function youtubeAnimeSearchUrl(query: string): string {
  const q = encodeURIComponent(`${query} anime official`);
  return `https://www.youtube.com/results?search_query=${q}`;
}

type SearchResult = AnimeSeries | Movie;

export default function SearchPage() {
  const [query, setQuery] = React.useState('');
  const [genre, setGenre] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState<string | null>(null);
  const [apiResults, setApiResults] = React.useState<SearchResult[] | null>(
    null
  );
  const [searching, setSearching] = React.useState(false);
  const [searchSource, setSearchSource] = React.useState<
    'backend' | 'jikan' | 'mock' | 'local'
  >('local');

  // Debounced search — fires 500 ms after the user stops typing
  React.useEffect(() => {
    if (!query && !genre && !source && !language) {
      setApiResults(null);
      setSearchSource('local');
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchContent({
          q: query || undefined,
          genre: genre ?? undefined,
          source: source ?? undefined,
          language: language ?? undefined,
        });
        if (!controller.signal.aborted) {
          setApiResults(result.data as SearchResult[]);
          setSearchSource(result.source ?? 'backend');
        }
      } catch {
        // Fall back to in-memory mock data when the API is completely unavailable
        if (!controller.signal.aborted) {
          setApiResults(null);
          setSearchSource('local');
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, genre, source, language]);

  // In-memory fallback when API is unavailable
  const inMemoryResults = (allContent as SearchResult[]).filter((item) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q));
    const matchesGenre = !genre || item.genres.includes(genre);
    const matchesSource = !source || item.sourceType === source;
    const matchesLanguage =
      !language || item.language === language || item.language === 'both';
    return matchesQuery && matchesGenre && matchesSource && matchesLanguage;
  });

  const results = apiResults ?? inMemoryResults;
  const hasFilters = !!(query || genre || source || language);

  const clearFilters = () => {
    setQuery('');
    setGenre(null);
    setSource(null);
    setLanguage(null);
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
          Search across official free anime + the full MyAnimeList database
        </p>
      </div>

      {/* Search input with instant suggestions */}
      <SearchBar
        value={query}
        onChange={setQuery}
        className='mb-6'
        placeholder='Search by title, genre, or description…'
        showSuggestions
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

        {/* Source filter */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Source
          </p>
          <div className='flex flex-wrap gap-2'>
            <GenrePill
              genre='All Sources'
              active={!source}
              onClick={() => setSource(null)}
            />
            {sourceOptions.map((s) => (
              <GenrePill
                key={s.id}
                genre={s.name}
                active={source === s.id}
                onClick={() => setSource(source === s.id ? null : s.id)}
              />
            ))}
          </div>
        </div>

        {/* Language filter */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Language
          </p>
          <div className='flex flex-wrap gap-2'>
            <GenrePill
              genre='Any'
              active={!language}
              onClick={() => setLanguage(null)}
            />
            {languageOptions.map((l) => (
              <GenrePill
                key={l.id}
                genre={l.label}
                active={language === l.id}
                onClick={() => setLanguage(language === l.id ? null : l.id)}
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
              <div className='flex items-center gap-2'>
                <p className='text-sm text-slate-500' aria-live='polite'>
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {searchSource === 'jikan' && (
                  <span className='rounded-md bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-300 ring-1 ring-violet-700/50'>
                    via MyAnimeList
                  </span>
                )}
              </div>
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
              {(allContent as SearchResult[]).slice(0, 12).map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
