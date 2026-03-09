import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError } from '../../lib/errors';
import { db } from '../../lib/db';

export async function watchHistoryRoutes(app: FastifyInstance) {
  // GET /api/v1/watch-history — recent watches
  app.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const q = request.query as Record<string, string>;
      const page = parseInt(q.page ?? '1');
      const limit = Math.min(50, parseInt(q.limit ?? '20'));

      const history = await db.watchHistory.findMany({
        where: { userId: request.user.sub },
        orderBy: { watchedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          anime: { select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true } },
          episode: { select: { id: true, episodeNumber: true, seasonNumber: true, title: true } },
        },
      });

      return reply.send({ data: history });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/watch-history — record a watch event
  app.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z
        .object({
          animeId: z.string(),
          episodeId: z.string().optional(),
          sourceType: z.string().optional(),
          completed: z.boolean().default(false),
        })
        .parse(request.body);

      const entry = await db.watchHistory.create({
        data: { userId: request.user.sub, ...body },
      });

      // Record recommendation signal
      await db.recommendationEvent.create({
        data: {
          userId: request.user.sub,
          animeId: body.animeId,
          signal: body.completed ? 'COMPLETED' : 'WATCHED',
          weight: body.completed ? 2.0 : 1.0,
        },
      });

      return reply.status(201).send({ data: entry });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/watch-history/continue — continue watching list
  app.get('/continue', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      // Get latest incomplete progress per anime
      const progress = await db.watchProgress.findMany({
        where: { userId: request.user.sub, completed: false },
        orderBy: { updatedAt: 'desc' },
        take: 20,
        include: {
          episode: {
            include: {
              anime: { select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, backdropUrl: true } },
            },
          },
        },
      });

      return reply.send({ data: progress });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // PUT /api/v1/watch-history/progress — upsert watch progress
  app.put('/progress', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z
        .object({
          episodeId: z.string(),
          positionSeconds: z.number().int().min(0),
          durationSeconds: z.number().int().positive().optional(),
          completed: z.boolean().default(false),
        })
        .parse(request.body);

      const progress = await db.watchProgress.upsert({
        where: { userId_episodeId: { userId: request.user.sub, episodeId: body.episodeId } },
        create: { userId: request.user.sub, ...body },
        update: {
          positionSeconds: body.positionSeconds,
          durationSeconds: body.durationSeconds,
          completed: body.completed,
        },
      });

      return reply.send({ data: progress });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/watch-history/progress/:episodeId
  app.get('/progress/:episodeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { episodeId } = request.params as { episodeId: string };
      const progress = await db.watchProgress.findUnique({
        where: { userId_episodeId: { userId: request.user.sub, episodeId } },
      });
      return reply.send({ data: progress });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/watch-history/:id
  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      // Ensure the user owns this record
      const entry = await db.watchHistory.findFirst({
        where: { id, userId: request.user.sub },
      });
      if (!entry) throw new NotFoundError('Watch history entry');

      await db.watchHistory.delete({ where: { id } });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
