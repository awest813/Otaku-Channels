import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError, BadRequestError } from '../../lib/errors';
import { db } from '../../lib/db';
import { assertDomainAllowed, sanitizeUrl, extractDomain } from '../../lib/security';
import { cacheDelPattern } from '../../lib/redis';

const SourceSubmitSchema = z.object({
  animeId: z.string(),
  url: z.string().url(),
  sourceName: z.string().min(1).max(128),
  sourceType: z.string().min(1).max(64),
  isEmbeddable: z.boolean().default(false),
  language: z.enum(['sub', 'dub', 'both']).optional(),
  region: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function sourcesRoutes(app: FastifyInstance) {
  // GET /api/v1/sources/domains — list approved domains
  app.get('/domains', async (_request, reply) => {
    try {
      const domains = await db.allowedDomain.findMany({ orderBy: { domain: 'asc' } });
      return reply.send({ data: domains });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/sources/domains — admin: approve a new domain
  app.post(
    '/domains',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const body = z
          .object({
            domain: z.string().min(3),
            name: z.string().min(1),
            isEmbeddable: z.boolean().default(false),
            notes: z.string().optional(),
          })
          .parse(request.body);

        const domain = await db.allowedDomain.upsert({
          where: { domain: body.domain.toLowerCase() },
          create: {
            domain: body.domain.toLowerCase(),
            name: body.name,
            isEmbeddable: body.isEmbeddable,
            notes: body.notes,
            approvedBy: request.user.sub,
            approvedAt: new Date(),
          },
          update: {
            name: body.name,
            isEmbeddable: body.isEmbeddable,
            notes: body.notes,
            approvedBy: request.user.sub,
            approvedAt: new Date(),
          },
        });

        // Audit
        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'APPROVE_DOMAIN',
            targetType: 'DOMAIN',
            targetId: domain.id,
            metadata: { domain: domain.domain },
          },
        });

        return reply.status(201).send({ data: domain });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // DELETE /api/v1/sources/domains/:domain — admin: remove domain
  app.delete(
    '/domains/:domain',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    async (request, reply) => {
      try {
        const { domain } = request.params as { domain: string };
        await db.allowedDomain.delete({ where: { domain } });
        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'REMOVE_DOMAIN',
            targetType: 'DOMAIN',
            targetId: domain,
          },
        });
        return reply.send({ ok: true });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // GET /api/v1/sources/anime/:animeId — get sources for an anime title
  app.get('/anime/:animeId', async (request, reply) => {
    try {
      const { animeId } = request.params as { animeId: string };
      const sources = await db.contentSource.findMany({
        where: { animeId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send({ data: sources });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/sources/anime — submit a source link (auth required)
  app.post('/anime', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = SourceSubmitSchema.parse(request.body);

      // Validate URL and domain allowlist
      const safeUrl = sanitizeUrl(body.url);
      await assertDomainAllowed(safeUrl);
      const domain = extractDomain(safeUrl)!;

      const source = await db.contentSource.create({
        data: {
          animeId: body.animeId,
          domain,
          url: safeUrl,
          sourceName: body.sourceName,
          sourceType: body.sourceType,
          isEmbeddable: body.isEmbeddable,
          language: body.language,
          region: body.region,
          notes: body.notes,
          submittedBy: request.user.sub,
          status: request.user.role === 'ADMIN' || request.user.role === 'MODERATOR'
            ? 'ACTIVE'
            : 'PENDING_REVIEW',
        },
      });

      await cacheDelPattern(`anime:slug:*`);
      return reply.status(201).send({ data: source });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // PATCH /api/v1/sources/:id/status — admin: change source status
  app.patch(
    '/:id/status',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { status } = z
          .object({ status: z.enum(['ACTIVE', 'REMOVED', 'UNKNOWN', 'PENDING_REVIEW']) })
          .parse(request.body);

        const source = await db.contentSource.update({
          where: { id },
          data: {
            status: status as any,
            verifiedBy: request.user.sub,
            verifiedAt: new Date(),
          },
        });

        await db.auditLog.create({
          data: {
            actorId: request.user.sub,
            action: 'UPDATE_SOURCE_STATUS',
            targetType: 'SOURCE',
            targetId: id,
            metadata: { status },
          },
        });

        await cacheDelPattern('anime:slug:*');
        return reply.send({ data: source });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // GET /api/v1/sources/pending — admin: list pending review sources
  app.get(
    '/pending',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (_request, reply) => {
      try {
        const sources = await db.contentSource.findMany({
          where: { status: 'PENDING_REVIEW' },
          include: { anime: { select: { id: true, slug: true, title: true } } },
          orderBy: { createdAt: 'asc' },
        });
        return reply.send({ data: sources });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );
}
