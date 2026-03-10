/**
 * Client-side recommendation heuristics.
 *
 * Used as a fallback when the backend recommendation service is unavailable.
 * All functions are pure — they accept and return canonical Anime types with
 * no external side-effects.
 *
 * Heuristics (in order of quality):
 *   1. Shared genre overlap    — maximise common genre count
 *   2. Era / style overlap     — titles from the same release decade
 *   3. Provider similarity     — same streaming source
 */

import type { AnimeSeries, Movie } from '@/types';

type AnyAnime = AnimeSeries | Movie;

/**
 * Count how many genres two items share.
 */
function genreOverlap(a: AnyAnime, b: AnyAnime): number {
  const setA = new Set(a.genres);
  return b.genres.filter((g) => setA.has(g)).length;
}

/**
 * Returns the decade of a release year (e.g. 1999 → 1990, 2022 → 2020).
 */
function decade(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Returns a score in [0, 1] representing how close two years are.
 * Items within ±5 years get 1.0; further apart tapers off.
 * Returns 0 when either item has an unknown release year (0 or falsy).
 */
function eraScore(a: AnyAnime, b: AnyAnime): number {
  const ya = a.releaseYear || 0;
  const yb = b.releaseYear || 0;
  if (!ya || !yb) return 0;
  const diff = Math.abs(ya - yb);
  if (diff === 0) return 1;
  if (diff <= 5) return 0.8;
  if (diff <= 10) return 0.5;
  if (decade(ya) === decade(yb)) return 0.3;
  return 0;
}

/**
 * Rank `candidates` by genre overlap with `base`, then by era proximity as
 * a tiebreaker. Excludes `base` itself.
 *
 * @param base      The reference anime.
 * @param all       Full catalogue to search.
 * @param limit     Maximum number of results to return.
 */
export function getSharedGenreRecs(
  base: AnyAnime,
  all: AnyAnime[],
  limit = 12
): AnyAnime[] {
  return all
    .filter((item) => item.id !== base.id)
    .map((item) => ({
      item,
      score: genreOverlap(base, item) * 10 + eraScore(base, item),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * Returns items from the same release era (±5 years), ranked by genre overlap.
 */
export function getEraRecs(
  base: AnyAnime,
  all: AnyAnime[],
  limit = 12
): AnyAnime[] {
  return all
    .filter((item) => item.id !== base.id && eraScore(base, item) >= 0.5)
    .map((item) => ({
      item,
      score: eraScore(base, item) * 10 + genreOverlap(base, item),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * Returns items from the same streaming provider, ranked by genre overlap.
 */
export function getProviderRecs(
  base: AnyAnime,
  all: AnyAnime[],
  limit = 12
): AnyAnime[] {
  return all
    .filter(
      (item) => item.id !== base.id && item.sourceType === base.sourceType
    )
    .map((item) => ({
      item,
      score: genreOverlap(base, item) * 10 + eraScore(base, item),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * Combined heuristic: blend genre, era, and provider signals.
 * Each dimension contributes a weighted score.
 */
export function getCombinedRecs(
  base: AnyAnime,
  all: AnyAnime[],
  limit = 12
): AnyAnime[] {
  return all
    .filter((item) => item.id !== base.id)
    .map((item) => ({
      item,
      score:
        genreOverlap(base, item) * 5 +
        eraScore(base, item) * 3 +
        (item.sourceType === base.sourceType ? 2 : 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
