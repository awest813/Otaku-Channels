/**
 * Tests for query parameter validation helpers (src/lib/params.ts).
 *
 * @jest-environment node
 */

import { clampLimit, clampPage, clampYear, sanitizeQuery } from '@/lib/params';

describe('clampPage', () => {
  it('returns undefined for null input', () => {
    expect(clampPage(null)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(clampPage('')).toBeUndefined();
  });

  it('returns undefined for non-numeric string', () => {
    expect(clampPage('abc')).toBeUndefined();
  });

  it('returns undefined for zero', () => {
    expect(clampPage('0')).toBeUndefined();
  });

  it('returns undefined for negative number', () => {
    expect(clampPage('-5')).toBeUndefined();
  });

  it('returns parsed value for valid page', () => {
    expect(clampPage('3')).toBe(3);
  });

  it('clamps to 500 for very large page', () => {
    expect(clampPage('99999')).toBe(500);
  });
});

describe('clampLimit', () => {
  it('returns undefined for null input', () => {
    expect(clampLimit(null)).toBeUndefined();
  });

  it('returns undefined for non-numeric string', () => {
    expect(clampLimit('xyz')).toBeUndefined();
  });

  it('returns undefined for zero', () => {
    expect(clampLimit('0')).toBeUndefined();
  });

  it('returns undefined for negative', () => {
    expect(clampLimit('-1')).toBeUndefined();
  });

  it('returns parsed value for valid limit', () => {
    expect(clampLimit('25')).toBe(25);
  });

  it('clamps to 100 for very large limit', () => {
    expect(clampLimit('9999')).toBe(100);
  });
});

describe('clampYear', () => {
  it('returns undefined for null input', () => {
    expect(clampYear(null)).toBeUndefined();
  });

  it('returns undefined for non-numeric string', () => {
    expect(clampYear('abc')).toBeUndefined();
  });

  it('returns undefined for year before 1900', () => {
    expect(clampYear('1800')).toBeUndefined();
  });

  it('returns undefined for year far in the future', () => {
    expect(clampYear('3000')).toBeUndefined();
  });

  it('returns valid year within range', () => {
    expect(clampYear('2020')).toBe(2020);
  });

  it('returns 1900 for exactly 1900', () => {
    expect(clampYear('1900')).toBe(1900);
  });
});

describe('sanitizeQuery', () => {
  it('returns undefined for null', () => {
    expect(sanitizeQuery(null)).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(sanitizeQuery('')).toBeUndefined();
  });

  it('returns undefined for whitespace-only string', () => {
    expect(sanitizeQuery('   ')).toBeUndefined();
  });

  it('returns trimmed string for normal input', () => {
    expect(sanitizeQuery('  naruto  ')).toBe('naruto');
  });

  it('truncates to maxLen', () => {
    const longQuery = 'a'.repeat(300);
    expect(sanitizeQuery(longQuery)).toHaveLength(200);
  });

  it('respects custom maxLen', () => {
    expect(sanitizeQuery('hello world', 5)).toBe('hello');
  });
});
