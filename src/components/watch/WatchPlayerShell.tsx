import { ExternalLink, Star, Tv } from 'lucide-react';

/** Extract a YouTube embed URL from a watch URL, or return null. */
function getYouTubeEmbedUrl(watchUrl: string): string | null {
  try {
    const url = new URL(watchUrl);
    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.slice(1);
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    // invalid URL — fall through
  }
  return null;
}

/** Streaming platform badge colours */
const PLATFORM_COLORS: Record<string, string> = {
  Crunchyroll:
    'bg-orange-600/20 text-orange-300 ring-orange-700/40 hover:bg-orange-600/30',
  Funimation:
    'bg-purple-600/20 text-purple-300 ring-purple-700/40 hover:bg-purple-600/30',
  Netflix: 'bg-red-700/20 text-red-300 ring-red-800/40 hover:bg-red-700/30',
  HIDIVE: 'bg-blue-600/20 text-blue-300 ring-blue-700/40 hover:bg-blue-600/30',
  Tubi: 'bg-yellow-600/20 text-yellow-300 ring-yellow-700/40 hover:bg-yellow-600/30',
  'Amazon Prime Video':
    'bg-sky-600/20 text-sky-300 ring-sky-700/40 hover:bg-sky-600/30',
};

interface Props {
  isEmbeddable: boolean;
  watchUrl: string;
  sourceName: string;
  /** YouTube trailer embed URL (from Jikan/external). Overrides watchUrl embed logic. */
  trailerEmbedUrl?: string;
  /** Streaming service links to show below the player (from Jikan). */
  streamingLinks?: Array<{ name: string; url: string }>;
}

export default function WatchPlayerShell({
  isEmbeddable,
  watchUrl,
  sourceName,
  trailerEmbedUrl,
  streamingLinks = [],
}: Props) {
  // Priority: trailerEmbedUrl → YouTube embed from watchUrl → fallback
  const embedUrl =
    trailerEmbedUrl ?? (isEmbeddable ? getYouTubeEmbedUrl(watchUrl) : null);

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-slate-950/50 ring-1 ring-slate-800'>
        <div className='relative aspect-video w-full bg-slate-950'>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Watch on ${sourceName}`}
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
              className='absolute inset-0 h-full w-full border-0'
            />
          ) : isEmbeddable ? (
            /* Embeddable flag set but no embed URL — fall back gracefully */
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center'>
              <div className='rounded-full bg-slate-800 p-4'>
                <Tv className='h-8 w-8 text-slate-500' />
              </div>
              <div>
                <p className='font-semibold text-white'>
                  Stream on {sourceName}
                </p>
                <p className='mt-1 text-sm text-slate-400'>
                  Click below to open the official watch page
                </p>
              </div>
              <a
                href={watchUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <ExternalLink className='h-4 w-4' />
                Open on {sourceName}
              </a>
            </div>
          ) : (
            /* Not embeddable — external redirect */
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center'>
              <div className='rounded-full bg-slate-800 p-4'>
                <ExternalLink className='h-8 w-8 text-slate-500' />
              </div>
              <div>
                <p className='font-semibold text-white'>
                  Available on {sourceName}
                </p>
                <p className='mt-1 text-sm text-slate-400'>
                  This title plays on {sourceName}&apos;s platform. It opens in
                  a new tab.
                </p>
              </div>
              <a
                href={watchUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <ExternalLink className='h-4 w-4' />
                Watch on {sourceName}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Streaming platform links */}
      {streamingLinks.length > 0 && (
        <div className='rounded-xl border border-slate-800 bg-slate-900/60 p-4'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500'>
            Watch Full Episodes On
          </p>
          <div className='flex flex-wrap gap-2'>
            {streamingLinks.map((link) => {
              const colorClass =
                PLATFORM_COLORS[link.name] ??
                'bg-slate-800/60 text-slate-300 ring-slate-700/40 hover:bg-slate-800';
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${colorClass}`}
                >
                  <Star className='h-3.5 w-3.5' />
                  {link.name}
                  <ExternalLink className='h-3.5 w-3.5 opacity-60' />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
