import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError } from '../../lib/errors';
import { db } from '../../lib/db';
import { revokeAllUserSessions } from '../auth/service';

export async function adminRoutes(app: FastifyInstance) {
  // All admin routes require ADMIN or MODERATOR role
  app.addHook('preHandler', requireAuth);

  // ── Dashboard stats ────────────────────────────────────────────────────────

  app.get('/stats', { preHandler: [requireRole('ADMIN', 'MODERATOR')] }, async (_req, reply) => {
    try {
      const [users, anime, channels, pendingSources, openReports] = await Promise.all([
        db.user.count(),
        db.animeTitle.count(),
        db.channel.count({ where: { visibility: 'PUBLIC' } }),
        db.contentSource.count({ where: { status: 'PENDING_REVIEW' } }),
        db.report.count({ where: { status: 'OPEN' } }),
      ]);

      return reply.send({ data: { users, anime, channels, pendingSources, openReports } });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // ── User management ────────────────────────────────────────────────────────

  app.patch(
    '/users/:id/ban',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { banned, reason } = z
          .object({ banned: z.boolean(), reason: z.string().optional() })
          .parse(request.body);

        const user = await db.user.update({
          where: { id },
          data: { isBanned: banned },
          select: { id: true, email: true, isBanned: true },
        });

        if (banned) await revokeAllUserSessions(id);

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: banned ? 'BAN_USER' : 'UNBAN_USER',
            targetType: 'USER',
            targetId: id,
            metadata: { reason },
          },
        });

        return reply.send({ data: user });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.patch(
    '/users/:id/role',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { role } = z.object({ role: z.enum(['USER', 'MODERATOR', 'ADMIN']) }).parse(request.body);

        const user = await db.user.update({
          where: { id },
          data: { role },
          select: { id: true, email: true, role: true },
        });

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'CHANGE_USER_ROLE',
            targetType: 'USER',
            targetId: id,
            metadata: { role },
          },
        });

        return reply.send({ data: user });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── Anime management ───────────────────────────────────────────────────────

  app.patch(
    '/anime/:id/visibility',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { isVisible, isFeatured } = z
          .object({ isVisible: z.boolean().optional(), isFeatured: z.boolean().optional() })
          .parse(request.body);

        const anime = await db.animeTitle.update({
          where: { id },
          data: { isVisible, isFeatured },
          select: { id: true, slug: true, isVisible: true, isFeatured: true },
        });

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'UPDATE_ANIME_VISIBILITY',
            targetType: 'ANIME',
            targetId: id,
            metadata: { isVisible, isFeatured },
          },
        });

        return reply.send({ data: anime });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // POST /api/v1/admin/anime/merge — merge duplicate titles
  app.post(
    '/anime/merge',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const { sourceId, targetId } = z
          .object({ sourceId: z.string(), targetId: z.string() })
          .parse(request.body);

        // Move all relations from sourceId to targetId, then hide source
        await Promise.all([
          db.contentSource.updateMany({ where: { animeId: sourceId }, data: { animeId: targetId } }),
          db.favorite.updateMany({ where: { animeId: sourceId }, data: { animeId: targetId } }),
          db.watchHistory.updateMany({ where: { animeId: sourceId }, data: { animeId: targetId } }),
          db.episode.updateMany({ where: { animeId: sourceId }, data: { animeId: targetId } }),
          db.animeAlias.updateMany({ where: { animeId: sourceId }, data: { animeId: targetId } }),
        ]);
        await db.animeTitle.update({ where: { id: sourceId }, data: { isVisible: false } });

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'MERGE_ANIME',
            targetType: 'ANIME',
            targetId: targetId,
            metadata: { sourceId, targetId },
          },
        });

        return reply.send({ ok: true, mergedInto: targetId });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── Reports ────────────────────────────────────────────────────────────────

  app.get(
    '/reports',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const q = request.query as Record<string, string>;
        const status = q.status ?? 'OPEN';
        const reports = await db.report.findMany({
          where: { status: status as any },
          orderBy: { createdAt: 'asc' },
          include: {
            reporter: { select: { id: true, username: true } },
          },
        });
        return reply.send({ data: reports });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.patch(
    '/reports/:id',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { status } = z
          .object({ status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']) })
          .parse(request.body);

        const report = await db.report.update({
          where: { id },
          data: { status: status as any, resolvedBy: request.user.sub, resolvedAt: new Date() },
        });
        return reply.send({ data: report });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── Audit log ──────────────────────────────────────────────────────────────

  app.get(
    '/audit',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const q = request.query as Record<string, string>;
        const page = parseInt(q.page ?? '1');
        const limit = Math.min(100, parseInt(q.limit ?? '50'));

        const logs = await db.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { actor: { select: { id: true, username: true, role: true } } },
        });

        return reply.send({ data: logs, page });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── Reports: user submission ───────────────────────────────────────────────
  // This is user-facing but proxied via admin module for simplicity
  app.post('/reports', async (request, reply) => {
    try {
      await requireAuth(request, reply);
      const body = z
        .object({
          targetType: z.enum(['ANIME', 'SOURCE', 'USER', 'CHANNEL']),
          targetId: z.string(),
          reason: z.string().min(3).max(500),
          details: z.string().max(2000).optional(),
        })
        .parse(request.body);

      const report = await db.report.create({
        data: { reportedBy: request.user.sub, ...body },
      });

      return reply.status(201).send({ data: report });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
