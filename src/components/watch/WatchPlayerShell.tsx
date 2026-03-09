import { ExternalLink, Tv } from 'lucide-react';

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
  const embedUrl = isEmbeddable ? getYouTubeEmbedUrl(watchUrl) : null;

  return (
    <div className='overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800 shadow-2xl shadow-slate-950/50'>
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
                This title plays on {sourceName}&apos;s platform. It opens in a new
                tab.
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
  );
}
