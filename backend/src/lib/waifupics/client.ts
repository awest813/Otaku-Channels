/**
 * Waifu.pics API client
 *
 * Waifu.pics is a free anime image sharing platform providing random SFW/NSFW
 * anime images via a simple REST API. Only SFW types are used here.
 *
 * API Docs: https://waifu.pics/docs
 * Base URL: https://api.waifu.pics
 *
 * Rate limit: ~60 req/min (no API key required)
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.WAIFUPICS_BASE_URL;

/** All supported SFW image types. */
export const SFW_TYPES = [
  'waifu',
  'neko',
  'shinobu',
  'megumin',
  'bully',
  'cuddle',
  'cry',
  'hug',
  'awoo',
  'kiss',
  'lick',
  'pat',
  'smug',
  'bonk',
  'yeet',
  'blush',
  'smile',
  'wave',
  'highfive',
  'handhold',
  'nom',
  'bite',
  'glomp',
  'slap',
  'kill',
  'kick',
  'happy',
  'wink',
  'poke',
  'dance',
  'cringe',
] as const;

export type WaifuPicsSfwType = (typeof SFW_TYPES)[number];

export interface WaifuPicsImage {
  url: string;
}

async function waifuFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
      ...init,
    });

    if (res.status === 429) {
      logger.warn({ url }, 'Waifu.pics rate limited — backing off 2s');
      await new Promise((r) => setTimeout(r, 2_000));
      return waifuFetch<T>(path, init); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'Waifu.pics non-OK response');
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    logger.error({ url, err }, 'Waifu.pics fetch error');
    return null;
  }
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Fetch a single random SFW anime image of the given type. */
export async function getRandomImage(
  type: WaifuPicsSfwType = 'waifu'
): Promise<string | null> {
  const result = await waifuFetch<WaifuPicsImage>(`/sfw/${type}`, {
    method: 'GET',
  });
  return result?.url ?? null;
}

/**
 * Fetch many (up to 30) random SFW images of the given type at once.
 * Uses the /many endpoint which returns an array of URLs.
 */
export async function getManyImages(
  type: WaifuPicsSfwType = 'waifu',
  exclude: string[] = []
): Promise<string[]> {
  const result = await waifuFetch<{ files: string[] }>(`/many/sfw/${type}`, {
    method: 'POST',
    body: JSON.stringify({ exclude }),
  });
  return result?.files ?? [];
}
