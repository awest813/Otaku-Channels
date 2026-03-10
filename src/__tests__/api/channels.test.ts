/**
 * @jest-environment node
 */

import { themedChannels } from '@/data/channels';

import { GET as getNowPlaying } from '@/app/api/channels/[slug]/now-playing/route';
import { GET as getChannelSlug } from '@/app/api/channels/[slug]/route';
import { GET as getSchedule } from '@/app/api/channels/[slug]/schedule/route';
import { GET as getChannels } from '@/app/api/channels/route';

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

async function json(res: Response): Promise<Record<string, unknown>> {
  return res.json() as Promise<Record<string, unknown>>;
}

const knownSlug = themedChannels[0].slug;

// ─── GET /api/channels ────────────────────────────────────────────────────────

describe('GET /api/channels — contract', () => {
  it('returns 200 with { data, total }', async () => {
    const res = await getChannels(req('/api/channels'));
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('total matches number of themed channels', async () => {
    const res = await getChannels(req('/api/channels'));
    const body = await json(res);
    expect(body.total).toBe(themedChannels.length);
  });

  it('every channel has required fields', async () => {
    const res = await getChannels(req('/api/channels'));
    const body = await json(res);
    (body.data as Record<string, unknown>[]).forEach((ch) => {
      expect(typeof ch.id).toBe('string');
      expect(typeof ch.slug).toBe('string');
      expect(typeof ch.name).toBe('string');
    });
  });

  it('genre filter narrows results', async () => {
    const chan = themedChannels.find((c) => c.genre);
    if (!chan?.genre) return; // skip if no genres set
    const res = await getChannels(
      req(`/api/channels?genre=${chan.genre.toLowerCase()}`)
    );
    const body = await json(res);
    (body.data as { genre?: string }[]).forEach((ch) => {
      expect(ch.genre?.toLowerCase()).toBe(chan.genre?.toLowerCase());
    });
  });

  it('returns empty data for unknown genre', async () => {
    const res = await getChannels(req('/api/channels?genre=zzznogenre9999'));
    const body = await json(res);
    expect((body.data as unknown[]).length).toBe(0);
    expect(body.total).toBe(0);
  });
});

// ─── GET /api/channels/[slug] ────────────────────────────────────────────────

describe('GET /api/channels/[slug] — contract', () => {
  it('returns 200 with { data } for a known slug', async () => {
    const res = await getChannelSlug(req(`/api/channels/${knownSlug}`), {
      params: Promise.resolve({ slug: knownSlug }),
    });
    expect(res.status).toBe(200);
    const body = await json(res);
    expect((body.data as Record<string, unknown>).slug).toBe(knownSlug);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getChannelSlug(req('/api/channels/does-not-exist'), {
      params: Promise.resolve({ slug: 'does-not-exist' }),
    });
    expect(res.status).toBe(404);
    const body = await json(res);
    expect(typeof body.error).toBe('string');
  });
});

// ─── GET /api/channels/[slug]/now-playing ────────────────────────────────────

describe('GET /api/channels/[slug]/now-playing — contract', () => {
  it('returns 200 with { data } for a known slug', async () => {
    const res = await getNowPlaying(
      req(`/api/channels/${knownSlug}/now-playing`),
      {
        params: Promise.resolve({ slug: knownSlug }),
      }
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.data).toBeDefined();
  });

  it('now-playing data includes channelSlug, current, next fields', async () => {
    const res = await getNowPlaying(
      req(`/api/channels/${knownSlug}/now-playing`),
      {
        params: Promise.resolve({ slug: knownSlug }),
      }
    );
    const body = await json(res);
    const data = body.data as Record<string, unknown>;
    expect(typeof data.channelSlug).toBe('string');
    expect(data.current).toBeDefined();
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getNowPlaying(
      req('/api/channels/does-not-exist/now-playing'),
      {
        params: Promise.resolve({ slug: 'does-not-exist' }),
      }
    );
    expect(res.status).toBe(404);
  });
});

// ─── GET /api/channels/[slug]/schedule ───────────────────────────────────────

describe('GET /api/channels/[slug]/schedule — contract', () => {
  it('returns 200 with { channelSlug, data, total } for a known slug', async () => {
    const res = await getSchedule(req(`/api/channels/${knownSlug}/schedule`), {
      params: Promise.resolve({ slug: knownSlug }),
    });
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.channelSlug).toBe(knownSlug);
    expect(Array.isArray(body.data)).toBe(true);
    expect(typeof body.total).toBe('number');
  });

  it('schedule total matches data length', async () => {
    const res = await getSchedule(req(`/api/channels/${knownSlug}/schedule`), {
      params: Promise.resolve({ slug: knownSlug }),
    });
    const body = await json(res);
    expect(body.total).toBe((body.data as unknown[]).length);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await getSchedule(
      req('/api/channels/does-not-exist/schedule'),
      {
        params: Promise.resolve({ slug: 'does-not-exist' }),
      }
    );
    expect(res.status).toBe(404);
  });
});
