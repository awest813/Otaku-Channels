'use client';

import { ExternalLink, Play, SkipForward, Star, Tv, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

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

/** Countdown duration in seconds before auto-navigating to the next episode. */
const AUTOPLAY_COUNTDOWN_SEC = 15;

/**
 * How many milliseconds after mount to begin the autoplay countdown.
 * Approximates a 24-minute episode; embeddable trailers use a shorter window.
 */
const AUTOPLAY_DELAY_MS = 24 * 60 * 1000; // 24 min

interface NextEpisodeInfo {
  id: string;
  title: string;
  episodeNumber: number;
  watchUrl: string;
  isEmbeddable: boolean;
  seriesSlug: string;
}

interface Props {
  isEmbeddable: boolean;
  watchUrl: string;
  sourceName: string;
  /** YouTube trailer embed URL (from Jikan/external). Overrides watchUrl embed logic. */
  trailerEmbedUrl?: string;
  /** Streaming service links to show below the player (from Jikan). */
  streamingLinks?: Array<{ name: string; url: string }>;
  /** Next episode info for autoplay UI. */
  nextEpisode?: NextEpisodeInfo;
  /** Current episode number (1-based), used for display only. */
  currentEpisodeNumber?: number | null;
}

export default function WatchPlayerShell({
  isEmbeddable,
  watchUrl,
  sourceName,
  trailerEmbedUrl,
  streamingLinks = [],
  nextEpisode,
  currentEpisodeNumber,
}: Props) {
  const router = useRouter();

  // ── Autoplay state ────────────────────────────────────────────────────────
  const [autoplayEnabled, setAutoplayEnabled] = React.useState(true);
  const [showCountdown, setShowCountdown] = React.useState(false);
  const [countdown, setCountdown] = React.useState(AUTOPLAY_COUNTDOWN_SEC);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const delayRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextEpisodeHref = nextEpisode
    ? nextEpisode.isEmbeddable
      ? `/watch/youtube/${nextEpisode.id}?series=${nextEpisode.seriesSlug}&ep=${nextEpisode.episodeNumber}`
      : nextEpisode.watchUrl
    : null;

  const navigateToNext = React.useCallback(() => {
    if (!nextEpisodeHref) return;
    if (nextEpisode?.isEmbeddable) {
      router.push(nextEpisodeHref);
    } else {
      window.open(nextEpisodeHref, '_blank', 'noopener,noreferrer');
    }
  }, [nextEpisodeHref, nextEpisode, router]);

  // Start countdown overlay
  const startCountdown = React.useCallback(() => {
    setShowCountdown(true);
    setCountdown(AUTOPLAY_COUNTDOWN_SEC);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const cancelCountdown = React.useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (delayRef.current) clearTimeout(delayRef.current);
    setShowCountdown(false);
    setCountdown(AUTOPLAY_COUNTDOWN_SEC);
  }, []);

  // Navigate when countdown hits 0
  React.useEffect(() => {
    if (countdown === 0 && showCountdown) {
      navigateToNext();
    }
  }, [countdown, showCountdown, navigateToNext]);

  // Schedule the autoplay delay when there is a next episode and autoplay is on
  React.useEffect(() => {
    if (!nextEpisode || !autoplayEnabled || !isEmbeddable) return;

    delayRef.current = setTimeout(() => {
      startCountdown();
    }, AUTOPLAY_DELAY_MS);

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextEpisode?.id, autoplayEnabled, isEmbeddable]);

  // Priority: trailerEmbedUrl → YouTube embed from watchUrl → fallback
  const embedUrl =
    trailerEmbedUrl ?? (isEmbeddable ? getYouTubeEmbedUrl(watchUrl) : null);

  return (
    <div className='space-y-4'>
      {/* Player */}
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
                  This content is hosted by {sourceName}. It opens in a new tab.
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

          {/* Autoplay countdown overlay */}
          {showCountdown && nextEpisode && (
            <div className='absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/90 to-transparent p-5'>
              <div className='w-full max-w-xs rounded-xl bg-slate-900/95 p-4 ring-1 ring-slate-700 backdrop-blur-sm'>
                <div className='mb-3 flex items-start justify-between gap-2'>
                  <div>
                    <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                      Up Next — Episode {nextEpisode.episodeNumber}
                    </p>
                    <p className='mt-0.5 line-clamp-2 text-sm font-semibold text-white'>
                      {nextEpisode.title}
                    </p>
                  </div>
                  <button
                    onClick={cancelCountdown}
                    aria-label='Cancel autoplay'
                    className='shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={navigateToNext}
                    className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                  >
                    <Play className='h-3.5 w-3.5 fill-slate-950' />
                    Play Now
                  </button>
                  <span
                    className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold tabular-nums text-slate-300 ring-1 ring-slate-700'
                    aria-live='polite'
                    aria-label={`Autoplaying in ${countdown} seconds`}
                  >
                    {countdown}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attribution notice for embedded content */}
      {embedUrl && (
        <p className='text-center text-xs text-slate-600'>
          Embedded playback via {sourceName}. No content is hosted on this site.
        </p>
      )}

      {/* ── Next episode bar ─────────────────────────────────────────────── */}
      {nextEpisode && (
        <div className='flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3'>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
              {currentEpisodeNumber != null
                ? `Episode ${currentEpisodeNumber} • `
                : ''}
              Up Next: Episode {nextEpisode.episodeNumber}
            </p>
            <p className='mt-0.5 truncate text-sm font-medium text-white'>
              {nextEpisode.title}
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {/* Autoplay toggle */}
            <button
              onClick={() => {
                if (autoplayEnabled) {
                  cancelCountdown();
                  setAutoplayEnabled(false);
                } else {
                  setAutoplayEnabled(true);
                }
              }}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                autoplayEnabled
                  ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-500/25'
                  : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700 hover:text-white'
              )}
              aria-pressed={autoplayEnabled}
            >
              Autoplay {autoplayEnabled ? 'On' : 'Off'}
            </button>

            {/* Play next button */}
            {nextEpisode.isEmbeddable ? (
              <button
                onClick={navigateToNext}
                className='flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white ring-1 ring-slate-700 transition-all hover:bg-slate-700 hover:ring-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <SkipForward className='h-4 w-4' />
                Next
              </button>
            ) : (
              <a
                href={nextEpisode.watchUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white ring-1 ring-slate-700 transition-all hover:bg-slate-700 hover:ring-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
              >
                <ExternalLink className='h-4 w-4' />
                Next
              </a>
            )}
          </div>
        </div>
      )}

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
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                    colorClass
                  )}
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
