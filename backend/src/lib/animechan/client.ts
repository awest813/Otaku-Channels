/**
 * AnimeChan API client
 *
 * AnimeChan provides a free REST API for random anime quotes with character
 * and anime title metadata.
 *
 * API Docs: https://animechan.io/docs
 * Base URL: https://animechan.io
 *
 * Rate limit: 100 req/hour per IP (no API key required)
 */

import { config } from '../../config';
import { logger } from '../logger';

const BASE = config.ANIMECHAN_BASE_URL;

async function animechanFetch<T>(path: string): Promise<T | null> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });

    if (res.status === 429) {
      logger.warn({ url }, 'AnimeChan rate limited — backing off 5s');
      await new Promise((r) => setTimeout(r, 5_000));
      return animechanFetch<T>(path); // one retry
    }

    if (!res.ok) {
      logger.warn({ url, status: res.status }, 'AnimeChan non-OK response');
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    logger.error({ url, err }, 'AnimeChan fetch error');
    return null;
  }
}

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface AnimeQuote {
  /** The quote text. */
  content: string;
  /** Name of the character who said the quote. */
  character: {
    name: string;
    image: string | null;
  };
  /** The anime the quote is from. */
  anime: {
    name: string;
    image: string | null;
    slug: string;
  };
}

// ─── API methods ──────────────────────────────────────────────────────────────

/** Fetch a single random anime quote. */
export async function getRandomQuote(): Promise<AnimeQuote | null> {
  return animechanFetch<AnimeQuote>('/api/v1/quotes/random');
}

/**
 * Fetch multiple random anime quotes (up to 10 per request).
 * @param count Number of quotes to fetch (1-10).
 */
export async function getRandomQuotes(count = 5): Promise<AnimeQuote[]> {
  const n = Math.min(Math.max(1, count), 10);
  const result = await animechanFetch<AnimeQuote[]>(
    `/api/v1/quotes/random?count=${n}`
  );
  return result ?? [];
}

/**
 * Fetch a random quote from a specific anime title.
 * @param anime Anime title to filter by (URL-encoded internally).
 */
export async function getQuoteByAnime(
  anime: string
): Promise<AnimeQuote | null> {
  const encoded = encodeURIComponent(anime);
  return animechanFetch<AnimeQuote>(`/api/v1/quotes/random?anime=${encoded}`);
}

/**
 * Fetch a random quote from a specific character.
 * @param character Character name to filter by.
 */
export async function getQuoteByCharacter(
  character: string
): Promise<AnimeQuote | null> {
  const encoded = encodeURIComponent(character);
  return animechanFetch<AnimeQuote>(
    `/api/v1/quotes/random?character=${encoded}`
  );
}
