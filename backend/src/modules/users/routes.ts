import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError } from '../../lib/errors';
import { db } from '../../lib/db';

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  preferSub: z.boolean().optional(),
  preferDub: z.boolean().optional(),
  preferredLanguage: z.string().length(2).optional(),
  showMatureContent: z.boolean().optional(),
  theme: z.enum(['dark', 'light', 'auto']).optional(),
  favoriteGenres: z.array(z.string()).max(20).optional(),
  preferredSources: z.array(z.string()).max(10).optional(),
});

export async function usersRoutes(app: FastifyInstance) {
  // GET /api/v1/users/me/profile
  app.get('/me/profile', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
      });
      if (!profile) throw new NotFoundError('Profile');
      return reply.send({ profile });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // PATCH /api/v1/users/me/profile
  app.patch('/me/profile', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = UpdateProfileSchema.parse(request.body);
      const profile = await db.userProfile.update({
        where: { userId: request.user.sub },
        data: body,
      });
      return reply.send({ profile });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/users/me/hidden
  app.get('/me/hidden', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
        select: { id: true },
      });
      if (!profile) throw new NotFoundError('Profile');

      const hidden = await db.hiddenTitle.findMany({
        where: { profileId: profile.id },
        include: { anime: { select: { id: true, slug: true, title: true, posterUrl: true } } },
        orderBy: { hiddenAt: 'desc' },
      });
      return reply.send({ data: hidden });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/users/me/hidden
  app.post('/me/hidden', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z.object({ animeId: z.string(), reason: z.string().optional() }).parse(request.body);
      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
        select: { id: true },
      });
      if (!profile) throw new NotFoundError('Profile');

      await db.hiddenTitle.upsert({
        where: { profileId_animeId: { profileId: profile.id, animeId: body.animeId } },
        create: { profileId: profile.id, animeId: body.animeId, reason: body.reason },
        update: { reason: body.reason },
      });
      return reply.status(201).send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/users/me/hidden/:animeId
  app.delete('/me/hidden/:animeId', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { animeId } = request.params as { animeId: string };
      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
        select: { id: true },
      });
      if (!profile) throw new NotFoundError('Profile');

      await db.hiddenTitle.deleteMany({
        where: { profileId: profile.id, animeId },
      });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // Admin: GET /api/v1/users (list all users)
  app.get(
    '/',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { page = '1', limit = '50' } = request.query as Record<string, string>;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
          db.user.findMany({
            skip,
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            select: { id: true, email: true, username: true, role: true, isBanned: true, createdAt: true },
          }),
          db.user.count(),
        ]);

        return reply.send({ data: users, total, page: parseInt(page) });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );
}
