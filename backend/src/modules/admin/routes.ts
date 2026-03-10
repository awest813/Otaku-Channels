import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError } from '../../lib/errors';
import { db } from '../../lib/db';
import { revokeAllUserSessions } from '../auth/service';
import {
  metadataRefreshQueue,
  sourceCheckQueue,
  trendingRecomputeQueue,
  sessionCleanupQueue,
} from '../../lib/jobs';

export async function adminRoutes(app: FastifyInstance) {
  // All admin routes require authentication
  app.addHook('preHandler', requireAuth);

  // ── Dashboard stats ────────────────────────────────────────────────────────

  app.get('/stats', { preHandler: [requireRole('ADMIN', 'MODERATOR')] }, async (_req, reply) => {
    try {
      const [users, anime, channels, pendingSources, openReports, bannedUsers, hiddenAnime] =
        await Promise.all([
          db.user.count(),
          db.animeTitle.count(),
          db.channel.count({ where: { visibility: 'PUBLIC' } }),
          db.contentSource.count({ where: { status: 'PENDING_REVIEW' } }),
          db.report.count({ where: { status: 'OPEN' } }),
          db.user.count({ where: { isBanned: true } }),
          db.animeTitle.count({ where: { isVisible: false } }),
        ]);

      return reply.send({
        data: { users, anime, channels, pendingSources, openReports, bannedUsers, hiddenAnime },
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // ── User management ────────────────────────────────────────────────────────

  // GET /admin/users — list users with pagination + search
  app.get(
    '/users',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const q = request.query as Record<string, string>;
        const page = Math.max(1, parseInt(q.page ?? '1'));
        const limit = Math.min(100, parseInt(q.limit ?? '50'));
        const search = q.search?.trim();
        const role = q.role as string | undefined;
        const banned = q.banned === 'true' ? true : q.banned === 'false' ? false : undefined;

        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }
        if (role) where.role = role;
        if (banned !== undefined) where.isBanned = banned;

        const [users, total] = await Promise.all([
          db.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              isBanned: true,
              createdAt: true,
              _count: { select: { watchHistory: true, favorites: true, reports: true } },
            },
          }),
          db.user.count({ where }),
        ]);

        return reply.send({ data: users, total, page, limit });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

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
        const { role } = z
          .object({ role: z.enum(['USER', 'MODERATOR', 'ADMIN']) })
          .parse(request.body);

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

  // GET /admin/anime — list anime for moderation
  app.get(
    '/anime',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const q = request.query as Record<string, string>;
        const page = Math.max(1, parseInt(q.page ?? '1'));
        const limit = Math.min(100, parseInt(q.limit ?? '50'));
        const search = q.search?.trim();
        const isVisible =
          q.isVisible === 'true' ? true : q.isVisible === 'false' ? false : undefined;
        const isFeatured =
          q.isFeatured === 'true' ? true : q.isFeatured === 'false' ? false : undefined;

        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { titleEnglish: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ];
        }
        if (isVisible !== undefined) where.isVisible = isVisible;
        if (isFeatured !== undefined) where.isFeatured = isFeatured;

        const [anime, total] = await Promise.all([
          db.animeTitle.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              slug: true,
              title: true,
              titleEnglish: true,
              type: true,
              status: true,
              isVisible: true,
              isFeatured: true,
              releaseYear: true,
              rating: true,
              malId: true,
              anilistId: true,
              createdAt: true,
              updatedAt: true,
              _count: { select: { contentSources: true, episodes: true } },
            },
          }),
          db.animeTitle.count({ where }),
        ]);

        return reply.send({ data: anime, total, page, limit });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

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
        const page = Math.max(1, parseInt(q.page ?? '1'));
        const limit = Math.min(100, parseInt(q.limit ?? '50'));

        const [reports, total] = await Promise.all([
          db.report.findMany({
            where: { status: status as any },
            orderBy: { createdAt: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
              reporter: { select: { id: true, username: true } },
            },
          }),
          db.report.count({ where: { status: status as any } }),
        ]);

        return reply.send({ data: reports, total, page, limit });
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

  // ── Sources ────────────────────────────────────────────────────────────────

  // GET /admin/sources/broken — content sources with REMOVED status
  app.get(
    '/sources/broken',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const q = request.query as Record<string, string>;
        const page = Math.max(1, parseInt(q.page ?? '1'));
        const limit = Math.min(100, parseInt(q.limit ?? '50'));
        const half = Math.ceil(limit / 2);

        const [titleSources, episodeSources, titleTotal, episodeTotal] = await Promise.all([
          db.contentSource.findMany({
            where: { status: 'REMOVED' },
            orderBy: { lastCheckedAt: 'desc' },
            skip: (page - 1) * half,
            take: half,
            include: {
              anime: { select: { id: true, slug: true, title: true } },
            },
          }),
          db.episodeSourceLink.findMany({
            where: { status: 'REMOVED' },
            orderBy: { updatedAt: 'desc' },
            skip: (page - 1) * half,
            take: half,
            include: {
              episode: {
                select: {
                  id: true,
                  episodeNumber: true,
                  title: true,
                  anime: { select: { id: true, slug: true, title: true } },
                },
              },
            },
          }),
          db.contentSource.count({ where: { status: 'REMOVED' } }),
          db.episodeSourceLink.count({ where: { status: 'REMOVED' } }),
        ]);

        return reply.send({
          data: { titleSources, episodeSources },
          total: titleTotal + episodeTotal,
          page,
          limit,
        });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // GET /admin/sources/providers — per-domain health stats
  app.get(
    '/sources/providers',
    { preHandler: [requireRole('ADMIN', 'MODERATOR')] },
    async (_req, reply) => {
      try {
        const domains = await db.allowedDomain.findMany({
          orderBy: { domain: 'asc' },
          select: { id: true, domain: true, label: true, isActive: true },
        });

        const stats = await Promise.all(
          domains.map(async (d) => {
            const [active, removed, pending, total] = await Promise.all([
              db.contentSource.count({ where: { url: { contains: d.domain }, status: 'ACTIVE' } }),
              db.contentSource.count({ where: { url: { contains: d.domain }, status: 'REMOVED' } }),
              db.contentSource.count({
                where: { url: { contains: d.domain }, status: 'PENDING_REVIEW' },
              }),
              db.contentSource.count({ where: { url: { contains: d.domain } } }),
            ]);

            const lastChecked = await db.contentSource.findFirst({
              where: { url: { contains: d.domain } },
              orderBy: { lastCheckedAt: 'desc' },
              select: { lastCheckedAt: true },
            });

            return {
              domain: d.domain,
              label: d.label,
              isActive: d.isActive,
              sources: { active, removed, pending, total },
              lastCheckedAt: lastChecked?.lastCheckedAt ?? null,
              health: total > 0 ? Math.round(((total - removed) / total) * 100) : 100,
            };
          }),
        );

        return reply.send({ data: stats });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── BullMQ Job Status ──────────────────────────────────────────────────────

  // GET /admin/jobs — job queue health and recent activity
  app.get('/jobs', { preHandler: [requireRole('ADMIN', 'MODERATOR')] }, async (_req, reply) => {
    try {
      const queues = [
        { name: 'metadata-refresh', queue: metadataRefreshQueue },
        { name: 'source-check', queue: sourceCheckQueue },
        { name: 'trending-recompute', queue: trendingRecomputeQueue },
        { name: 'session-cleanup', queue: sessionCleanupQueue },
      ];

      const queueStats = await Promise.all(
        queues.map(async ({ name, queue }) => {
          const [counts, repeatableJobs, recentCompleted, recentFailed] = await Promise.all([
            queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed', 'paused'),
            queue.getRepeatableJobs(),
            queue.getJobs(['completed'], 0, 4, false),
            queue.getJobs(['failed'], 0, 4, false),
          ]);

          return {
            name,
            counts,
            repeatableJobs: repeatableJobs.map((j) => ({
              key: j.key,
              name: j.name,
              cron: j.pattern,
              next: j.next,
            })),
            recentCompleted: recentCompleted.map((j) => ({
              id: j.id,
              name: j.name,
              finishedOn: j.finishedOn,
              returnvalue: j.returnvalue,
            })),
            recentFailed: recentFailed.map((j) => ({
              id: j.id,
              name: j.name,
              failedReason: j.failedReason,
              finishedOn: j.finishedOn,
            })),
          };
        }),
      );

      return reply.send({ data: queueStats });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /admin/jobs/:queue/trigger — manually trigger a job
  app.post(
    '/jobs/:queue/trigger',
    { preHandler: [requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const { queue: queueName } = request.params as { queue: string };
        const body = (request.body as Record<string, unknown>) ?? {};

        const queueMap: Record<string, typeof metadataRefreshQueue> = {
          'metadata-refresh': metadataRefreshQueue,
          'source-check': sourceCheckQueue,
          'trending-recompute': trendingRecomputeQueue,
          'session-cleanup': sessionCleanupQueue,
        };

        const queue = queueMap[queueName];
        if (!queue) {
          return reply.status(404).send({ error: { message: `Unknown queue: ${queueName}` } });
        }

        const job = await queue.add('manual-trigger', body, { priority: 1 });

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'TRIGGER_JOB',
            targetType: 'SYSTEM',
            targetId: queueName,
            metadata: { jobId: job.id, queueName, payload: body },
          },
        });

        return reply.status(202).send({ ok: true, jobId: job.id, queue: queueName });
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
        const action = q.action?.trim();

        const where: Record<string, unknown> = {};
        if (action) where.action = action;

        const [logs, total] = await Promise.all([
          db.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: { actor: { select: { id: true, username: true, role: true } } },
          }),
          db.auditLog.count({ where }),
        ]);

        return reply.send({ data: logs, total, page, limit });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // ── Reports: user submission ───────────────────────────────────────────────
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
