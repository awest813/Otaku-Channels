import SectionHeader from '@/components/ui/SectionHeader';

import MediaCard from './MediaCard';

import type { AnimeSeries, Movie } from '@/types';

interface Props {
  title: string;
  items: Array<AnimeSeries | Movie>;
  seeAllHref?: string;
}

export default function MediaRail({ title, items, seeAllHref }: Props) {
  return (
    <section className='space-y-3'>
      <SectionHeader title={title} href={seeAllHref} />
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
