'use client';

import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ExternalLink,
  Languages,
  Play,
  Shield,
  Star,
  Tv2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useWatchlist } from '@/hooks/useWatchlist';

import EpisodeList from '@/components/media/EpisodeList';
import MediaRail from '@/components/media/MediaRail';
import GenrePill from '@/components/ui/GenrePill';
import SourceBadge from '@/components/ui/SourceBadge';
import { useToast } from '@/components/ui/Toast';

import type { AnimeSeries, Episode, LanguageOption, Movie } from '@/types';

interface Props {
  series: AnimeSeries;
  episodes: Episode[];
  related: AnimeSeries[];
}

type LangFilter = 'all' | 'sub' | 'dub';

/** Streaming platform badge colours */
const PLATFORM_COLORS: Record<string, string> = {
  Crunchyroll: 'bg-orange-600/20 text-orange-300 ring-orange-700/40',
  Funimation: 'bg-purple-600/20 text-purple-300 ring-purple-700/40',
  Netflix: 'bg-red-700/20 text-red-300 ring-red-800/40',
  HIDIVE: 'bg-blue-600/20 text-blue-300 ring-blue-700/40',
  Tubi: 'bg-yellow-600/20 text-yellow-300 ring-yellow-700/40',
  'Amazon Prime Video': 'bg-sky-600/20 text-sky-300 ring-sky-700/40',
};

export default function SeriesClient({ series, episodes, related }: Props) {
  const { isInList, toggle } = useWatchlist();
  const { show: showToast } = useToast();
  const { trackView } = useRecentlyViewed();
  const {
    trackViewedTitle,
    trackAddedWatchlist,
    trackStartedWatch,
    trackClickedExternal,
  } = useAnalytics();
  const inList = isInList(series.id);

  // Track view on mount
  React.useEffect(() => {
    trackView({
      id: series.id,
      slug: series.slug,
      title: series.title,
      thumbnail: series.thumbnail,
      sourceType: series.sourceType,
      releaseYear: series.releaseYear,
    });
    trackViewedTitle(series.id);
  }, [series, trackView, trackViewedTitle]);

  const handleWatchlist = () => {
    const added = toggle({
      id: series.id,
      slug: series.slug,
      title: series.title,
      thumbnail: series.thumbnail,
      sourceType: series.sourceType,
      releaseYear: series.releaseYear,
    });
    showToast(
      added ? `Added "${series.title}" to My List` : `Removed from My List`,
      added ? 'success' : 'info'
    );
    if (added) trackAddedWatchlist(series.id);
  };

  const [langFilter, setLangFilter] = React.useState<LangFilter>('all');

  const episodeCount =
    'episodeCount' in series ? (series.episodeCount as number) : null;

  // Determine whether the filter should be shown (series offers both sub and dub)
  const hasSubDubChoice =
    series.language === 'both' ||
    (episodes.some((ep) => ep.language === 'sub') &&
      episodes.some((ep) => ep.language === 'dub'));

  // Derive per-episode language falling back to the series-level language
  function resolveEpLang(ep: Episode): LanguageOption {
    return ep.language ?? (series.language === 'both' ? 'sub' : series.language);
  }

  const filteredEpisodes =
    langFilter === 'all'
      ? episodes
      : episodes.filter((ep) => resolveEpLang(ep) === langFilter);

  const isJikan = series.sourceType === 'jikan';
  const hasTrailer = !!series.trailerEmbedUrl;
  const streamingLinks = series.streamingLinks ?? [];

  // Determine the watch CTA
  const canEmbedTrailer = hasTrailer;
  const watchHref = canEmbedTrailer
    ? `/watch/jikan/${series.malId ?? series.id.replace('jikan-', '')}`
    : null;

  return (
    <div>
      {/* Hero */}
      <div className='relative h-[320px] overflow-hidden md:h-[420px]'>
        <Image
          src={series.heroImage || series.thumbnail}
          alt={series.title}
          fill
          sizes='100vw'
          className='object-cover object-top'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent' />
        <div className='absolute inset-0 bg-gradient-to-r from-slate-950/40 to-transparent' />
      </div>

      <div className='mx-auto max-w-screen-xl px-4 py-6'>
        {/* Back navigation */}
        <Link
          href='/browse'
          className='mb-6 inline-flex items-center gap-1.5 rounded text-sm text-slate-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Browse
        </Link>

        {/* Main layout */}
        <div className='flex flex-col gap-8 md:flex-row md:items-start md:gap-10'>
          {/* Poster */}
          <div className='hidden shrink-0 md:block md:w-48 lg:w-56'>
            <div className='relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl ring-1 ring-slate-800'>
              <Image
                src={series.thumbnail}
                alt={series.title}
                fill
                sizes='224px'
                className='object-cover'
              />
            </div>
          </div>

          {/* Info */}
          <div className='flex-1 space-y-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <SourceBadge sourceType={series.sourceType} />
              <span className='rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium uppercase text-slate-400'>
                {series.language}
              </span>
              {isJikan && (
                <span className='rounded-md bg-violet-900/40 px-2 py-0.5 text-xs font-medium text-violet-300 ring-1 ring-violet-700/50'>
                  MyAnimeList
                </span>
              )}
            </div>

            <h1 className='text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl'>
              {series.title}
            </h1>

            <div className='flex flex-wrap items-center gap-4 text-sm text-slate-400'>
              {series.releaseYear > 0 && (
                <span className='flex items-center gap-1.5'>
                  <Calendar className='h-4 w-4' />
                  {series.releaseYear}
                </span>
              )}
              {episodeCount != null && episodeCount > 0 && (
                <span className='flex items-center gap-1.5'>
                  <Tv2 className='h-4 w-4' />
                  {episodeCount} Episodes
                </span>
              )}
              <span className='flex items-center gap-1.5'>
                <Languages className='h-4 w-4' />
                {series.language === 'sub'
                  ? 'Subtitled'
                  : series.language === 'dub'
                  ? 'Dubbed'
                  : 'Sub & Dub'}
              </span>
            </div>

            <div className='flex flex-wrap gap-2'>
              {series.genres.map((g) => (
                <GenrePill
                  key={g}
                  genre={g}
                  href={`/browse?genre=${encodeURIComponent(g)}`}
                />
              ))}
            </div>

            <p className='max-w-2xl leading-relaxed text-slate-300'>
              {series.description}
            </p>

            {/* CTAs */}
            <div className='flex flex-wrap gap-3'>
              {watchHref ? (
                <Link
                  href={watchHref}
                  onClick={() => trackStartedWatch(series.id, undefined, series.sourceType)}
                  className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <Play className='h-4 w-4 fill-slate-950' /> Watch Trailer
                </Link>
              ) : series.isEmbeddable ? (
                <Link
                  href={`/watch/youtube/${series.id}`}
                  onClick={() => trackStartedWatch(series.id, undefined, series.sourceType)}
                  className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <Play className='h-4 w-4 fill-slate-950' /> Watch Now
                </Link>
              ) : (
                <a
                  href={series.watchUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={() => trackClickedExternal(series.id, series.sourceType)}
                  className='flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
                >
                  <ExternalLink className='h-4 w-4' /> Watch on{' '}
                  {series.sourceName}
                </a>
              )}
              <button
                onClick={handleWatchlist}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  inList
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
                )}
              >
                {inList ? (
                  <>
                    <BookmarkCheck className='h-4 w-4' /> In My List
                  </>
                ) : (
                  <>
                    <Bookmark className='h-4 w-4' /> Add to My List
                  </>
                )}
              </button>
            </div>

            {/* Streaming platform links (from Jikan) */}
            {streamingLinks.length > 0 && (
              <div className='space-y-2'>
                <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                  Available on
                </p>
                <div className='flex flex-wrap gap-2'>
                  {streamingLinks.map((link) => {
                    const colorClass =
                      PLATFORM_COLORS[link.name] ??
                      'bg-slate-800/60 text-slate-300 ring-slate-700/40';
                    return (
                      <a
                        key={link.name}
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={() => trackClickedExternal(series.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                          colorClass
                        )}
                      >
                        <Star className='h-3 w-3' />
                        {link.name}
                        <ExternalLink className='h-3 w-3 opacity-60' />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Source trust panel */}
            <div className='flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4'>
              <Shield className='mt-0.5 h-4 w-4 shrink-0 text-green-400' />
              <div>
                <p className='text-xs font-semibold text-slate-300'>
                  {isJikan
                    ? 'Data from MyAnimeList via Jikan API'
                    : `Official source: ${series.sourceName}`}
                </p>
                <p className='mt-0.5 text-xs text-slate-500'>
                  Anime TV links to officially licensed content only. No video
                  is hosted or proxied by this site.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {episodes.length > 0 && (
          <div className='mt-12 space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <h2 className='text-xl font-bold text-white'>
                Episodes{' '}
                <span className='text-base font-normal text-slate-500'>
                  ({filteredEpisodes.length}
                  {langFilter !== 'all' && ` of ${episodes.length}`})
                </span>
              </h2>

              {/* Sub / Dub language filter */}
              {hasSubDubChoice && (
                <div
                  className='flex items-center gap-1 rounded-lg bg-slate-900 p-1 ring-1 ring-slate-800'
                  role='group'
                  aria-label='Language filter'
                >
                  {(['all', 'sub', 'dub'] as LangFilter[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLangFilter(opt)}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                        langFilter === opt
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      )}
                      aria-pressed={langFilter === opt}
                    >
                      {opt === 'all' ? 'All' : opt === 'sub' ? 'Sub' : 'Dub'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isJikan && (
              <p className='text-xs text-slate-500'>
                Episode list from MyAnimeList. Click an episode to open it on
                the official streaming platform.
              </p>
            )}
            <EpisodeList episodes={filteredEpisodes} seriesSlug={series.slug} />
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className='mt-12'>
            <MediaRail
              title='More Like This'
              items={related as Array<AnimeSeries | Movie>}
              description={`Because you viewed ${series.title}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
