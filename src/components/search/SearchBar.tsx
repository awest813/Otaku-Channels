'use client';
import { Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search anime, movies, genres…',
  className,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={cn('relative', className)}>
      <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none' />
      <input
        ref={inputRef}
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete='off'
        spellCheck={false}
        className='w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-1 focus:ring-cyan-500 hover:border-slate-600'
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className='absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
          aria-label='Clear search'
          type='button'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
