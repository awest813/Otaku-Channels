import type { Metadata } from 'next';

import { listAnime, listChannels } from '@/lib/backend';

import { mockLiveChannels, mockMovies, mockSeries } from '@/data/mockData';

import BecauseYouWatchedRail from '@/components/media/BecauseYouWatchedRail';
import HeroBanner from '@/components/media/HeroBanner';
import LiveChannelCard from '@/components/media/LiveChannelCard';
import MediaRail from '@/components/media/MediaRail';
import RecentlyViewedRail from '@/components/media/RecentlyViewedRail';
import SectionHeader from '@/components/ui/SectionHeader';

import type { AnimeSeries, LiveChannel, Movie } from '@/types';

export const metadata: Metadata = {
  title: 'Anime TV — Free Official Anime',
  description:
    'Discover and watch officially licensed free anime from YouTube, Tubi, Crunchyroll, RetroCrush, and more.',
};

/** Classify an anime into a broad era by release year. */
const ERA_CLASSIC_MAX = 2000;
const ERA_MODERN_MIN = 2010;

export default async function HomePage() {
  // Try backend first; gracefully fall back to mock data if unavailable.
  let allSeries: AnimeSeries[] = mockSeries;
  let allMovies: Movie[] = mockMovies;
  let allChannels: LiveChannel[] = mockLiveChannels;

  try {
    const [seriesResult, moviesResult, channelsResult] = await Promise.all([
      listAnime({ limit: 200 }),
      listAnime({ type: 'MOVIE', limit: 100 }),
      listChannels(),
    ]);
    if (seriesResult.data.length > 0)
      allSeries = seriesResult.data as AnimeSeries[];
    if (moviesResult.data.length > 0) allMovies = moviesResult.data as Movie[];
    if (channelsResult.data.length > 0) allChannels = channelsResult.data;
  } catch {
    // Backend unavailable — mock data used as fallback (already set above)
  }

  const hero = allSeries[0];
  const trending = allSeries.filter((s) => s.tags?.includes('Trending'));
  const youtube = allSeries.filter((s) => s.sourceType === 'youtube');
  const retro = allSeries.filter(
    (s) => s.sourceType === 'retro' || s.sourceType === 'retrocrush'
  );
  const tubi = allSeries.filter((s) => s.sourceType === 'tubi');
  const crunchyroll = allSeries.filter((s) => s.sourceType === 'crunchyroll');
  const dubbed = allSeries.filter(
    (s) => s.language === 'dub' || s.language === 'both'
  );
  const movies = allMovies;

  // Era rails
  const classicAnime = allSeries.filter(
    (s) => s.releaseYear > 0 && s.releaseYear <= ERA_CLASSIC_MAX
  );
  const modernAnime = allSeries.filter((s) => s.releaseYear >= ERA_MODERN_MIN);

  // Free to stream now — titles that are directly embeddable (no redirect needed)
  const freeNow = allSeries.filter((s) => s.isEmbeddable);

  // Leaving soon — titles that have an upcoming availability end date
  const now = Date.now();
  const soonMs = 30 * 24 * 60 * 60 * 1000; // 30 days
  const leavingSoon = [...allSeries, ...allMovies].filter((item) => {
    if (!item.availability?.length) return false;
    return item.availability.some((w) => {
      if (!w.endsAt) return false;
      const endsAt = new Date(w.endsAt).getTime();
      return endsAt > now && endsAt - now <= soonMs;
    });
  });

  return (
    <>
      <HeroBanner series={hero} />

      <div className='mx-auto max-w-screen-xl space-y-12 px-4 py-10'>
        {/* Continue Watching — client-side, renders only if localStorage has data */}
        <RecentlyViewedRail />

        {/* Because You Watched — personalised recommendation rail */}
        <BecauseYouWatchedRail />

        {/* Trending */}
        {trending.length > 0 && (
          <MediaRail
            title='Trending Free Anime'
            description='Most popular officially licensed titles right now'
            items={trending}
            seeAllHref='/browse'
          />
        )}

        {/* Free to Stream Now */}
        {freeNow.length > 0 && (
          <MediaRail
            title='Free to Stream Now'
            description='Watch instantly — no subscription required'
            items={freeNow}
            seeAllHref='/browse'
          />
        )}

        {/* Leaving Soon */}
        {leavingSoon.length > 0 && (
          <MediaRail
            title='Leaving Soon'
            description='Catch these before they go — availability ending in 30 days'
            items={leavingSoon as AnimeSeries[]}
            seeAllHref='/browse'
          />
        )}

        {/* YouTube Official */}
        {youtube.length > 0 && (
          <MediaRail
            title='Official on YouTube'
            description='Full series legally free on YouTube'
            items={youtube}
            seeAllHref='/browse?source=youtube'
          />
        )}

        {/* Tubi */}
        {tubi.length > 0 && (
          <MediaRail
            title='Free on Tubi'
            description='Ad-supported free streaming'
            items={tubi}
            seeAllHref='/browse?source=tubi'
          />
        )}

        {/* Crunchyroll free tier */}
        {crunchyroll.length > 0 && (
          <MediaRail
            title='Free on Crunchyroll'
            description="Available on Crunchyroll's free tier"
            items={crunchyroll}
            seeAllHref='/browse?source=crunchyroll'
          />
        )}

        {/* Retro */}
        {retro.length > 0 && (
          <MediaRail
            title='Retro Anime'
            description='Classic series from RetroCrush and Retro Channel'
            items={retro}
            seeAllHref='/browse'
          />
        )}

        {/* Classic era (≤ 2000) */}
        {classicAnime.length > 0 && (
          <MediaRail
            title='Classic Anime'
            description='Timeless titles from the golden age of anime'
            items={classicAnime}
            seeAllHref='/browse'
          />
        )}

        {/* Modern era (≥ 2010) */}
        {modernAnime.length > 0 && (
          <MediaRail
            title='Modern Picks'
            description='Stand-out series from the last decade'
            items={modernAnime}
            seeAllHref='/browse'
          />
        )}

        {/* Dubbed picks */}
        {dubbed.length > 0 && (
          <MediaRail
            title='English Dubbed'
            description='Anime available with English dub'
            items={dubbed.slice(0, 8)}
            seeAllHref='/browse?language=dub'
          />
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <MediaRail
            title='Anime Movies'
            description='Feature films available free'
            items={movies as Array<AnimeSeries | Movie>}
            seeAllHref='/browse?type=movie'
          />
        )}

        {/* Live Channels */}
        <section className='space-y-4'>
          <SectionHeader
            title='Live Channels'
            href='/live'
            description='Free 24/7 anime streaming channels'
          />
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
            {allChannels.map((ch) => (
              <LiveChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
