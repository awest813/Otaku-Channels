import { Tv } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-slate-950'>
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center'>
          <div className='rounded-full bg-slate-800/60 p-5'>
            <Tv className='h-10 w-10 text-slate-500' />
          </div>
          <div className='space-y-2'>
            <p className='text-7xl font-black tracking-tight text-slate-700 md:text-9xl'>
              404
            </p>
            <h1 className='text-xl font-bold text-white md:text-2xl'>
              Page not found
            </h1>
            <p className='text-sm text-slate-400'>
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <Link
              href='/'
              className='rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
            >
              Back to Home
            </Link>
            <Link
              href='/browse'
              className='rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
            >
              Browse Anime
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
