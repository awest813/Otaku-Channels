import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAnime, getAnimeEpisodes } from '@/lib/backend';
import { getJikanAnime, getJikanEpisodes, jikanToSeries } from '@/lib/jikan';

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

/** Extract MAL ID if this is a Jikan-sourced slug (e.g. "jikan-20"). */
function parseJikanSlug(slug: string): number | null {
  if (!slug.startsWith('jikan-')) return null;
  const id = Number(slug.replace('jikan-', ''));
  return isNaN(id) ? null : id;
}

/** Map a Jikan episode list to our Episode type. */
function mapJikanEpisodes(
  malId: number,
  jikanEps: Array<{
    mal_id: number;
    title: string;
    title_romanji: string | null;
    aired: string | null;
    score: number | null;
    filler: boolean;
    recap: boolean;
  }>,
  thumbnail: string,
  watchUrl: string,
  sourceName: string
): Episode[] {
  return jikanEps.map((ep) => ({
    id: `jikan-ep-${malId}-${ep.mal_id}`,
    seriesSlug: `jikan-${malId}`,
    title: ep.title || ep.title_romanji || `Episode ${ep.mal_id}`,
    description: ep.filler ? 'Filler episode' : ep.recap ? 'Recap episode' : '',
    thumbnail,
    episodeNumber: ep.mal_id,
    seasonNumber: 1,
    duration: '~24 min',
    watchUrl,
    isEmbeddable: false,
    sourceName,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const jikanId = parseJikanSlug(slug);
  if (jikanId) {
    try {
      const result = await getJikanAnime(jikanId);
      const series = jikanToSeries(result.data);
      return {
        title: `${series.title} — Anime TV`,
        description: series.description,
      };
    } catch {
      return { title: 'Anime — Anime TV' };
    }
  }

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

  const jikanId = parseJikanSlug(slug);

  if (jikanId) {
    try {
      const [animeResult, episodesResult] = await Promise.all([
        getJikanAnime(jikanId),
        getJikanEpisodes(jikanId, 1).catch(() => ({
          data: [],
          pagination: { last_visible_page: 1, has_next_page: false },
        })),
      ]);

      series = jikanToSeries(animeResult.data);

      const streaming = animeResult.data.streaming ?? [];
      const cr = streaming.find((s) => s.name === 'Crunchyroll');
      const watchUrl = cr?.url ?? animeResult.data.url;
      const sourceName = cr ? 'Crunchyroll' : 'MyAnimeList';
      const thumbnail = animeResult.data.images?.jpg?.image_url ?? '';

      episodes = mapJikanEpisodes(
        jikanId,
        episodesResult.data ?? [],
        thumbnail,
        watchUrl,
        sourceName
      );
    } catch {
      // fall through to notFound
    }

    if (!series) notFound();
    return (
      <SeriesClient series={series} episodes={episodes} related={related} />
    );
  }

  // Regular slug — try backend then mock
  try {
    const [seriesResult, episodesResult] = await Promise.all([
      getAnime(slug),
      getAnimeEpisodes(slug),
    ]);
    series = seriesResult.data as AnimeSeries;
    episodes = episodesResult.data as Episode[];
    related = getRelatedSeries(series);
  } catch {
    series = getSeriesBySlug(slug);
    if (series) {
      episodes = getEpisodesBySeries(slug);
      related = getRelatedSeries(series);
    }
  }

  if (!series) notFound();

  return <SeriesClient series={series} episodes={episodes} related={related} />;
}
