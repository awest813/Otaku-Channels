import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { mockSeries } from '@/data/mockData';

import WatchPlayerShell from '@/components/watch/WatchPlayerShell';

interface Props {
  params: Promise<{ source: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = mockSeries.find((s) => s.id === id);
  return { title: item ? `Watch: ${item.title}` : 'Watch' };
}

export default async function WatchPage({ params }: Props) {
  const { source: _source, id } = await params;
  const item = mockSeries.find((s) => s.id === id);

  if (!item) {
    return (
      <div className='mx-auto max-w-screen-xl px-4 py-16 text-center text-slate-400'>
        <p>Content not found.</p>
        <Link href='/' className='mt-4 inline-block text-cyan-400 hover:underline'>← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-screen-xl px-4 py-6'>
      <Link href={`/series/${item.slug}`} className='mb-4 flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors'>
        <ArrowLeft className='h-4 w-4' /> Back to {item.title}
      </Link>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4'>
          <WatchPlayerShell
            isEmbeddable={item.isEmbeddable}
            watchUrl={item.watchUrl}
            sourceName={item.sourceName}
          />
          <div>
            <h1 className='text-xl font-bold text-white'>{item.title}</h1>
            <p className='mt-1 text-sm text-slate-400'>{item.releaseYear} · {item.sourceName}</p>
            <p className='mt-3 text-sm text-slate-300'>{item.description}</p>
          </div>
        </div>
        <div className='space-y-3'>
          <h2 className='text-base font-semibold text-white'>Related Series</h2>
          {mockSeries.filter((s) => s.id !== item.id).slice(0, 5).map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className='flex items-center gap-3 rounded-lg bg-slate-900 p-2.5 ring-1 ring-slate-800 hover:ring-cyan-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
            >
              <div className='relative h-12 w-20 shrink-0 overflow-hidden rounded'>
                <Image src={s.thumbnail} alt={s.title} fill sizes='80px' className='object-cover' unoptimized />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-medium text-white line-clamp-1'>{s.title}</p>
                <p className='text-xs text-slate-500'>{s.releaseYear}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
