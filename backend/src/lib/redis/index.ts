import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../logger';

export const redis = new Redis(config.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));

export async function connectRedis() {
  await redis.connect();
}

export async function disconnectRedis() {
  await redis.quit();
  logger.info('Redis disconnected');
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSec = DEFAULT_TTL) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
  } catch {
    // Cache failures are non-fatal
  }
}

export async function cacheDel(key: string) {
  try {
    await redis.del(key);
  } catch {
    // Non-fatal
  }
}

export async function cacheDelPattern(pattern: string) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Non-fatal
  }
}
