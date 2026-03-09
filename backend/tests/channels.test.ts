/**
 * Channel schedule calculation tests
 */

import { describe, it, expect } from 'vitest';

// ─── Epoch-based rotation ────────────────────────────────────────────────────

const EPOCH_MS = new Date('2024-01-01T00:00:00Z').getTime();

interface Slot {
  slotIndex: number;
  durationSec: number;
  label?: string;
}

function calcNowPlaying(slots: Slot[], nowMs: number) {
  const totalDuration = slots.reduce((s, sl) => s + sl.durationSec, 0);
  if (totalDuration === 0) return null;

  const nowSec = Math.floor((nowMs - EPOCH_MS) / 1000);
  const cycleOffset = ((nowSec % totalDuration) + totalDuration) % totalDuration;

  let accumulated = 0;
  let currentSlot: Slot | null = null;

  for (const slot of slots) {
    if (cycleOffset < accumulated + slot.durationSec) {
      currentSlot = slot;
      break;
    }
    accumulated += slot.durationSec;
  }

  if (!currentSlot) currentSlot = slots[0];

  const progressSec = cycleOffset - accumulated;
  const progressPercent = Math.round((progressSec / currentSlot.durationSec) * 100);
  const remainingSec = currentSlot.durationSec - progressSec;
  const currentIdx = slots.indexOf(currentSlot);
  const nextSlot = slots[(currentIdx + 1) % slots.length] ?? null;

  return { current: currentSlot, next: nextSlot, progressSec, progressPercent, remainingSec };
}

describe('channel schedule — now playing calculation', () => {
  const slots: Slot[] = [
    { slotIndex: 0, durationSec: 1440, label: 'Show A' }, // 24 min
    { slotIndex: 1, durationSec: 1440, label: 'Show B' }, // 24 min
    { slotIndex: 2, durationSec: 2880, label: 'Show C' }, // 48 min
  ];
  // Total: 5760 sec (96 min)

  it('returns first slot at epoch', () => {
    const r = calcNowPlaying(slots, EPOCH_MS);
    expect(r?.current.label).toBe('Show A');
    expect(r?.progressSec).toBe(0);
  });

  it('transitions to second slot after 1440s', () => {
    const r = calcNowPlaying(slots, EPOCH_MS + 1440_000);
    expect(r?.current.label).toBe('Show B');
  });

  it('transitions to third slot after 2880s', () => {
    const r = calcNowPlaying(slots, EPOCH_MS + 2880_000);
    expect(r?.current.label).toBe('Show C');
  });

  it('wraps around to first slot after full cycle', () => {
    const r = calcNowPlaying(slots, EPOCH_MS + 5760_000);
    expect(r?.current.label).toBe('Show A');
  });

  it('computes progress percentage correctly', () => {
    // 720s into Show A (50% through)
    const r = calcNowPlaying(slots, EPOCH_MS + 720_000);
    expect(r?.current.label).toBe('Show A');
    expect(r?.progressPercent).toBe(50);
    expect(r?.remainingSec).toBe(720);
  });

  it('provides correct next slot', () => {
    const r = calcNowPlaying(slots, EPOCH_MS + 100_000);
    expect(r?.current.label).toBe('Show A');
    expect(r?.next?.label).toBe('Show B');
  });

  it('wraps next slot to first after last', () => {
    // Inside Show C (slot 2), next should be Show A
    const r = calcNowPlaying(slots, EPOCH_MS + 3000_000);
    expect(r?.current.label).toBe('Show C');
    expect(r?.next?.label).toBe('Show A');
  });

  it('handles single slot', () => {
    const single: Slot[] = [{ slotIndex: 0, durationSec: 3600, label: 'Only Show' }];
    const r = calcNowPlaying(single, EPOCH_MS + 1800_000);
    expect(r?.current.label).toBe('Only Show');
    expect(r?.next?.label).toBe('Only Show');
  });

  it('returns null for empty schedule', () => {
    expect(calcNowPlaying([], EPOCH_MS)).toBe(null);
  });

  it('handles times before epoch gracefully', () => {
    // nowMs before EPOCH_MS — the modulo + offset handles negative correctly
    const r = calcNowPlaying(slots, EPOCH_MS - 1000);
    expect(r).not.toBe(null);
    // Should still resolve to a valid slot
    expect(slots.map((s) => s.label)).toContain(r?.current.label);
  });
});

// ─── Channel slug validation ──────────────────────────────────────────────────

describe('channel slug validation', () => {
  const slugPattern = /^[a-z0-9-]+$/;

  it.each([
    ['retro-mecha', true],
    ['shonen-power-hour', true],
    ['cozy-slice-of-life', true],
    ['channel123', true],
    ['Retro-Mecha', false],   // uppercase
    ['retro mecha', false],   // space
    ['retro_mecha', false],   // underscore
    ['', false],
    ['retro--mecha', true],   // double dash is technically valid per pattern
  ])('"%s" → valid: %s', (slug, expected) => {
    expect(slugPattern.test(slug)).toBe(expected);
  });
});
