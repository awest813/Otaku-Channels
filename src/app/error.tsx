'use client'; // Error components must be Client Components

import { AlertTriangle } from 'lucide-react';
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
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
          <AlertTriangle className='h-16 w-16 animate-pulse text-red-500' />
          <h1 className='text-4xl font-bold text-white md:text-6xl'>
            Oops, something went wrong!
          </h1>
          <TextButton variant='basic' onClick={reset} className='mt-2'>
            Try again
          </TextButton>
        </div>
      </section>
    </main>
  );
}
