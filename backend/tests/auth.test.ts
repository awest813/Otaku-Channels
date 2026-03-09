/**
 * Auth module unit tests
 * These test the service layer logic without a live DB (mocked).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DB and Redis before importing service ───────────────────────────────

vi.mock('../src/lib/db', () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/redis', () => ({
  redis: { del: vi.fn() },
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
}));

import { db } from '../src/lib/db';

// ─── Security helpers ─────────────────────────────────────────────────────────

import { hashPassword, verifyPassword, extractDomain, sanitizeUrl } from '../src/lib/security';

describe('security helpers', () => {
  it('hashes and verifies passwords', async () => {
    const pw = 'MySecretPassword1!';
    const hash = await hashPassword(pw);
    expect(hash).not.toBe(pw);
    expect(await verifyPassword(hash, pw)).toBe(true);
    expect(await verifyPassword(hash, 'wrong')).toBe(false);
  });

  it('extracts domain from URL', () => {
    expect(extractDomain('https://www.youtube.com/watch?v=abc')).toBe('www.youtube.com');
    expect(extractDomain('https://tubitv.com/series/123')).toBe('tubitv.com');
    expect(extractDomain('not-a-url')).toBe(null);
  });

  it('sanitizes URLs', () => {
    expect(sanitizeUrl('https://www.youtube.com/watch?v=abc')).toBe('https://www.youtube.com/watch?v=abc');
    expect(() => sanitizeUrl('ftp://evil.com/file')).toThrow();
    expect(() => sanitizeUrl('javascript:alert(1)')).toThrow();
    expect(() => sanitizeUrl('not-a-url')).toThrow();
  });
});

// ─── Domain allowlist ─────────────────────────────────────────────────────────

import { assertDomainAllowed } from '../src/lib/security';

vi.mock('../src/lib/db', () => ({
  db: {
    allowedDomain: {
      findUnique: vi.fn(),
    },
    user: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
  },
}));

describe('domain allowlist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('allows approved domains', async () => {
    (db.allowedDomain.findUnique as any).mockResolvedValue({ domain: 'www.youtube.com' });
    await expect(assertDomainAllowed('https://www.youtube.com/watch?v=abc')).resolves.not.toThrow();
  });

  it('rejects unapproved domains', async () => {
    (db.allowedDomain.findUnique as any).mockResolvedValue(null);
    await expect(assertDomainAllowed('https://sketchy-site.xyz/anime')).rejects.toThrow(
      /not on the approved source allowlist/,
    );
  });
});

// ─── Schedule calculation ─────────────────────────────────────────────────────

// Test the now-playing rotation logic without hitting the DB
describe('channel schedule rotation', () => {
  /**
   * Simulate the schedule rotation algorithm from channels/service.ts
   * to verify correctness of epoch-based slot selection.
   */
  function calcCurrentSlot(
    slots: { durationSec: number; label: string }[],
    nowMs: number,
    epochMs: number,
  ) {
    const totalDuration = slots.reduce((s, sl) => s + sl.durationSec, 0);
    if (totalDuration === 0) return null;

    const nowSec = Math.floor((nowMs - epochMs) / 1000);
    const cycleOffset = nowSec % totalDuration;

    let accumulated = 0;
    for (const slot of slots) {
      if (cycleOffset < accumulated + slot.durationSec) return { slot, progressSec: cycleOffset - accumulated };
      accumulated += slot.durationSec;
    }
    return { slot: slots[0], progressSec: 0 };
  }

  const EPOCH = new Date('2024-01-01T00:00:00Z').getTime();

  const slots = [
    { durationSec: 1440, label: 'Slot A' }, // 24 min
    { durationSec: 1440, label: 'Slot B' },
    { durationSec: 2880, label: 'Slot C' }, // 48 min
  ];
  const totalDuration = 1440 + 1440 + 2880; // 5760 sec

  it('selects the first slot at epoch start', () => {
    const result = calcCurrentSlot(slots, EPOCH, EPOCH);
    expect(result?.slot.label).toBe('Slot A');
    expect(result?.progressSec).toBe(0);
  });

  it('selects the second slot after 1440s', () => {
    const result = calcCurrentSlot(slots, EPOCH + 1440_000, EPOCH);
    expect(result?.slot.label).toBe('Slot B');
  });

  it('selects the third slot after 2880s', () => {
    const result = calcCurrentSlot(slots, EPOCH + 2880_000, EPOCH);
    expect(result?.slot.label).toBe('Slot C');
  });

  it('wraps around after one full cycle', () => {
    const result = calcCurrentSlot(slots, EPOCH + totalDuration * 1000, EPOCH);
    expect(result?.slot.label).toBe('Slot A');
  });

  it('handles mid-cycle correctly', () => {
    // 1500s in = 60s into slot B (starts at 1440)
    const result = calcCurrentSlot(slots, EPOCH + 1500_000, EPOCH);
    expect(result?.slot.label).toBe('Slot B');
    expect(result?.progressSec).toBe(60);
  });
});

// ─── Input validation ─────────────────────────────────────────────────────────

import { RegisterSchema, LoginSchema } from '../src/modules/auth/schema';

describe('auth schemas', () => {
  describe('RegisterSchema', () => {
    it('accepts valid registration', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        username: 'cool_user',
        password: 'SecurePass1',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short password', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        username: 'cool_user',
        password: 'abc',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        username: 'cool_user',
        password: 'alllowercase1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        username: 'cool_user',
        password: 'NoNumbersHere',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid username characters', () => {
      const result = RegisterSchema.safeParse({
        email: 'user@example.com',
        username: 'user name!',
        password: 'SecurePass1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('LoginSchema', () => {
    it('accepts valid login', () => {
      const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'anything' });
      expect(result.success).toBe(true);
    });

    it('rejects missing password', () => {
      const result = LoginSchema.safeParse({ email: 'user@example.com', password: '' });
      expect(result.success).toBe(false);
    });
  });
});
