import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Episode } from '@/types';

export default function EpisodeList({ episodes }: { episodes: Episode[] }) {
  if (!episodes.length) return null;
  return (
    <div className='space-y-2'>
      {episodes.map((ep) => (
        <Link
          key={ep.id}
          href={ep.isEmbeddable ? `/watch/youtube/${ep.id}` : ep.watchUrl}
          target={ep.isEmbeddable ? undefined : '_blank'}
          rel={ep.isEmbeddable ? undefined : 'noopener noreferrer'}
          className='group flex items-start gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-800 transition-all hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          <div className='relative aspect-video w-28 shrink-0 overflow-hidden rounded bg-slate-800'>
            <Image
              src={ep.thumbnail}
              alt={ep.title}
              fill
              sizes='112px'
              className='object-cover'
              unoptimized
            />
            <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
              {ep.isEmbeddable ? (
                <Play className='h-6 w-6 text-white' />
              ) : (
                <ExternalLink className='h-5 w-5 text-white' />
              )}
            </div>
          </div>
          <div className='min-w-0 flex-1'>
            <p className='line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-cyan-400'>
              {ep.title}
            </p>
            <p className='mt-0.5 text-xs text-slate-500'>
              {ep.duration} · {ep.sourceName}
            </p>
            <p className='mt-1 line-clamp-2 text-xs text-slate-400'>
              {ep.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
