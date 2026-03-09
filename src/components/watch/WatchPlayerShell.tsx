import { ExternalLink, Play } from 'lucide-react';

interface Props {
  isEmbeddable: boolean;
  watchUrl: string;
  sourceName: string;
}

export default function WatchPlayerShell({
  isEmbeddable,
  watchUrl,
  sourceName,
}: Props) {
  return (
    <div className='overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-800'>
      <div className='relative aspect-video w-full bg-slate-950'>
        {isEmbeddable ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700'>
              <Play className='h-7 w-7 text-cyan-400' />
            </div>
            <p className='text-sm'>Embedded player placeholder</p>
            <a
              href={watchUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400'
            >
              <ExternalLink className='h-4 w-4' />
              Open on {sourceName}
            </a>
          </div>
        ) : (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400'>
            <ExternalLink className='h-12 w-12 text-slate-600' />
            <p className='text-center text-sm'>
              This title plays on{' '}
              <span className='font-semibold text-white'>{sourceName}</span>
            </p>
            <a
              href={watchUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 rounded-md bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400'
            >
              <ExternalLink className='h-4 w-4' />
              Watch on {sourceName}
            </a>
          </div>
        )}
      </div>
      <div className='border-t border-slate-800 px-4 py-3'>
        <p className='text-xs text-slate-500'>
          {isEmbeddable
            ? `Embedded playback via ${sourceName}. No content is hosted or proxied by Anime TV.`
            : `This content is hosted by ${sourceName}. Clicking opens the official watch page in a new tab.`}
        </p>
      </div>
    </div>
  );
}
