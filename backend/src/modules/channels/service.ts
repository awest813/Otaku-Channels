import { db } from '../../lib/db';
import { cacheGet, cacheSet } from '../../lib/redis';
import { NotFoundError } from '../../lib/errors';

const CHANNEL_INCLUDE = {
  programBlocks: {
    include: {
      anime: {
        select: {
          id: true,
          slug: true,
          title: true,
          titleEnglish: true,
          posterUrl: true,
          backdropUrl: true,
          type: true,
          releaseYear: true,
          rating: true,
        },
      },
    },
    orderBy: { position: 'asc' as const },
  },
  _count: { select: { savedBy: true } },
} as const;

export async function listChannels(opts: {
  visibility?: 'PUBLIC' | 'UNLISTED' | 'DRAFT' | 'ARCHIVED';
  featured?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(50, opts.limit ?? 20);

  const where: any = { visibility: opts.visibility ?? 'PUBLIC' };
  if (opts.featured !== undefined) where.isFeatured = opts.featured;
  if (opts.type) where.type = opts.type;

  const [channels, total] = await Promise.all([
    db.channel.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
      include: CHANNEL_INCLUDE,
    }),
    db.channel.count({ where }),
  ]);

  return { data: channels, total, page, limit };
}

export async function getChannelBySlug(slug: string) {
  const cacheKey = `channel:${slug}`;
  const cached = await cacheGet<object>(cacheKey);
  if (cached) return cached;

  const channel = await db.channel.findUnique({
    where: { slug },
    include: CHANNEL_INCLUDE,
  });
  if (!channel || channel.visibility === 'DRAFT' || channel.visibility === 'ARCHIVED') {
    throw new NotFoundError('Channel');
  }

  await cacheSet(cacheKey, channel, 120);
  return channel;
}

// ─── Pseudo-live schedule ────────────────────────────────────────────────────
//
// A channel's schedule is a repeating list of slots. To determine "what is
// on now", we use the epoch-based rotation:
//   totalDuration = sum of all slot durations
//   offset = (now - epoch) % totalDuration
//   walk slots until offset is exhausted → current slot
//
// The epoch is Jan 1 2024 00:00:00 UTC (stable reference point).

const SCHEDULE_EPOCH = new Date('2024-01-01T00:00:00Z').getTime();

export interface NowPlayingResult {
  channelSlug: string;
  current: ScheduleSlot;
  next: ScheduleSlot | null;
  progressPercent: number;
  remainingSec: number;
}

interface ScheduleSlot {
  slotIndex: number;
  label?: string | null;
  animeId?: string | null;
  episodeId?: string | null;
  durationSec: number;
  startOffsetSec: number; // offset from epoch cycle start
  anime?: {
    slug: string;
    title: string;
    titleEnglish?: string | null;
    posterUrl?: string | null;
  } | null;
}

export async function getNowPlaying(channelSlug: string): Promise<NowPlayingResult> {
  const cacheKey = `nowplaying:${channelSlug}`;
  // Short cache — 30s — so UI updates roughly in real time
  const cached = await cacheGet<NowPlayingResult>(cacheKey);
  if (cached) return cached;

  const channel = await db.channel.findUnique({
    where: { slug: channelSlug },
    include: {
      schedules: {
        orderBy: { slotIndex: 'asc' },
        include: {
          channel: false,
        },
      },
    },
  });

  if (!channel) throw new NotFoundError('Channel');

  // If channel has no schedule, fall back to program blocks in order
  if (channel.schedules.length === 0) {
    return buildFallbackNowPlaying(channel);
  }

  const slots = channel.schedules;
  const totalDurationSec = slots.reduce((s, slot) => s + slot.durationSec, 0);

  if (totalDurationSec === 0) return buildFallbackNowPlaying(channel);

  const nowSec = Math.floor((Date.now() - SCHEDULE_EPOCH) / 1000);
  const cycleOffsetSec = nowSec % totalDurationSec;

  let accumulated = 0;
  let currentSlot: (typeof slots)[0] | null = null;

  for (const slot of slots) {
    if (cycleOffsetSec < accumulated + slot.durationSec) {
      currentSlot = slot;
      break;
    }
    accumulated += slot.durationSec;
  }

  if (!currentSlot) currentSlot = slots[0];

  // Next slot
  const currentIdx = slots.indexOf(currentSlot!);
  const nextSlot = slots[(currentIdx + 1) % slots.length] ?? null;

  // Enrich with anime info
  const animeIds = [currentSlot!.animeId, nextSlot?.animeId].filter(Boolean) as string[];
  const animeMap: Record<string, any> = {};
  if (animeIds.length > 0) {
    const animes = await db.animeTitle.findMany({
      where: { id: { in: animeIds } },
      select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true },
    });
    for (const a of animes) animeMap[a.id] = a;
  }

  const progressSec = cycleOffsetSec - accumulated;
  const progressPercent = Math.round((progressSec / currentSlot!.durationSec) * 100);
  const remainingSec = currentSlot!.durationSec - progressSec;

  const result: NowPlayingResult = {
    channelSlug,
    current: {
      slotIndex: currentSlot!.slotIndex,
      label: currentSlot!.label,
      animeId: currentSlot!.animeId,
      episodeId: currentSlot!.episodeId,
      durationSec: currentSlot!.durationSec,
      startOffsetSec: accumulated,
      anime: currentSlot!.animeId ? animeMap[currentSlot!.animeId] ?? null : null,
    },
    next: nextSlot
      ? {
          slotIndex: nextSlot.slotIndex,
          label: nextSlot.label,
          animeId: nextSlot.animeId,
          episodeId: nextSlot.episodeId,
          durationSec: nextSlot.durationSec,
          startOffsetSec: accumulated + currentSlot!.durationSec,
          anime: nextSlot.animeId ? animeMap[nextSlot.animeId] ?? null : null,
        }
      : null,
    progressPercent,
    remainingSec,
  };

  await cacheSet(cacheKey, result, 30);
  return result;
}

async function buildFallbackNowPlaying(channel: any): Promise<NowPlayingResult> {
  // Use first program block as "now playing" when no schedule configured
  const blocks = await db.channelProgramBlock.findMany({
    where: { channelId: channel.id },
    orderBy: { position: 'asc' },
    take: 2,
    include: {
      anime: { select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true } },
    },
  });

  const current = blocks[0];
  const next = blocks[1] ?? null;

  return {
    channelSlug: channel.slug,
    current: current
      ? { slotIndex: 0, label: current.label, animeId: current.animeId, episodeId: null, durationSec: 1440, startOffsetSec: 0, anime: current.anime }
      : { slotIndex: 0, label: 'Coming soon', animeId: null, episodeId: null, durationSec: 1440, startOffsetSec: 0, anime: null },
    next: next
      ? { slotIndex: 1, label: next.label, animeId: next.animeId, episodeId: null, durationSec: 1440, startOffsetSec: 1440, anime: next.anime }
      : null,
    progressPercent: 0,
    remainingSec: 1440,
  };
}
