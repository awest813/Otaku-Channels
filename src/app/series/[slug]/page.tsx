import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAnime, getAnimeEpisodes } from '@/lib/backend';

import {
  getEpisodesBySeries,
  getRelatedSeries,
  getSeriesBySlug,
} from '@/data/mockData';

import SeriesClient from './SeriesClient';

import type { AnimeSeries, Episode } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Try backend first for metadata; fall back to mock
  try {
    const result = await getAnime(slug);
    const series = result.data as AnimeSeries;
    return {
      title: `${series.title} — Anime TV`,
      description: series.description,
    };
  } catch {
    const series = getSeriesBySlug(slug);
    if (!series) return { title: 'Not Found' };
    return {
      title: `${series.title} — Anime TV`,
      description: series.description,
    };
  }
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params;

  let series: AnimeSeries | undefined;
  let episodes: Episode[] = [];
  let related: AnimeSeries[] = [];

  try {
    const [seriesResult, episodesResult] = await Promise.all([
      getAnime(slug),
      getAnimeEpisodes(slug),
    ]);
    series = seriesResult.data as AnimeSeries;
    episodes = episodesResult.data as Episode[];
    related = getRelatedSeries(series);
  } catch {
    // Backend unavailable or 404 — fall back to mock data
    series = getSeriesBySlug(slug);
    if (series) {
      episodes = getEpisodesBySeries(slug);
      related = getRelatedSeries(series);
    }
  }

  if (!series) notFound();

  return <SeriesClient series={series} episodes={episodes} related={related} />;
}
