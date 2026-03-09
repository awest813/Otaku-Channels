import type { Metadata } from 'next';

import { listAnime, listChannels } from '@/lib/backend';

import { mockLiveChannels, mockMovies, mockSeries } from '@/data/mockData';

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
    if (channelsResult.data.length > 0)
      allChannels = channelsResult.data as LiveChannel[];
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

  return (
    <>
      <HeroBanner series={hero} />

      <div className='mx-auto max-w-screen-xl space-y-12 px-4 py-10'>
        {/* Continue Watching — client-side, renders only if localStorage has data */}
        <RecentlyViewedRail />

        {/* Trending */}
        {trending.length > 0 && (
          <MediaRail
            title='Trending Free Anime'
            description='Most popular officially licensed titles right now'
            items={trending}
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
