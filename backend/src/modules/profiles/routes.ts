// Profile management is exposed via /api/v1/users/me/profile in the users module.
// This module adds the public profile endpoint: GET /api/v1/profiles/:username
// Returns publicly safe profile fields for any existing user.

import type { FastifyInstance } from 'fastify';
import { sendError, NotFoundError } from '../../lib/errors';
import { db } from '../../lib/db';

export async function profilesRoutes(app: FastifyInstance) {
  // GET /api/v1/profiles/:username
  // Returns publicly visible profile data for a user.
  // Only exposes safe, non-sensitive fields.
  app.get('/:username', async (request, reply) => {
    try {
      const { username } = request.params as { username: string };

      const user = await db.user.findFirst({
        where: { username, isBanned: false, deletedAt: null },
        select: {
          id: true,
          username: true,
          createdAt: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true,
              bio: true,
              favoriteGenres: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('Profile');
      }

      const { profile, ...userFields } = user;

      return reply.send({
        data: {
          ...userFields,
          displayName: profile?.displayName ?? null,
          avatarUrl: profile?.avatarUrl ?? null,
          bio: profile?.bio ?? null,
          favoriteGenres: profile?.favoriteGenres ?? [],
        },
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
