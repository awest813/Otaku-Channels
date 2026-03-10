/**
 * Public type surface for Otaku Channels.
 *
 * Canonical entity types are defined in `./canonical` and re-exported here so
 * all imports keep using `@/types`.  Backward-compatible aliases (AnimeSeries,
 * Movie, LiveChannel) map to the new unified Anime / Channel types so existing
 * components compile without changes.
 *
 * Raw provider shapes (JikanAnime, KitsuAnimeResource, ShikimoriAnime) remain
 * here because they are only consumed by the ingestion pipeline.
 */

// ─── Re-export canonical entities ────────────────────────────────────────────

export type {
  // Core content
  Anime,
  AvailabilityStatus,
  AvailabilityWindow,
  Channel,
  ChannelWithSchedule,
  ContentType,
  EmbedType,
  Episode,
  // Helpers
  Genre,
  // Primitives
  LanguageOption,
  NowPlayingResult,
  RecommendationEdge,
  // Schedule / pseudo-live channel system
  ScheduleSlot,
  // Provenance
  SourceLink,
  SourceType,
  UserPreference,
  WatchlistEntry,
  // User interaction
  WatchProgress,
} from './canonical';
export type { SourceProvider } from './canonical';

// ─── Backward-compatible aliases ──────────────────────────────────────────────

import type { Anime, Channel } from './canonical';

/**
 * TV series subtype of Anime.  All existing code that types variables as
 * `AnimeSeries` continues to work because AnimeSeries satisfies Anime.
 *
 * The only added constraint vs. raw `Anime` is that `type` is narrowed to
 * `'series'` and `episodeCount` is present and required.
 */
export type AnimeSeries = Anime & { type: 'series'; episodeCount: number };

/**
 * Film subtype of Anime.  Does not carry `episodeCount`.
 */
export type Movie = Anime & { type: 'movie' };

/**
 * Alias for Channel — live / curated stream entry.
 * Kept so existing imports of `LiveChannel` continue to resolve.
 */
export type LiveChannel = Channel;

/**
 * Union of displayable card items (series, movies, and live channels).
 */
export type ContentCardItem = AnimeSeries | Movie | Channel;

// ─── Raw provider types ───────────────────────────────────────────────────────
// These shapes mirror the external API responses exactly.  They are only used
// inside src/lib/ingestion/normalize.ts; nothing outside the ingestion layer
// should depend on them.

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
