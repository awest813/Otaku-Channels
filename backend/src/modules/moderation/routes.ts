// Moderation is handled via the admin routes module.
// This module adds a dedicated moderation queue endpoint:
//   GET  /api/v1/moderation/queue  — paginated open reports for moderators
//   POST /api/v1/moderation/queue/batch — resolve/dismiss multiple reports at once

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { Prisma, ReportStatus } from '@prisma/client';
import { config } from '../../config';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError } from '../../lib/errors';
import { db } from '../../lib/db';

const BatchActionSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  action: z.enum(['RESOLVE', 'DISMISS', 'UNDER_REVIEW']),
});

const actionToStatus: Record<string, ReportStatus> = {
  RESOLVE: ReportStatus.RESOLVED,
  DISMISS: ReportStatus.DISMISSED,
  UNDER_REVIEW: ReportStatus.UNDER_REVIEW,
};

// Moderation actions are sensitive — apply a conservative rate limit.
const modRateLimit = {
  config: {
    rateLimit: {
      max: Math.min(config.RATE_LIMIT_MAX, 60),
      timeWindow: config.RATE_LIMIT_WINDOW_MS,
    },
  },
};

export async function moderationRoutes(app: FastifyInstance) {
  // GET /api/v1/moderation/queue
  // Returns a paginated list of open/under-review reports for moderators.
  app.get('/queue', { ...modRateLimit, preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] }, async (request, reply) => {
    try {
      const q = request.query as Record<string, string>;
      const rawStatus = (q.status ?? 'OPEN').toUpperCase();
      const status = rawStatus in ReportStatus ? (rawStatus as ReportStatus) : ReportStatus.OPEN;
      const page = Math.max(1, parseInt(q.page ?? '1'));
      const limit = Math.min(100, parseInt(q.limit ?? '25'));

      const [total, reports] = await Promise.all([
        db.report.count({ where: { status } }),
        db.report.findMany({
          where: { status },
          orderBy: { createdAt: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            reporter: { select: { id: true, username: true } },
          },
        }),
      ]);

      return reply.send({
        data: reports,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/moderation/queue/batch
  // Resolve or dismiss multiple reports in a single request.
  app.post('/queue/batch', { ...modRateLimit, preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] }, async (request, reply) => {
    try {
      const { ids, action } = BatchActionSchema.parse(request.body);

      const newStatus = actionToStatus[action];
      const isTerminal = newStatus === ReportStatus.RESOLVED || newStatus === ReportStatus.DISMISSED;
      const now = new Date();

      await db.report.updateMany({
        where: { id: { in: ids } },
        data: {
          status: newStatus,
          resolvedBy: isTerminal ? request.user.sub : undefined,
          resolvedAt: isTerminal ? now : undefined,
        },
      });

      await db.auditLog.create({
        data: {
          actorId: request.user.sub,
          action: `BATCH_${action}_REPORTS`,
          targetType: 'REPORT',
          targetId: ids.join(','),
          metadata: { count: ids.length } as Prisma.InputJsonValue,
        },
      });

      return reply.send({ ok: true, updated: ids.length });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
