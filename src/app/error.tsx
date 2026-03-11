'use client'; // Error components must be Client Components

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import TextButton from '@/components/buttons/TextButton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main>
      <section className='bg-slate-950'>
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center'>
          <div className='rounded-full bg-red-500/10 p-5'>
            <AlertTriangle className='h-10 w-10 text-red-400' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold text-white md:text-4xl'>
              Something went wrong
            </h1>
            <p className='text-sm text-slate-400'>
              An unexpected error occurred. You can try again or return home.
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-3'>
            <TextButton variant='basic' onClick={reset}>
              Try again
            </TextButton>
            <Link
              href='/'
              className='rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
