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
  | 'crunchyroll'
  | 'consumet'
  | 'jikan';

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
  /** Optional trailer embed URL (YouTube) from Jikan / external sources */
  trailerEmbedUrl?: string;
  /** Optional streaming service links */
  streamingLinks?: Array<{ name: string; url: string }>;
  /** MAL ID for Jikan-sourced content */
  malId?: number;
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
  /** Optional trailer embed URL (YouTube) from Jikan / external sources */
  trailerEmbedUrl?: string;
  /** Optional streaming service links */
  streamingLinks?: Array<{ name: string; url: string }>;
  /** MAL ID for Jikan-sourced content */
  malId?: number;
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

/** Raw Jikan v4 anime object returned by the API */
export interface JikanAnime {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp?: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: 'TV' | 'Movie' | 'OVA' | 'ONA' | 'Special' | 'Music' | null;
  episodes: number | null;
  status: string;
  airing: boolean;
  synopsis: string | null;
  year: number | null;
  season: string | null;
  genres: Array<{ mal_id: number; type: string; name: string; url: string }>;
  themes: Array<{ mal_id: number; type: string; name: string; url: string }>;
  demographics: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  streaming: Array<{ name: string; url: string }>;
  external: Array<{ name: string; url: string }>;
  score: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
}
