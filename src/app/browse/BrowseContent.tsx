'use client';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import MediaCard from '@/components/media/MediaCard';
import EmptyState from '@/components/ui/EmptyState';
import GenrePill from '@/components/ui/GenrePill';

import type { AnimeSeries, Movie } from '@/types';

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
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
        active
          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white'
      )}
    >
      {label}
    </button>
  );
}

interface Props {
  initialItems: (AnimeSeries | Movie)[];
  allGenres: string[];
  sourceNames: string[];
}

const languages = ['sub', 'dub', 'both'];

const contentTypes = [
  { label: 'Series', value: 'series' },
  { label: 'Movies', value: 'movie' },
];

export default function BrowseContent({
  initialItems,
  allGenres,
  sourceNames,
}: Props) {
  const searchParams = useSearchParams();

  const sourceParam = searchParams.get('source');
  const initialSource = sourceParam
    ? sourceNames.find(
        (n) =>
          n.toLowerCase().replace(/\s+/g, '') ===
          sourceParam.toLowerCase().replace(/\s+/g, '')
      ) ?? null
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

  const filtered = initialItems.filter((item) => {
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
          className={cn(
            'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 md:hidden',
            hasActiveFilters
              ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          )}
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
        className={cn(
          'mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4',
          showFilters ? 'block' : 'hidden md:block'
        )}
      >
        {/* Genre */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Genre
          </p>
          <div className='scrollbar-hide max-h-24 overflow-y-auto'>
            <div className='flex flex-wrap gap-2 pb-1'>
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
            {sourceNames.map((name) => (
              <FilterChip
                key={name}
                label={name}
                active={source === name}
                onClick={() => setSource(source === name ? null : name)}
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
                  setContentType(contentType === ct.value ? null : ct.value)
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
              className='flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-red-400 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
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
