/**
 * Tests for the deterministic channel schedule engine.
 *
 * All tests use a synthetic ChannelWithSchedule so they don't depend on
 * real channel data changing over time.
 */

import {
  computeNowPlaying,
  computeSchedule,
  formatRemaining,
  SCHEDULE_EPOCH,
} from '@/lib/channelSchedule';

import type { ChannelWithSchedule } from '@/types';

// ─── Test fixture ─────────────────────────────────────────────────────────────

/** A minimal channel with three slots of varying lengths. */
const makeChannel = (
  slots: Array<{ label: string; durationSec: number }>
): ChannelWithSchedule => ({
  id: 'test',
  slug: 'test-channel',
  name: 'Test Channel',
  description: 'A test channel',
  thumbnail: '',
  channelNumber: '999',
  sourceName: 'Test',
  sourceType: 'live',
  isEmbeddable: false,
  watchUrl: '/channels/test-channel',
  tags: [],
  nowPlaying: '',
  scheduleSlots: slots.map((s, i) => ({
    slotIndex: i,
    label: s.label,
    seriesTitle: s.label,
    durationSec: s.durationSec,
  })),
});

// Three slots: A (1440 s), B (1440 s), C (2880 s). Total = 5760 s.
const threeSlotChannel = makeChannel([
  { label: 'Show A', durationSec: 1440 },
  { label: 'Show B', durationSec: 1440 },
  { label: 'Show C', durationSec: 2880 },
]);

/** Helper: compute nowMs at `offsetSec` seconds after EPOCH. */
const atOffset = (offsetSec: number) => SCHEDULE_EPOCH + offsetSec * 1000;

// ─── computeNowPlaying ────────────────────────────────────────────────────────

describe('computeNowPlaying', () => {
  it('returns first slot at the epoch', () => {
    const result = computeNowPlaying(threeSlotChannel, atOffset(0));
    expect(result.current.label).toBe('Show A');
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.remainingSec).toBe(1440);
  });

  it('transitions to the second slot after 1440 s', () => {
    const result = computeNowPlaying(threeSlotChannel, atOffset(1440));
    expect(result.current.label).toBe('Show B');
    expect(result.current.progressPercent).toBe(0);
    expect(result.current.remainingSec).toBe(1440);
  });

  it('transitions to the third slot after 2880 s', () => {
    const result = computeNowPlaying(threeSlotChannel, atOffset(2880));
    expect(result.current.label).toBe('Show C');
  });

  it('wraps back to the first slot after a full cycle', () => {
    const totalSec = 1440 + 1440 + 2880; // 5760
    const result = computeNowPlaying(threeSlotChannel, atOffset(totalSec));
    expect(result.current.label).toBe('Show A');
  });

  it('wraps correctly across multiple cycles', () => {
    const totalSec = 1440 + 1440 + 2880; // 5760
    // Three full cycles + 500 s into the first slot of the fourth cycle
    const result = computeNowPlaying(
      threeSlotChannel,
      atOffset(totalSec * 3 + 500)
    );
    expect(result.current.label).toBe('Show A');
  });

  it('computes progress percentage correctly at 50% through a slot', () => {
    // 720 s into Show A (50% of 1440 s)
    const result = computeNowPlaying(threeSlotChannel, atOffset(720));
    expect(result.current.progressPercent).toBe(50);
    expect(result.current.remainingSec).toBe(720);
  });

  it('provides the correct next slot', () => {
    const result = computeNowPlaying(threeSlotChannel, atOffset(0));
    expect(result.next?.label).toBe('Show B');
  });

  it('wraps next slot to the first slot when at the last slot', () => {
    // Show C starts at offset 2880
    const result = computeNowPlaying(threeSlotChannel, atOffset(2880));
    expect(result.current.label).toBe('Show C');
    expect(result.next?.label).toBe('Show A');
  });

  it('returns null for next when the schedule has only one slot', () => {
    const singleSlot = makeChannel([{ label: 'Solo Show', durationSec: 3600 }]);
    const result = computeNowPlaying(singleSlot, atOffset(0));
    expect(result.next).toBeNull();
  });

  it('returns an "Off Air" fallback when there are no slots', () => {
    const empty = makeChannel([]);
    const result = computeNowPlaying(empty, atOffset(0));
    expect(result.current.label).toBe('Off Air');
    expect(result.next).toBeNull();
  });

  it('handles a nowMs before EPOCH gracefully (clamps to 0)', () => {
    const result = computeNowPlaying(
      threeSlotChannel,
      SCHEDULE_EPOCH - 999_999
    );
    expect(result.current.label).toBe('Show A');
  });

  it('caps progressPercent at 100', () => {
    // All edge-case times should still yield valid 0-100 range
    const result = computeNowPlaying(threeSlotChannel, atOffset(1439));
    expect(result.current.progressPercent).toBeGreaterThanOrEqual(0);
    expect(result.current.progressPercent).toBeLessThanOrEqual(100);
  });
});

// ─── computeSchedule ─────────────────────────────────────────────────────────

describe('computeSchedule', () => {
  it('returns the correct number of entries', () => {
    const schedule = computeSchedule(threeSlotChannel, atOffset(0));
    expect(schedule).toHaveLength(3);
  });

  it('marks exactly one slot as isNow', () => {
    const schedule = computeSchedule(threeSlotChannel, atOffset(100));
    const nowSlots = schedule.filter((s) => s.isNow);
    expect(nowSlots).toHaveLength(1);
    expect(nowSlots[0].label).toBe('Show A');
  });

  it('marks the correct slot as isNow at 1440 s', () => {
    const schedule = computeSchedule(threeSlotChannel, atOffset(1440));
    const nowSlot = schedule.find((s) => s.isNow);
    expect(nowSlot?.label).toBe('Show B');
  });

  it('annotates start/end times relative to the current cycle start', () => {
    const nowMs = atOffset(0); // exactly at epoch — cycle start = epoch
    const schedule = computeSchedule(threeSlotChannel, nowMs);

    expect(schedule[0].startsAtMs).toBe(SCHEDULE_EPOCH);
    expect(schedule[0].endsAtMs).toBe(SCHEDULE_EPOCH + 1440 * 1000);
    expect(schedule[1].startsAtMs).toBe(SCHEDULE_EPOCH + 1440 * 1000);
    expect(schedule[2].startsAtMs).toBe(SCHEDULE_EPOCH + 2880 * 1000);
  });

  it('returns an empty array for a channel with no slots', () => {
    const empty = makeChannel([]);
    expect(computeSchedule(empty, atOffset(0))).toEqual([]);
  });
});

// ─── formatRemaining ─────────────────────────────────────────────────────────

describe('formatRemaining', () => {
  it('formats 0 seconds', () => {
    expect(formatRemaining(0)).toBe('0 min');
  });

  it('formats negative seconds as 0 min', () => {
    expect(formatRemaining(-60)).toBe('0 min');
  });

  it('formats sub-minute durations as "0 min"', () => {
    expect(formatRemaining(30)).toBe('0 min');
  });

  it('formats minutes under an hour', () => {
    expect(formatRemaining(1440)).toBe('24 min');
  });

  it('formats hours and minutes', () => {
    expect(formatRemaining(3660)).toBe('1 h 01 min');
  });

  it('formats exactly 1 hour', () => {
    expect(formatRemaining(3600)).toBe('1 h 00 min');
  });
});
