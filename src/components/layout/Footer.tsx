import { Tv } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='border-t border-slate-800 bg-slate-950 py-8 text-slate-400'>
      <div className='mx-auto max-w-screen-xl px-4'>
        <div className='flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <div className='flex items-center gap-2'>
            <Tv className='h-4 w-4 text-cyan-400' />
            <span className='font-semibold text-white'>Anime TV</span>
          </div>
          <p className='max-w-sm text-xs text-slate-500'>
            Anime TV is a discovery guide linking to officially licensed free anime. We do not host, stream, or proxy any content. All content is served by the original platforms.
          </p>
          <nav className='flex gap-4 text-sm'>
            <Link href='/browse' className='hover:text-cyan-400 transition-colors'>Browse</Link>
            <Link href='/search' className='hover:text-cyan-400 transition-colors'>Search</Link>
            <Link href='/live' className='hover:text-cyan-400 transition-colors'>Live</Link>
            <Link href='/settings' className='hover:text-cyan-400 transition-colors'>Settings</Link>
          </nav>
        </div>
        <p className='mt-6 text-xs text-slate-600'>© 2024 Anime TV — Mock data only. Phase 1 demo.</p>
      </div>
    </footer>
  );
}
