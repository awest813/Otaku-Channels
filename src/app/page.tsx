import type { Metadata } from 'next';

import { mockLiveChannels, mockMovies, mockSeries } from '@/data/mockData';

import HeroBanner from '@/components/media/HeroBanner';
import LiveChannelCard from '@/components/media/LiveChannelCard';
import MediaRail from '@/components/media/MediaRail';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata: Metadata = {
  title: 'Anime TV — Free Official Anime',
};

export default function HomePage() {
  const hero = mockSeries[0];
  const trending = mockSeries.filter((s) => s.tags.includes('Trending'));
  const youtube = mockSeries.filter((s) => s.sourceType === 'youtube');
  const retro = mockSeries.filter((s) => s.sourceType === 'retro');
  const dubbed = mockSeries.filter(
    (s) => s.language === 'dub' || s.language === 'both'
  );
  const movies = mockMovies;

  return (
    <>
      <HeroBanner series={hero} />
      <div className='mx-auto max-w-screen-xl space-y-10 px-4 py-10'>
        <MediaRail
          title='Trending Free Anime'
          items={trending}
          seeAllHref='/browse'
        />
        <MediaRail
          title='Official YouTube Anime'
          items={youtube}
          seeAllHref='/browse?source=youtube'
        />
        <MediaRail
          title='Retro Anime'
          items={retro}
          seeAllHref='/browse?source=retro'
        />
        <MediaRail
          title='Dubbed Picks'
          items={dubbed.slice(0, 6)}
          seeAllHref='/browse?language=dub'
        />
        <MediaRail
          title='Movies'
          items={
            movies as Array<
              import('@/types').AnimeSeries | import('@/types').Movie
            >
          }
          seeAllHref='/browse?type=movie'
        />

        <section className='space-y-3'>
          <SectionHeader title='Live Channels' href='/live' />
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'>
            {mockLiveChannels.map((ch) => (
              <LiveChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
