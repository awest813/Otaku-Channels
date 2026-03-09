import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  getEpisodesBySeries,
  getRelatedSeries,
  getSeriesBySlug,
} from '@/data/mockData';

import SeriesClient from './SeriesClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) return { title: 'Not Found' };
  return {
    title: `${series.title} — Anime TV`,
    description: series.description,
  };
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;
  const series = getSeriesBySlug(slug);
  if (!series) notFound();

  const episodes = getEpisodesBySeries(slug);
  const related = getRelatedSeries(series);

  return (
    <SeriesClient series={series} episodes={episodes} related={related} />
  );
}
