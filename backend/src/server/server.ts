import Fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { config, isProd } from '../config';
import { logger } from '../lib/logger';
import { sendError } from '../lib/errors';
import { redis } from '../lib/redis';

// Route modules
import { authRoutes } from '../modules/auth/routes';
import { usersRoutes } from '../modules/users/routes';
import { animeRoutes } from '../modules/anime/routes';
import { channelsRoutes } from '../modules/channels/routes';
import { sourcesRoutes } from '../modules/sources/routes';
import { searchRoutes } from '../modules/search/routes';
import { watchHistoryRoutes } from '../modules/watch-history/routes';
import { watchlistsRoutes } from '../modules/watchlists/routes';
import { recommendationsRoutes } from '../modules/recommendations/routes';
import { adminRoutes } from '../modules/admin/routes';
import { streamingRoutes } from '../modules/streaming/routes';
import { profilesRoutes } from '../modules/profiles/routes';
import { moderationRoutes } from '../modules/moderation/routes';

export async function buildServer() {
  const app = Fastify({
    logger: false, // We use pino directly
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  });

  // ─── Request logging ────────────────────────────────────────────────────────
  app.addHook('onRequest', async (request) => {
    logger.info(
      { reqId: request.id, method: request.method, url: request.url },
      'Incoming request',
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.info(
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        status: reply.statusCode,
        ms: reply.elapsedTime.toFixed(1),
      },
      'Request completed',
    );
  });

  // ─── Security ───────────────────────────────────────────────────────────────
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: isProd,
    crossOriginEmbedderPolicy: false,
  });

  await app.register(fastifyCors, {
    origin: [config.FRONTEND_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(fastifyCookie, { secret: config.COOKIE_SECRET });

  // ─── Rate limiting ───────────────────────────────────────────────────────────
  await app.register(fastifyRateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    redis,
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: () => ({
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down.' },
    }),
  });

  // ─── JWT ─────────────────────────────────────────────────────────────────────
  await app.register(fastifyJwt, {
    secret: config.JWT_SECRET,
    sign: { expiresIn: config.JWT_ACCESS_TTL },
    cookie: { cookieName: 'access_token', signed: false },
  });

  // ─── OpenAPI docs (dev only) ─────────────────────────────────────────────────
  if (!isProd) {
    await app.register(fastifySwagger, {
      openapi: {
        info: { title: 'Otaku Channels API', version: '0.1.0' },
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          },
        },
      },
    });
    await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
  }

  // ─── Global error handler ────────────────────────────────────────────────────
  app.setErrorHandler((err, request, reply) => {
    logger.error({ reqId: request.id, err }, 'Unhandled error');
    sendError(reply, err);
  });

  // ─── Health / readiness ──────────────────────────────────────────────────────
  app.get('/health', { config: { rateLimit: false } as any }, async () => ({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  }));

  app.get('/ready', { config: { rateLimit: false } as any }, async (_req, reply) => {
    try {
      // Quick checks for critical dependencies
      const { db } = await import('../lib/db');
      await db.$queryRaw`SELECT 1`;
      await redis.ping();
      return reply.send({ status: 'ready' });
    } catch (err) {
      logger.error({ err }, 'Readiness check failed');
      return reply.status(503).send({ status: 'not_ready' });
    }
  });

  // ─── API routes ──────────────────────────────────────────────────────────────
  const API = '/api/v1';

  await app.register(authRoutes, { prefix: `${API}/auth` });
  await app.register(usersRoutes, { prefix: `${API}/users` });
  await app.register(animeRoutes, { prefix: `${API}/anime` });
  await app.register(channelsRoutes, { prefix: `${API}/channels` });
  await app.register(sourcesRoutes, { prefix: `${API}/sources` });
  await app.register(searchRoutes, { prefix: `${API}/search` });
  await app.register(watchHistoryRoutes, { prefix: `${API}/watch-history` });
  await app.register(watchlistsRoutes, { prefix: `${API}/watchlists` });
  await app.register(recommendationsRoutes, { prefix: `${API}/recommendations` });
  await app.register(adminRoutes, { prefix: `${API}/admin` });
  await app.register(streamingRoutes, { prefix: `${API}/streaming` });
  await app.register(profilesRoutes, { prefix: `${API}/profiles` });
  await app.register(moderationRoutes, { prefix: `${API}/moderation` });

  return app;
}
