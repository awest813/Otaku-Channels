/**
 * Kitsu API client — unit tests for pure utility functions.
 * HTTP calls are not made in these tests; only the mapping and parsing
 * helpers are exercised to keep the suite fast and side-effect free.
 */

import { describe, it, expect } from 'vitest';
import {
  mapKitsuStatus,
  mapKitsuSubtype,
  parseKitsuRating,
  isAdult,
} from '../src/lib/kitsu/client';

describe('mapKitsuStatus', () => {
  it('maps "current" → ONGOING', () => {
    expect(mapKitsuStatus('current')).toBe('ONGOING');
  });

  it('maps "finished" → COMPLETED', () => {
    expect(mapKitsuStatus('finished')).toBe('COMPLETED');
  });

  it('maps "upcoming" → UPCOMING', () => {
    expect(mapKitsuStatus('upcoming')).toBe('UPCOMING');
  });

  it('maps "tba" → UPCOMING', () => {
    expect(mapKitsuStatus('tba')).toBe('UPCOMING');
  });

  it('maps "unreleased" → UPCOMING', () => {
    expect(mapKitsuStatus('unreleased')).toBe('UPCOMING');
  });

  it('defaults unknown status to COMPLETED', () => {
    expect(mapKitsuStatus(null)).toBe('COMPLETED');
    expect(mapKitsuStatus('unknown')).toBe('COMPLETED');
  });
});

describe('mapKitsuSubtype', () => {
  it('maps "TV" → TV (case-insensitive)', () => {
    expect(mapKitsuSubtype('TV')).toBe('TV');
    expect(mapKitsuSubtype('tv')).toBe('TV');
  });

  it('maps "movie" → MOVIE', () => {
    expect(mapKitsuSubtype('movie')).toBe('MOVIE');
  });

  it('maps "OVA" → OVA', () => {
    expect(mapKitsuSubtype('OVA')).toBe('OVA');
  });

  it('maps "ONA" → ONA', () => {
    expect(mapKitsuSubtype('ONA')).toBe('ONA');
  });

  it('maps "special" → SPECIAL', () => {
    expect(mapKitsuSubtype('special')).toBe('SPECIAL');
  });

  it('maps "music" → MUSIC', () => {
    expect(mapKitsuSubtype('music')).toBe('MUSIC');
  });

  it('defaults unknown subtype to TV', () => {
    expect(mapKitsuSubtype(null)).toBe('TV');
    expect(mapKitsuSubtype('unknown')).toBe('TV');
  });
});

describe('parseKitsuRating', () => {
  it('parses a valid rating string', () => {
    expect(parseKitsuRating('7.89')).toBeCloseTo(7.89);
  });

  it('parses an integer-like string', () => {
    expect(parseKitsuRating('8')).toBe(8);
  });

  it('returns null for null input', () => {
    expect(parseKitsuRating(null)).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(parseKitsuRating('N/A')).toBeNull();
  });
});

describe('isAdult', () => {
  it('returns true when nsfw flag is set', () => {
    expect(isAdult('PG', true)).toBe(true);
  });

  it('returns true when ageRating is R18', () => {
    expect(isAdult('R18', false)).toBe(true);
  });

  it('returns false for standard ratings', () => {
    expect(isAdult('G', false)).toBe(false);
    expect(isAdult('PG', false)).toBe(false);
    expect(isAdult('R', false)).toBe(false);
  });

  it('returns false for null rating when not nsfw', () => {
    expect(isAdult(null, false)).toBe(false);
  });
});
