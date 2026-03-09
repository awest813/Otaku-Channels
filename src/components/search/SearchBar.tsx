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
  return (
    <div className={cn('relative', className)}>
      <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500' />
      <input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white'
          aria-label='Clear search'
        >
          <X className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
