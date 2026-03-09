import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError, ForbiddenError } from '../../lib/errors';
import { db } from '../../lib/db';

export async function watchlistsRoutes(app: FastifyInstance) {
  // GET /api/v1/watchlists — user's watchlists
  app.get('/', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const lists = await db.watchlist.findMany({
        where: { userId: request.user.sub },
        include: {
          _count: { select: { items: true } },
          items: {
            take: 4,
            orderBy: { position: 'asc' },
            include: { watchlist: false },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      return reply.send({ data: lists });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/watchlists
  app.post('/', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z
        .object({ name: z.string().min(1).max(128), description: z.string().max(500).optional(), isPublic: z.boolean().default(false) })
        .parse(request.body);

      const list = await db.watchlist.create({
        data: { userId: request.user.sub, ...body },
      });
      return reply.status(201).send({ data: list });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/watchlists/:id
  app.get('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const list = await db.watchlist.findFirst({
        where: {
          id,
          OR: [{ userId: request.user.sub }, { isPublic: true }],
        },
        include: {
          items: {
            orderBy: { position: 'asc' },
            include: {
              watchlist: false,
            },
          },
        },
      });
      if (!list) throw new NotFoundError('Watchlist');
      return reply.send({ data: list });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // PATCH /api/v1/watchlists/:id
  app.patch('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await assertOwnsWatchlist(request.user.sub, id);

      const body = z
        .object({ name: z.string().min(1).max(128).optional(), description: z.string().max(500).optional(), isPublic: z.boolean().optional() })
        .parse(request.body);

      const list = await db.watchlist.update({ where: { id }, data: body });
      return reply.send({ data: list });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/watchlists/:id
  app.delete('/:id', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await assertOwnsWatchlist(request.user.sub, id);
      await db.watchlist.delete({ where: { id } });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/watchlists/:id/items
  app.post('/:id/items', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await assertOwnsWatchlist(request.user.sub, id);

      const body = z
        .object({
          animeId: z.string(),
          status: z.enum(['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED', 'ON_HOLD']).default('PLANNED'),
          note: z.string().max(500).optional(),
        })
        .parse(request.body);

      // Auto-assign position at end
      const maxPos = await db.watchlistItem.aggregate({
        where: { watchlistId: id },
        _max: { position: true },
      });
      const position = (maxPos._max.position ?? -1) + 1;

      const item = await db.watchlistItem.upsert({
        where: { watchlistId_animeId: { watchlistId: id, animeId: body.animeId } },
        create: { watchlistId: id, ...body, position },
        update: { status: body.status, note: body.note },
      });

      // Emit recommendation signal
      await db.recommendationEvent
        .create({
          data: {
            userId: request.user.sub,
            animeId: body.animeId,
            signal: 'FAVORITED',
          },
        })
        .catch(() => {/* non-fatal */});

      return reply.status(201).send({ data: item });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // PATCH /api/v1/watchlists/:id/items/:animeId
  app.patch('/:id/items/:animeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id, animeId } = request.params as { id: string; animeId: string };
      await assertOwnsWatchlist(request.user.sub, id);

      const body = z
        .object({
          status: z.enum(['PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED', 'ON_HOLD']).optional(),
          note: z.string().max(500).optional(),
          position: z.number().int().min(0).optional(),
        })
        .parse(request.body);

      const item = await db.watchlistItem.update({
        where: { watchlistId_animeId: { watchlistId: id, animeId } },
        data: body,
      });
      return reply.send({ data: item });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/watchlists/:id/items/:animeId
  app.delete('/:id/items/:animeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { id, animeId } = request.params as { id: string; animeId: string };
      await assertOwnsWatchlist(request.user.sub, id);
      await db.watchlistItem.delete({
        where: { watchlistId_animeId: { watchlistId: id, animeId } },
      });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // ── Favorites ──────────────────────────────────────────────────────────────

  // GET /api/v1/watchlists/favorites
  app.get('/favorites', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const favorites = await db.favorite.findMany({
        where: { userId: request.user.sub },
        include: {
          anime: {
            select: { id: true, slug: true, title: true, titleEnglish: true, posterUrl: true, backdropUrl: true, type: true, releaseYear: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({ data: favorites });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/watchlists/favorites
  app.post('/favorites', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { animeId } = z.object({ animeId: z.string() }).parse(request.body);
      const fav = await db.favorite.upsert({
        where: { userId_animeId: { userId: request.user.sub, animeId } },
        create: { userId: request.user.sub, animeId },
        update: {},
      });

      await db.recommendationEvent
        .create({ data: { userId: request.user.sub, animeId, signal: 'FAVORITED', weight: 3.0 } })
        .catch(() => {});

      return reply.status(201).send({ data: fav });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/watchlists/favorites/:animeId
  app.delete('/favorites/:animeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { animeId } = request.params as { animeId: string };
      await db.favorite.deleteMany({
        where: { userId: request.user.sub, animeId },
      });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}

async function assertOwnsWatchlist(userId: string, watchlistId: string) {
  const list = await db.watchlist.findFirst({ where: { id: watchlistId, userId }, select: { id: true } });
  if (!list) throw new ForbiddenError('You do not own this watchlist');
}
