export type LanguageOption = 'sub' | 'dub' | 'both';
export type ContentType = 'series' | 'movie' | 'live' | 'episode';
export type SourceType =
  | 'youtube'
  | 'retro'
  | 'freestream'
  | 'live'
  | 'tubi'
  | 'pluto'
  | 'retrocrush'
  | 'crunchyroll';

export interface Genre {
  id: string;
  name: string;
}

export interface SourceProvider {
  id: string;
  name: string;
  type: SourceType;
  logoUrl?: string;
  baseUrl: string;
}

export interface AnimeSeries {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  type: 'series';
  genres: string[];
  language: LanguageOption;
  sourceName: string;
  sourceType: SourceType;
  isEmbeddable: boolean;
  watchUrl: string;
  releaseYear: number;
  episodeCount: number;
  tags: string[];
}

export interface Movie {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  type: 'movie';
  genres: string[];
  language: LanguageOption;
  sourceName: string;
  sourceType: SourceType;
  isEmbeddable: boolean;
  watchUrl: string;
  releaseYear: number;
  tags: string[];
}

export interface Episode {
  id: string;
  seriesSlug: string;
  title: string;
  description: string;
  thumbnail: string;
  episodeNumber: number;
  seasonNumber: number;
  duration: string;
  watchUrl: string;
  isEmbeddable: boolean;
  sourceName: string;
}

export interface LiveChannel {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail: string;
  channelNumber: string;
  sourceName: string;
  sourceType: SourceType;
  isEmbeddable: boolean;
  watchUrl: string;
  tags: string[];
  nowPlaying: string;
  nextUp?: string;
}

export type ContentCardItem = AnimeSeries | Movie | LiveChannel;
