/**
 * Deterministic pseudo-live channel schedule engine.
 *
 * All clients see the same content at the same time because scheduling is
 * derived from a fixed epoch using modular arithmetic — no random state,
 * no server coordination required.
 *
 * Algorithm
 * ---------
 * 1. Compute `cycleSec = (now - EPOCH) / 1000`, clamped to ≥ 0.
 * 2. `cycleOffset = cycleSec % totalDuration` — position within the repeating
 *    cycle in seconds.
 * 3. Walk the `scheduleSlots` array, accumulating durations until we cross
 *    `cycleOffset` — that slot is "now playing".
 * 4. The immediately following slot (wrapping at the end) is "up next".
 */

import { getChannelBySlug, themedChannels } from '@/data/channels';

import type {
  ChannelWithSchedule,
  NowPlayingResult,
  ScheduleSlot,
} from '@/types';

/** Fixed reference point shared by all clients. */
export const SCHEDULE_EPOCH = new Date('2024-01-01T00:00:00Z').getTime();

// ─── Core computation ─────────────────────────────────────────────────────────

/**
 * Compute the currently-airing and next-airing slots for `channel` at the
 * given wall-clock time (`nowMs` defaults to `Date.now()`).
 *
 * Always returns a result — if the channel has no schedule slots, a synthetic
 * "Off Air" entry is returned so the UI never breaks.
 */
export function computeNowPlaying(
  channel: ChannelWithSchedule,
  nowMs = Date.now()
): NowPlayingResult {
  const slots = channel.scheduleSlots;

  if (slots.length === 0) {
    const offAir: ScheduleSlot = {
      slotIndex: 0,
      label: 'Off Air',
      seriesTitle: channel.name,
      durationSec: 3600,
    };
    return {
      channelSlug: channel.slug,
      current: { ...offAir, progressPercent: 0, remainingSec: 3600 },
      next: null,
    };
  }

  const totalDurationSec = slots.reduce((acc, s) => acc + s.durationSec, 0);

  // Elapsed seconds since epoch, clamped to ≥ 0 for robustness.
  const elapsedSec = Math.max(0, Math.floor((nowMs - SCHEDULE_EPOCH) / 1000));
  const cycleOffsetSec = elapsedSec % totalDurationSec;

  // Walk slots to find the current one.
  let accumulated = 0;
  let currentSlot = slots[0];
  let slotStartSec = 0;

  for (const slot of slots) {
    if (cycleOffsetSec < accumulated + slot.durationSec) {
      currentSlot = slot;
      slotStartSec = accumulated;
      break;
    }
    accumulated += slot.durationSec;
  }

  const currentIdx = slots.indexOf(currentSlot);
  const nextSlot = slots[(currentIdx + 1) % slots.length] ?? null;

  const progressSec = cycleOffsetSec - slotStartSec;
  const progressPercent = Math.min(
    100,
    Math.round((progressSec / currentSlot.durationSec) * 100)
  );
  const remainingSec = Math.max(0, currentSlot.durationSec - progressSec);

  return {
    channelSlug: channel.slug,
    current: { ...currentSlot, progressPercent, remainingSec },
    // Don't surface "next" if it's the same slot (single-slot schedule).
    next: slots.length > 1 ? nextSlot : null,
  };
}

// ─── Schedule / timetable helpers ─────────────────────────────────────────────

export interface ScheduleEntry extends ScheduleSlot {
  /** UTC epoch-ms when this slot starts in the current cycle. */
  startsAtMs: number;
  /** UTC epoch-ms when this slot ends. */
  endsAtMs: number;
  /** Whether this slot is currently airing (at `nowMs`). */
  isNow: boolean;
}

/**
 * Return the full schedule for the **current cycle** of `channel`, annotated
 * with absolute start/end times so the UI can render a real clock-based
 * program guide.
 *
 * The returned array is always ordered by `slotIndex` (i.e. schedule order).
 */
export function computeSchedule(
  channel: ChannelWithSchedule,
  nowMs = Date.now()
): ScheduleEntry[] {
  const slots = channel.scheduleSlots;
  if (slots.length === 0) return [];

  const totalDurationSec = slots.reduce((acc, s) => acc + s.durationSec, 0);
  const elapsedSec = Math.max(0, Math.floor((nowMs - SCHEDULE_EPOCH) / 1000));

  // Start of the current cycle (seconds since epoch).
  const cycleStartSec = elapsedSec - (elapsedSec % totalDurationSec);
  const cycleStartMs = SCHEDULE_EPOCH + cycleStartSec * 1000;

  const cycleOffsetSec = elapsedSec % totalDurationSec;

  let offsetSec = 0;
  return slots.map((slot) => {
    const startsAtMs = cycleStartMs + offsetSec * 1000;
    const endsAtMs = startsAtMs + slot.durationSec * 1000;
    const isNow =
      cycleOffsetSec >= offsetSec &&
      cycleOffsetSec < offsetSec + slot.durationSec;
    offsetSec += slot.durationSec;
    return { ...slot, startsAtMs, endsAtMs, isNow };
  });
}

// ─── Public convenience API ───────────────────────────────────────────────────

/** List all themed channels with their live `nowPlaying` / `nextUp` strings
 *  populated from the schedule engine. */
export function listChannelsLive(nowMs = Date.now()): ChannelWithSchedule[] {
  return themedChannels.map((ch) => {
    const { current, next } = computeNowPlaying(ch, nowMs);
    return {
      ...ch,
      nowPlaying: current.label,
      nextUp: next?.label,
    };
  });
}

/** Get a single channel by slug with live `nowPlaying` / `nextUp` strings. */
export function getChannelLive(
  slug: string,
  nowMs = Date.now()
): ChannelWithSchedule | null {
  const ch = getChannelBySlug(slug);
  if (!ch) return null;
  const { current, next } = computeNowPlaying(ch, nowMs);
  return {
    ...ch,
    nowPlaying: current.label,
    nextUp: next?.label,
  };
}

/** Format `remainingSec` as a human-readable string (e.g. "18 min", "1 h 02 min"). */
export function formatRemaining(remainingSec: number): string {
  if (remainingSec <= 0) return '0 min';
  const hours = Math.floor(remainingSec / 3600);
  const mins = Math.floor((remainingSec % 3600) / 60);
  if (hours > 0) {
    return `${hours} h ${String(mins).padStart(2, '0')} min`;
  }
  return `${mins} min`;
}

/** Format an epoch-ms timestamp as a local time string (e.g. "9:30 PM"). */
export function formatSlotTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}
