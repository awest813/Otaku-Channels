import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1),
  DIRECT_DATABASE_URL: z.string().min(1).optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16),

  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),

  JIKAN_BASE_URL: z.string().url().default('https://api.jikan.moe/v4'),
  ANILIST_BASE_URL: z.string().url().default('https://graphql.anilist.co'),

  // Kitsu — free public REST API (no key required)
  KITSU_BASE_URL: z.string().url().default('https://kitsu.io/api/edge'),

  // Shikimori — free public GraphQL API (no key required)
  SHIKIMORI_BASE_URL: z.string().url().default('https://shikimori.one/api/graphql'),

  // Consumet — requires self-hosting; leave empty to disable
  CONSUMET_BASE_URL: z.union([z.string().url(), z.literal('')]).default(''),

  // Aniwatch — requires self-hosting; leave empty to disable
  ANIWATCH_BASE_URL: z.union([z.string().url(), z.literal('')]).default(''),

  // Waifu.pics — free public API (no key required)
  WAIFUPICS_BASE_URL: z.string().url().default('https://api.waifu.pics'),

  // AnimeChan — free public API (no key required)
  ANIMECHAN_BASE_URL: z.string().url().default('https://animechan.io'),

  ADMIN_SEED_EMAILS: z.string().default(''),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const config = loadConfig();

export const isProd = config.NODE_ENV === 'production';
export const isDev = config.NODE_ENV === 'development';
export const isTest = config.NODE_ENV === 'test';

// Admin emails that get elevated role on first register
export const adminSeedEmails = config.ADMIN_SEED_EMAILS
  ? config.ADMIN_SEED_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  : [];
