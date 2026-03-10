'use client';

import { Bookmark, Menu, Search, Settings, Tv, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Channels', href: '/channels' },
  { label: 'Live', href: '/live' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Prevent scroll when mobile menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className='sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md'>
        <div className='mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 text-lg font-bold text-white transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
          >
            <Tv className='h-5 w-5 text-cyan-400' />
            <span>Anime TV</span>
          </Link>

          {/* Desktop nav */}
          <nav
            className='hidden items-center gap-1 md:flex'
            aria-label='Main navigation'
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className='absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cyan-400' />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className='hidden items-center gap-1 md:flex'>
            <Link
              href='/search'
              className={cn(
                'rounded-md p-2 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                isActive('/search') && 'text-white'
              )}
              aria-label='Search'
            >
              <Search className='h-[18px] w-[18px]' />
            </Link>
            <Link
              href='/watchlist'
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                isActive('/watchlist')
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white'
              )}
              aria-label='My List'
            >
              <Bookmark className='h-4 w-4' />
              <span>My List</span>
            </Link>
          </div>

          {/* Mobile actions */}
          <div className='flex items-center gap-2 md:hidden'>
            <Link
              href='/search'
              className='rounded-md p-2 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              aria-label='Search'
            >
              <Search className='h-5 w-5' />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className='rounded-md p-2 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls='mobile-nav'
            >
              {open ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — separate overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden'
            onClick={() => setOpen(false)}
            aria-hidden='true'
          />
          {/* Drawer */}
          <nav
            id='mobile-nav'
            className='fixed right-0 top-0 z-50 flex h-full w-64 flex-col border-l border-slate-800 bg-slate-950 px-4 py-6 shadow-2xl md:hidden'
            aria-label='Mobile navigation'
          >
            <div className='mb-6 flex items-center justify-between'>
              <Link
                href='/'
                className='flex items-center gap-2 font-bold text-white'
                onClick={() => setOpen(false)}
              >
                <Tv className='h-4 w-4 text-cyan-400' />
                Anime TV
              </Link>
              <button
                onClick={() => setOpen(false)}
                className='rounded-md p-1.5 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                aria-label='Close menu'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='flex flex-col gap-1'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className='my-2 border-t border-slate-800' />

              <Link
                href='/search'
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive('/search')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Search className='h-4 w-4' />
                Search
              </Link>

              <Link
                href='/watchlist'
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive('/watchlist')
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Bookmark className='h-4 w-4' />
                My List
              </Link>

              <Link
                href='/settings'
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive('/settings')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <Settings className='h-4 w-4' />
                Settings
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
