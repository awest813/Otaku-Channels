import { ExternalLink, Tv } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='mt-16 border-t border-slate-800 bg-slate-950 py-10'>
      <div className='mx-auto max-w-screen-xl px-4'>
        <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-4'>
          {/* Brand */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Tv className='h-4 w-4 text-cyan-400' />
              <span className='font-bold text-white'>Anime TV</span>
            </div>
            <p className='text-xs leading-relaxed text-slate-500'>
              A discovery guide for officially licensed free anime. We link
              only to legal, free sources.
            </p>
          </div>

          {/* Browse */}
          <div className='space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
              Discover
            </p>
            <nav className='flex flex-col gap-2 text-sm'>
              <Link
                href='/browse'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Browse All
              </Link>
              <Link
                href='/browse?source=youtube'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                YouTube
              </Link>
              <Link
                href='/browse?source=tubi'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Tubi
              </Link>
              <Link
                href='/browse?type=movie'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Movies
              </Link>
              <Link
                href='/live'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Live Channels
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div className='space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
              My Anime TV
            </p>
            <nav className='flex flex-col gap-2 text-sm'>
              <Link
                href='/search'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Search
              </Link>
              <Link
                href='/watchlist'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                My List
              </Link>
              <Link
                href='/settings'
                className='text-slate-400 transition-colors hover:text-cyan-400'
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className='space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
              About
            </p>
            <div className='space-y-2 text-xs text-slate-500'>
              <p>
                Anime TV aggregates links to officially licensed content. All
                video is served by the original platforms.
              </p>
              <p className='flex items-center gap-1'>
                <ExternalLink className='h-3 w-3 shrink-0' />
                Sources: YouTube, Tubi, Crunchyroll, RetroCrush, Pluto TV
              </p>
            </div>
          </div>
        </div>

        <div className='mt-8 flex flex-col items-start justify-between gap-2 border-t border-slate-800/60 pt-6 sm:flex-row sm:items-center'>
          <p className='text-xs text-slate-600'>
            © {new Date().getFullYear()} Anime TV — No content is hosted on
            this site.
          </p>
          <p className='text-xs text-slate-700'>
            For entertainment discovery only.
          </p>
        </div>
      </div>
    </footer>
  );
}
