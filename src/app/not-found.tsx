import { Metadata } from 'next';
import Link from 'next/link';
import * as React from 'react';
import { RiAlarmWarningFill } from 'react-icons/ri';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <section className='bg-slate-950'>
        <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center'>
          <RiAlarmWarningFill
            size={60}
            className='drop-shadow-glow animate-flicker text-red-500'
          />
          <h1 className='text-4xl font-bold text-white md:text-6xl'>
            Page Not Found
          </h1>
          <p className='text-slate-400'>
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href='/'
            className='mt-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400'
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
