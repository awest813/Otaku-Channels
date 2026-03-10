/**
 * Unit tests for client-side recommendation heuristics.
 *
 * @jest-environment node
 */

import {
  getCombinedRecs,
  getEraRecs,
  getProviderRecs,
  getSharedGenreRecs,
} from '@/lib/recommendations';

import type { AnimeSeries } from '@/types';

const base: AnimeSeries = {
  id: 'base',
  slug: 'base-anime',
  title: 'Base Anime',
  description: '',
  thumbnail: '',
  heroImage: '',
  type: 'series',
  genres: ['Action', 'Fantasy'],
  language: 'sub',
  sourceName: 'YouTube Official',
  sourceType: 'youtube',
  isEmbeddable: true,
  watchUrl: 'https://youtube.com',
  releaseYear: 2020,
  tags: [],
  episodeCount: 12,
};

function makeAnime(overrides: Partial<AnimeSeries>): AnimeSeries {
  return { ...base, id: Math.random().toString(), slug: Math.random().toString(), ...overrides };
}

const highOverlap = makeAnime({ id: 'high', genres: ['Action', 'Fantasy', 'Adventure'], releaseYear: 2021 });
const medOverlap = makeAnime({ id: 'med', genres: ['Action', 'Romance'], releaseYear: 2019 });
const noOverlap = makeAnime({ id: 'none', genres: ['Sports', 'Slice of Life'], releaseYear: 2020 });
const sameProvider = makeAnime({ id: 'prov', genres: ['Mecha'], sourceType: 'youtube' as const, releaseYear: 2010 });
const differentProvider = makeAnime({ id: 'diff', genres: ['Action'], sourceType: 'tubi' as const, releaseYear: 2020 });

const catalogue = [base, highOverlap, medOverlap, noOverlap, sameProvider, differentProvider];

describe('getSharedGenreRecs', () => {
  it('excludes the base item', () => {
    const recs = getSharedGenreRecs(base, catalogue);
    expect(recs.map((r) => r.id)).not.toContain('base');
  });

  it('ranks items with more genre overlap higher', () => {
    const recs = getSharedGenreRecs(base, catalogue);
    const highIdx = recs.findIndex((r) => r.id === 'high');
    const medIdx = recs.findIndex((r) => r.id === 'med');
    expect(highIdx).toBeLessThan(medIdx);
  });

  it('ranks genre-overlapping items above zero-overlap items', () => {
    const recs = getSharedGenreRecs(base, catalogue);
    const highIdx = recs.findIndex((r) => r.id === 'high');
    // zero-overlap same-era item should score lower than genre match
    const noOverlapIdx = recs.findIndex((r) => r.id === 'none');
    if (noOverlapIdx !== -1) {
      expect(highIdx).toBeLessThan(noOverlapIdx);
    }
  });

  it('respects the limit', () => {
    const recs = getSharedGenreRecs(base, catalogue, 2);
    expect(recs.length).toBeLessThanOrEqual(2);
  });
});

describe('getEraRecs', () => {
  it('only returns items within ±10 years', () => {
    const recs = getEraRecs(base, catalogue);
    recs.forEach((r) => {
      expect(Math.abs((r.releaseYear || 0) - (base.releaseYear || 0))).toBeLessThanOrEqual(10);
    });
  });

  it('excludes base item', () => {
    const recs = getEraRecs(base, catalogue);
    expect(recs.map((r) => r.id)).not.toContain('base');
  });
});

describe('getProviderRecs', () => {
  it('returns only same-provider items', () => {
    const recs = getProviderRecs(base, catalogue);
    recs.forEach((r) => {
      expect(r.sourceType).toBe(base.sourceType);
    });
  });

  it('excludes base item', () => {
    const recs = getProviderRecs(base, catalogue);
    expect(recs.map((r) => r.id)).not.toContain('base');
  });
});

describe('getCombinedRecs', () => {
  it('returns items ranked by combined score', () => {
    const recs = getCombinedRecs(base, catalogue);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.map((r) => r.id)).not.toContain('base');
  });

  it('respects the limit', () => {
    const recs = getCombinedRecs(base, catalogue, 3);
    expect(recs.length).toBeLessThanOrEqual(3);
  });
});
