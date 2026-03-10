'use client';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { getSearchSuggestions } from '@/lib/api-client';
import { cn } from '@/lib/utils';

import type { SuggestResponse } from '@/types/api';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  /** Whether to show instant suggestions dropdown. Defaults to true. */
  showSuggestions?: boolean;
}

type Suggestion = SuggestResponse['data'][number];

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search anime, movies, genres…',
  className,
  showSuggestions = true,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  // Debounced suggestion fetch
  React.useEffect(() => {
    if (!showSuggestions || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      const result = await getSearchSuggestions(value);
      setSuggestions(result.data);
      setOpen(result.data.length > 0);
      setActiveIndex(-1);
    }, 200);

    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  // Close on outside click
  React.useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      const s = suggestions[activeIndex];
      if (s) {
        e.preventDefault();
        navigateToSuggestion(s);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function navigateToSuggestion(s: Suggestion) {
    setOpen(false);
    onChange(s.title);
    router.push(`/series/${s.slug}`);
  }

  return (
    <div
      ref={containerRef}
      role='combobox'
      aria-expanded={open}
      aria-haspopup='listbox'
      aria-controls='search-suggestions-list'
      className={cn('relative', className)}
    >
      <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none' />
      <input
        ref={inputRef}
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete='off'
        spellCheck={false}
        aria-autocomplete='list'
        className='w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 hover:border-slate-600'
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            setSuggestions([]);
            setOpen(false);
            inputRef.current?.focus();
          }}
          className='absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
          aria-label='Clear search'
          type='button'
        >
          <X className='h-4 w-4' />
        </button>
      )}

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          id='search-suggestions-list'
          role='listbox'
          className='absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl'
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.slug}
              role='option'
              aria-selected={idx === activeIndex}
              onPointerDown={(e) => {
                e.preventDefault();
                navigateToSuggestion(s);
              }}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                idx === activeIndex
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              {s.posterUrl ? (
                <Image
                  src={s.posterUrl}
                  alt={s.title}
                  width={28}
                  height={40}
                  className='h-10 w-7 shrink-0 rounded object-cover'
                  unoptimized
                />
              ) : (
                <div className='h-10 w-7 shrink-0 rounded bg-slate-800' />
              )}
              <span className='truncate'>{s.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
