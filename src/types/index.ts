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
  | 'jikan'
  | 'kitsu'
  | 'shikimori';

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

/** Raw Kitsu anime object (JSON:API data resource) */
export interface KitsuAnimeResource {
  id: string;
  type: 'anime';
  attributes: {
    slug: string;
    synopsis: string | null;
    canonicalTitle: string;
    titles: { en: string | null; en_jp: string | null; ja_jp: string | null };
    averageRating: string | null; // "7.89" — string decimal
    startDate: string | null; // "YYYY-MM-DD"
    endDate: string | null;
    subtype: string | null; // "TV" | "movie" | "OVA" | "ONA" | "special" | "music"
    status: string | null; // "current" | "finished" | "tba" | "unreleased" | "upcoming"
    episodeCount: number | null;
    nsfw: boolean;
    posterImage: {
      tiny: string | null;
      small: string | null;
      medium: string | null;
      large: string | null;
      original: string | null;
    } | null;
    coverImage: {
      tiny: string | null;
      small: string | null;
      large: string | null;
      original: string | null;
    } | null;
  };
}

/** Raw Shikimori anime object returned by GraphQL */
export interface ShikimoriAnime {
  id: string;
  malId: number | null;
  name: string;
  english: string | null;
  japanese: string | null;
  kind: string | null; // "tv" | "movie" | "ova" | "ona" | "special" | "music"
  score: number | null;
  status: string | null; // "released" | "ongoing" | "anons"
  episodes: number;
  airedOn: { year: number | null; date: string | null } | null;
  description: string | null;
  poster: { originalUrl: string | null; mainUrl: string | null } | null;
  genres: Array<{ name: string; russian: string }>;
}
