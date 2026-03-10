/**
 * Canonical data-model contracts for Otaku Channels.
 *
 * Every UI card, watch page, and API route should be renderable from these
 * types alone. Raw provider types (JikanAnime, KitsuAnimeResource,
 * ShikimoriAnime) live in index.ts and are only used inside the ingestion
 * pipeline (`src/lib/ingestion/normalize.ts`).
 *
 * Backward-compatible aliases AnimeSeries, Movie, and LiveChannel are
 * re-exported from index.ts so existing code compiles without changes.
 */

// ─── Primitives & enums ──────────────────────────────────────────────────────

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

/** How a source is embedded or linked in the player. */
export type EmbedType = 'youtube' | 'iframe' | 'hls' | 'external';

/** Streaming availability state for a given source. */
export type AvailabilityStatus =
  | 'available'
  | 'unavailable'
  | 'geo-blocked'
  | 'requires-subscription'
  | 'unknown';

// ─── Source provenance ────────────────────────────────────────────────────────

/**
 * A single streaming / watch source with full provenance metadata.
 * Multiple SourceLinks can be attached to an Anime, Episode, or Channel.
 */
export interface SourceLink {
  /** Stable identifier scoped to the provider (e.g. 'crunchyroll', 'mal-21', 'kitsu-456'). */
  providerId: string;
  /** Canonical URL on the provider's site. */
  providerUrl: string;
  /** Human-readable provider name shown in the UI. */
  sourceName: string;
  /** Logical source category used for badges and filtering. */
  sourceType: SourceType;
  /** How this source is rendered in the player shell. */
  embedType: EmbedType;
  /** ISO 3166-1 alpha-2 country code or 'global' when region is not restricted. */
  region: string;
  /** Whether this is an officially licensed streaming service (not an aggregator). */
  isOfficial: boolean;
  /** Whether our player can embed this source directly. */
  isEmbeddable: boolean;
  /** Audio/subtitle language preference for this source. */
  language: LanguageOption;
  /** Current streaming availability state. */
  availabilityStatus: AvailabilityStatus;
  /** ISO 8601 timestamp of the last availability check, or null if never verified. */
  lastVerifiedAt: string | null;
}

/**
 * Time-bounded availability of a source for a piece of content.
 * Used to model licensing windows (e.g. "available on Tubi until 2025-12-31").
 */
export interface AvailabilityWindow {
  /** References SourceLink.providerId */
  providerId: string;
  /** ISO 8601 start of the availability window, or null if open-ended. */
  startsAt: string | null;
  /** ISO 8601 end of the availability window, or null if open-ended. */
  endsAt: string | null;
  /** ISO 3166-1 alpha-2 country code or 'global'. */
  region: string;
  availabilityStatus: AvailabilityStatus;
}

// ─── Core content entities ────────────────────────────────────────────────────

/**
 * The single canonical contract for all anime content (series AND movies).
 *
 * Flat source fields (sourceName, sourceType, isEmbeddable, watchUrl) are
 * preserved for backward compatibility and are always derived from
 * sourceLinks[0] by the ingestion pipeline. New code should read from
 * sourceLinks directly.
 *
 * AnimeSeries and Movie are intersection subtypes of Anime (see index.ts).
 */
export interface Anime {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  heroImage: string;
  /** Distinguishes TV series from films; determines whether episodeCount is present. */
  type: 'series' | 'movie';
  genres: string[];
  language: LanguageOption;

  // ── Flat source fields (backward compat; derived from sourceLinks[0]) ──────
  sourceName: string;
  sourceType: SourceType;
  isEmbeddable: boolean;
  watchUrl: string;

  releaseYear: number;
  tags: string[];

  /** YouTube embed URL for trailers (autoplay param stripped). */
  trailerEmbedUrl?: string;
  /** Raw streaming service links as returned by the provider. */
  streamingLinks?: Array<{ name: string; url: string }>;
  /** MyAnimeList ID; present when the record originates from Jikan or Shikimori. */
  malId?: number;

  // ── Provenance ──────────────────────────────────────────────────────────────
  /** All known streaming / watch sources with full provenance. */
  sourceLinks?: SourceLink[];
  /** Licensing availability windows per provider / region. */
  availability?: AvailabilityWindow[];
}

/**
 * A single episode belonging to an Anime series.
 */
export interface Episode {
  id: string;
  /** Slug of the parent Anime. */
  seriesSlug: string;
  title: string;
  description: string;
  thumbnail: string;
  episodeNumber: number;
  seasonNumber: number;
  /** Human-readable duration string, e.g. "24 min". */
  duration: string;
  watchUrl: string;
  isEmbeddable: boolean;
  sourceName: string;
  /** Episode-level source links with provenance (enriched when available). */
  sourceLinks?: SourceLink[];
}

/**
 * A live or curated channel (e.g. Pluto TV anime, YouTube live, pseudo-live).
 */
export interface Channel {
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
  /** Channel-level source links with provenance (enriched when available). */
  sourceLinks?: SourceLink[];
}

/**
 * A metadata / streaming service provider known to the app.
 */
export interface SourceProvider {
  id: string;
  name: string;
  type: SourceType;
  logoUrl?: string;
  baseUrl: string;
  /** Whether this is an officially licensed streaming service. */
  isOfficial: boolean;
  /** Primary availability region (ISO 3166-1 alpha-2 or 'global'). */
  region: string;
  /** Default embedding strategy for this provider. */
  embedType: EmbedType;
}

// ─── User interaction entities ────────────────────────────────────────────────

/**
 * Watch progress for an anime or a specific episode.
 * Stored server-side (Prisma WatchProgress) and mirrored client-side.
 */
export interface WatchProgress {
  /** ID of the Anime the progress belongs to. */
  animeId: string;
  /** Episode ID, if progress is episode-specific. */
  episodeId?: string;
  /** Playback position in seconds. */
  positionSeconds: number;
  /** Total duration in seconds (0 if unknown). */
  durationSeconds: number;
  /** ISO 8601 timestamp when the item was marked completed, if applicable. */
  completedAt?: string;
  /** ISO 8601 timestamp of the last progress update. */
  updatedAt: string;
}

/**
 * A single entry in a user's watchlist with status tracking.
 * Extends the lightweight WatchlistItem used by the localStorage hook.
 */
export interface WatchlistEntry {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  sourceType: SourceType;
  releaseYear: number;
  /** Viewing status. */
  status: 'planned' | 'watching' | 'completed' | 'dropped' | 'on-hold';
  /** ISO 8601 timestamp when the entry was created. */
  addedAt: string;
  /** Optional user notes about this entry. */
  notes?: string;
}

/**
 * A directed recommendation edge in the "people who watched X also watched Y"
 * recommendation graph.
 */
export interface RecommendationEdge {
  /** Source anime ID. */
  fromAnimeId: string;
  /** Target (recommended) anime ID. */
  toAnimeId: string;
  /** Populated target anime (in contexts where the full record is fetched). */
  toAnime?: Anime;
  /** Confidence score in the range [0, 1]. */
  score: number;
  /**
   * Human-readable reason used for "Because you watched…" labels.
   * Examples: 'genre-match', 'staff-match', 'sequel', 'same-studio'.
   */
  reason: string;
  /** How the edge was produced. */
  source: 'algorithmic' | 'editorial' | 'user';
}

/**
 * Per-user viewing and UI preferences.
 * Mirrors the UserProfile model in the Prisma schema.
 */
export interface UserPreference {
  /** Prefer subtitled content over dubbed. */
  preferSub: boolean;
  /** Prefer dubbed content over subtitled. */
  preferDub: boolean;
  /** Preferred UI locale / subtitle language (BCP-47 tag, e.g. 'en', 'ja'). */
  language: string;
  /** UI color scheme preference. */
  theme: 'dark' | 'light' | 'system';
  /** Genres the user has explicitly marked as favourites. */
  favoriteGenres: string[];
  /** Source types the user prefers to watch from. */
  preferredSources: SourceType[];
  /** Hide adult-rated content (18+) from all lists. */
  hideAdultContent: boolean;
}

// ─── Genre helper ─────────────────────────────────────────────────────────────

export interface Genre {
  id: string;
  name: string;
}
