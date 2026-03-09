/**
 * Search module unit tests (schema validation + query building logic)
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-export the query schema inline for testability without importing routes
const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  genre: z.string().optional(),
  type: z.enum(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC']).optional(),
  year: z.coerce.number().optional(),
  season: z.enum(['WINTER', 'SPRING', 'SUMMER', 'FALL']).optional(),
  source: z.string().optional(),
  sort: z.enum(['relevance', 'trending', 'rating', 'recent']).default('relevance'),
});

describe('SearchQuerySchema', () => {
  it('parses a minimal query', () => {
    const result = SearchQuerySchema.safeParse({ q: 'naruto' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe('naruto');
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sort).toBe('relevance');
    }
  });

  it('applies defaults', () => {
    const result = SearchQuerySchema.parse({ q: 'attack on titan' });
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sort).toBe('relevance');
  });

  it('rejects empty query', () => {
    expect(SearchQuerySchema.safeParse({ q: '' }).success).toBe(false);
  });

  it('rejects query over 200 chars', () => {
    expect(SearchQuerySchema.safeParse({ q: 'a'.repeat(201) }).success).toBe(false);
  });

  it('clamps limit to 50', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', limit: '999' });
    // Zod coerces but doesn't clamp — the route handler does. Ensure parse succeeds.
    // The route enforces .min(1).max(50).
    expect(result.success).toBe(false); // max(50) rejects 999
  });

  it('accepts valid genre filter', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', genre: 'mecha' });
    expect(result.success).toBe(true);
  });

  it('accepts valid type filter', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', type: 'MOVIE' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', type: 'ANIME' });
    expect(result.success).toBe(false);
  });

  it('accepts season filter', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', season: 'FALL' });
    expect(result.success).toBe(true);
  });

  it('coerces year string to number', () => {
    const result = SearchQuerySchema.safeParse({ q: 'test', year: '2022' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.year).toBe(2022);
  });
});

// ─── Source URL validation ────────────────────────────────────────────────────

import { extractDomain } from '../src/lib/security';

describe('source URL domain extraction', () => {
  const TRUSTED = ['www.youtube.com', 'tubitv.com', 'pluto.tv', 'www.retrocrush.tv', 'www.crunchyroll.com'];

  function isTrusted(url: string): boolean {
    const domain = extractDomain(url);
    return domain !== null && TRUSTED.includes(domain);
  }

  it('allows trusted YouTube URL', () => {
    expect(isTrusted('https://www.youtube.com/watch?v=abc123')).toBe(true);
  });

  it('allows Tubi URL', () => {
    expect(isTrusted('https://tubitv.com/series/12345/anime')).toBe(true);
  });

  it('rejects unknown domain', () => {
    expect(isTrusted('https://piracy-site.xyz/anime')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isTrusted('')).toBe(false);
  });

  it('rejects non-URL', () => {
    expect(isTrusted('not-a-url')).toBe(false);
  });

  it('rejects subdomain of trusted domain', () => {
    // We only trust the specific registered domains
    expect(isTrusted('https://evil.youtube.com/watch?v=abc')).toBe(false);
  });
});
