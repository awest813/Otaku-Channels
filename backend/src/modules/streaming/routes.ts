/**
 * Streaming routes — powered by Consumet API
 *
 * These endpoints proxy to a self-hosted Consumet instance to retrieve
 * live streaming links from supported providers (Gogoanime, Zoro, etc.).
 *
 * All endpoints require CONSUMET_BASE_URL to be configured; otherwise they
 * return 503 with a clear message.
 *
 * Routes:
 *   GET /api/v1/streaming/providers          — list supported providers
 *   GET /api/v1/streaming/search             — search on a provider
 *   GET /api/v1/streaming/info               — get anime info + episodes
 *   GET /api/v1/streaming/sources            — get video sources for an episode
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendError, BadRequestError } from '../../lib/errors';
import {
  searchAnime,
  getAnimeInfo,
  getEpisodeSources,
  isConsumetConfigured,
  SUPPORTED_PROVIDERS,
  type ConsumetProvider,
} from '../../lib/consumet/client';

const PROVIDER_VALUES = SUPPORTED_PROVIDERS as [string, ...string[]];

const ProviderSchema = z
  .string()
  .refine((v): v is ConsumetProvider => SUPPORTED_PROVIDERS.includes(v as ConsumetProvider), {
    message: `Provider must be one of: ${SUPPORTED_PROVIDERS.join(', ')}`,
  });

function assertConfigured() {
  if (!isConsumetConfigured()) {
    throw Object.assign(new Error('Streaming service not configured'), {
      statusCode: 503,
      code: 'CONSUMET_NOT_CONFIGURED',
    });
  }
}

export async function streamingRoutes(app: FastifyInstance) {
  // GET /api/v1/streaming/providers
  app.get('/providers', async (_request, reply) => {
    return reply.send({ data: SUPPORTED_PROVIDERS });
  });

  // GET /api/v1/streaming/search?q=naruto&provider=gogoanime&page=1
  app.get('/search', async (request, reply) => {
    try {
      assertConfigured();

      const q = request.query as Record<string, string>;
      const query = q.q?.trim();
      if (!query) throw new BadRequestError('Missing required query param: q');

      const providerResult = ProviderSchema.safeParse(q.provider ?? 'gogoanime');
      if (!providerResult.success) throw new BadRequestError(providerResult.error.issues[0].message);

      const page = q.page ? Math.max(1, parseInt(q.page, 10)) : 1;

      const results = await searchAnime(query, providerResult.data, page);
      return reply.send({ data: results ?? { results: [], currentPage: page, hasNextPage: false } });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/streaming/info?id=naruto&provider=gogoanime
  app.get('/info', async (request, reply) => {
    try {
      assertConfigured();

      const q = request.query as Record<string, string>;
      const id = q.id?.trim();
      if (!id) throw new BadRequestError('Missing required query param: id');

      const providerResult = ProviderSchema.safeParse(q.provider ?? 'gogoanime');
      if (!providerResult.success) throw new BadRequestError(providerResult.error.issues[0].message);

      const info = await getAnimeInfo(id, providerResult.data);
      if (!info) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Anime not found on provider' } });
      }
      return reply.send({ data: info });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/streaming/sources?episodeId=naruto-episode-1&provider=gogoanime
  app.get('/sources', async (request, reply) => {
    try {
      assertConfigured();

      const q = request.query as Record<string, string>;
      const episodeId = q.episodeId?.trim();
      if (!episodeId) throw new BadRequestError('Missing required query param: episodeId');

      const providerResult = ProviderSchema.safeParse(q.provider ?? 'gogoanime');
      if (!providerResult.success) throw new BadRequestError(providerResult.error.issues[0].message);

      const sources = await getEpisodeSources(episodeId, providerResult.data);
      if (!sources) {
        return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Episode sources not found' } });
      }
      return reply.send({ data: sources });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
