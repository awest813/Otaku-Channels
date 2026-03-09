import { ExternalLink, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Episode } from '@/types';

export default function EpisodeList({ episodes }: { episodes: Episode[] }) {
  if (!episodes.length) return null;
  return (
    <div className='space-y-2'>
      {episodes.map((ep, index) => (
        <Link
          key={ep.id}
          href={ep.isEmbeddable ? `/watch/youtube/${ep.id}` : ep.watchUrl}
          target={ep.isEmbeddable ? undefined : '_blank'}
          rel={ep.isEmbeddable ? undefined : 'noopener noreferrer'}
          className='group flex items-start gap-4 rounded-xl bg-slate-900 p-3 ring-1 ring-slate-800 transition-all hover:bg-slate-900/80 hover:ring-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          {/* Thumbnail */}
          <div className='relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-slate-800'>
            <Image
              src={ep.thumbnail}
              alt={ep.title}
              fill
              sizes='128px'
              className='object-cover transition-transform duration-200 group-hover:scale-105'
              unoptimized
            />
            <div className='absolute inset-0 flex items-center justify-center bg-slate-950/0 transition-colors group-hover:bg-slate-950/30'>
              <div className='rounded-full bg-white/0 p-2 transition-all group-hover:bg-white/20'>
                {ep.isEmbeddable ? (
                  <Play className='h-5 w-5 fill-white text-white opacity-0 transition-opacity group-hover:opacity-100' />
                ) : (
                  <ExternalLink className='h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100' />
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className='min-w-0 flex-1 pt-0.5'>
            {/* Episode number */}
            <p className='mb-0.5 text-xs font-medium text-slate-500'>
              Episode {ep.episodeNumber ?? index + 1}
            </p>
            <p className='line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-cyan-300'>
              {ep.title}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              {ep.duration}
              {!ep.isEmbeddable && (
                <span className='ml-2 text-slate-600'>· Opens on {ep.sourceName}</span>
              )}
            </p>
            {ep.description && (
              <p className='mt-1.5 line-clamp-2 text-xs text-slate-400'>
                {ep.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
