'use client';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { allContent, sourceProviders } from '@/data/mockData';

import MediaCard from '@/components/media/MediaCard';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

const allGenres = Array.from(
  new Set(allContent.flatMap((i) => i.genres))
).sort();

const languages = ['sub', 'dub', 'both'];

const contentTypes = [
  { label: 'Series', value: 'series' },
  { label: 'Movies', value: 'movie' },
];

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

function BrowseContent() {
  const searchParams = useSearchParams();

  const sourceParam = searchParams.get('source');
  const initialSource = sourceParam
    ? sourceProviders.find((sp) => sp.type === sourceParam)?.name ?? null
    : null;
  const langParam = searchParams.get('language');
  const initialLang =
    langParam && languages.includes(langParam) ? langParam : null;
  const genreParam = searchParams.get('genre');
  const initialGenre =
    genreParam && allGenres.includes(genreParam) ? genreParam : null;
  const typeParam = searchParams.get('type');
  const initialType =
    typeParam === 'series' || typeParam === 'movie' ? typeParam : null;

  const [genre, setGenre] = React.useState<string | null>(initialGenre);
  const [source, setSource] = React.useState<string | null>(initialSource);
  const [lang, setLang] = React.useState<string | null>(initialLang);
  const [contentType, setContentType] = React.useState<string | null>(
    initialType
  );
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters = !!(genre || source || lang || contentType);

  const clearAll = () => {
    setGenre(null);
    setSource(null);
    setLang(null);
    setContentType(null);
  };

  const filtered = (allContent as Array<AnimeSeries | Movie>).filter((item) => {
    if (genre && !item.genres.includes(genre)) return false;
    if (source && item.sourceName !== source) return false;
    if (lang) {
      const l = item.language;
      if (l !== lang && l !== 'both') return false;
    }
    if (contentType) {
      const isMovie = !('episodeCount' in item);
      if (contentType === 'movie' && !isMovie) return false;
      if (contentType === 'series' && isMovie) return false;
    }
    return true;
  });

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-8'>
      {/* Page header */}
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-white md:text-3xl'>Browse</h1>
          <p className='mt-0.5 text-sm text-slate-500'>
            All officially licensed free anime
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden ${
            hasActiveFilters
              ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }`}
          aria-expanded={showFilters}
          aria-label='Toggle filters'
        >
          <SlidersHorizontal className='h-4 w-4' />
          Filters
          {hasActiveFilters && (
            <span className='flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-slate-950'>
              {[genre, source, lang, contentType].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel — always visible on md+, toggleable on mobile */}
      <div
        className={`mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:block ${
          showFilters ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Genre */}
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

        {/* Source */}
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
                onClick={() => setSource(source === sp.name ? null : sp.name)}
              />
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Language
          </p>
          <div className='flex flex-wrap gap-2'>
            <FilterChip
              label='Any'
              active={!lang}
              onClick={() => setLang(null)}
            />
            <FilterChip
              label='Subbed'
              active={lang === 'sub'}
              onClick={() => setLang(lang === 'sub' ? null : 'sub')}
            />
            <FilterChip
              label='Dubbed'
              active={lang === 'dub'}
              onClick={() => setLang(lang === 'dub' ? null : 'dub')}
            />
            <FilterChip
              label='Both'
              active={lang === 'both'}
              onClick={() => setLang(lang === 'both' ? null : 'both')}
            />
          </div>
        </div>

        {/* Content type */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Type
          </p>
          <div className='flex flex-wrap gap-2'>
            <FilterChip
              label='All'
              active={!contentType}
              onClick={() => setContentType(null)}
            />
            {contentTypes.map((ct) => (
              <FilterChip
                key={ct.value}
                label={ct.label}
                active={contentType === ct.value}
                onClick={() =>
                  setContentType(
                    contentType === ct.value ? null : ct.value
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <div className='border-t border-slate-800 pt-3'>
            <button
              onClick={clearAll}
              className='flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:rounded'
            >
              <X className='h-3.5 w-3.5' />
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          title='No matches found'
          message='Try adjusting your filters or clearing them to see more anime.'
          action={{ label: 'Clear filters', onClick: clearAll }}
        />
      ) : (
        <>
          <p
            className='mb-4 text-sm text-slate-500'
            aria-live='polite'
            aria-atomic='true'
          >
            {filtered.length} title{filtered.length !== 1 ? 's' : ''}
            {hasActiveFilters && ' matching filters'}
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {filtered.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <React.Suspense
      fallback={
        <div className='mx-auto max-w-screen-xl px-4 py-8'>
          <div className='h-8 w-48 animate-pulse rounded-lg bg-slate-800' />
        </div>
      }
    >
      <BrowseContent />
    </React.Suspense>
  );
}
