'use client';

import { Menu, Search, Tv, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Search', href: '/search' },
  { label: 'Live', href: '/live' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className='sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur'>
      <div className='mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3'>
        <Link href='/' className='flex items-center gap-2 text-lg font-bold text-white'>
          <Tv className='h-5 w-5 text-cyan-400' />
          <span>Anime TV</span>
        </Link>
        <nav className='hidden gap-6 md:flex'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                pathname === link.href ? 'text-cyan-400' : 'text-slate-300'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className='flex items-center gap-3'>
          <Link
            href='/search'
            className='hidden text-slate-300 hover:text-cyan-400 md:block'
            aria-label='Search'
          >
            <Search className='h-5 w-5' />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className='text-slate-300 hover:text-white md:hidden'
            aria-label='Toggle menu'
          >
            {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
          </button>
        </div>
      </div>
      {open && (
        <div className='border-t border-slate-800 bg-slate-950 px-4 pb-4 md:hidden'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block py-2 text-sm font-medium transition-colors hover:text-cyan-400',
                pathname === link.href ? 'text-cyan-400' : 'text-slate-300'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
