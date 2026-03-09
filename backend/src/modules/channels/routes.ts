import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../lib/http/auth-middleware';
import { sendError, NotFoundError } from '../../lib/errors';
import { db } from '../../lib/db';
import { cacheDelPattern } from '../../lib/redis';
import { listChannels, getChannelBySlug, getNowPlaying } from './service';

const CreateChannelSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(128),
  description: z.string().max(1000).optional(),
  artworkUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  type: z.enum(['CURATED', 'GENRE', 'MOOD', 'ERA', 'ALGORITHMIC', 'SCHEDULED']).default('CURATED'),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  channelNumber: z.string().optional(),
  criteria: z.record(z.unknown()).optional(),
});

export async function channelsRoutes(app: FastifyInstance) {
  // GET /api/v1/channels
  app.get('/', async (request, reply) => {
    try {
      const q = request.query as Record<string, string>;
      const result = await listChannels({
        featured: q.featured === 'true' ? true : undefined,
        type: q.type,
        page: q.page ? parseInt(q.page) : 1,
        limit: q.limit ? parseInt(q.limit) : 20,
      });
      return reply.send(result);
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/channels/featured
  app.get('/featured', async (_request, reply) => {
    try {
      const result = await listChannels({ featured: true, limit: 10 });
      return reply.send(result);
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/channels/:slug
  app.get('/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const channel = await getChannelBySlug(slug);
      return reply.send({ data: channel });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/channels/:slug/now-playing
  app.get('/:slug/now-playing', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const result = await getNowPlaying(slug);
      return reply.send({ data: result });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/channels/:slug/schedule — full schedule listing
  app.get('/:slug/schedule', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const channel = await db.channel.findUnique({
        where: { slug },
        include: {
          schedules: {
            orderBy: { slotIndex: 'asc' },
          },
        },
      });
      if (!channel) throw new NotFoundError('Channel');
      return reply.send({ data: channel.schedules });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // ── Admin: create/update channels ──────────────────────────────────────────

  app.post(
    '/',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { criteria, ...rest } = CreateChannelSchema.parse(request.body);
        const channel = await db.channel.create({
          data: {
            ...rest,
            ownedBy: request.user.sub,
            ...(criteria !== undefined && { criteria: criteria as any }),
          },
        });
        await cacheDelPattern('channel:*');
        return reply.status(201).send({ data: channel });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  app.patch(
    '/:id',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const { criteria, ...rest } = CreateChannelSchema.partial().parse(request.body);
        const channel = await db.channel.update({
          where: { id },
          data: { ...rest, ...(criteria !== undefined && { criteria: criteria as any }) },
        });
        await cacheDelPattern('channel:*');
        return reply.send({ data: channel });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // POST /api/v1/channels/:id/program-blocks — add anime to channel
  app.post(
    '/:id/program-blocks',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = z
          .object({
            animeId: z.string(),
            position: z.number().int().min(0),
            label: z.string().optional(),
            durationSec: z.number().int().optional(),
          })
          .parse(request.body);

        const block = await db.channelProgramBlock.create({
          data: { channelId: id, ...body },
        });
        await cacheDelPattern('channel:*');
        return reply.status(201).send({ data: block });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // DELETE /api/v1/channels/:id/program-blocks/:blockId
  app.delete(
    '/:id/program-blocks/:blockId',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { blockId } = request.params as { id: string; blockId: string };
        await db.channelProgramBlock.delete({ where: { id: blockId } });
        await cacheDelPattern('channel:*');
        return reply.send({ ok: true });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // POST /api/v1/channels/:id/schedule — set schedule slots
  app.post(
    '/:id/schedule',
    { preHandler: [requireAuth, requireRole('ADMIN', 'MODERATOR')] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const body = z
          .object({
            slots: z.array(
              z.object({
                slotIndex: z.number().int().min(0),
                animeId: z.string().optional(),
                episodeId: z.string().optional(),
                durationSec: z.number().int().min(60).default(1440),
                label: z.string().optional(),
              }),
            ),
          })
          .parse(request.body);

        // Replace all slots for this channel
        await db.channelSchedule.deleteMany({ where: { channelId: id } });
        const slots = await db.channelSchedule.createMany({
          data: body.slots.map((s) => ({ ...s, channelId: id })),
        });

        await cacheDelPattern('nowplaying:*');
        await cacheDelPattern('channel:*');
        return reply.status(201).send({ created: slots.count });
      } catch (err) {
        return sendError(reply, err);
      }
    },
  );

  // POST /api/v1/channels/:slug/save — save channel to profile
  app.post('/:slug/save', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const channel = await db.channel.findUnique({ where: { slug }, select: { id: true } });
      if (!channel) throw new NotFoundError('Channel');

      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
        select: { id: true },
      });
      if (!profile) throw new NotFoundError('Profile');

      await db.savedChannel.upsert({
        where: { profileId_channelId: { profileId: profile.id, channelId: channel.id } },
        create: { profileId: profile.id, channelId: channel.id },
        update: {},
      });

      return reply.status(201).send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // DELETE /api/v1/channels/:slug/save
  app.delete('/:slug/save', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const channel = await db.channel.findUnique({ where: { slug }, select: { id: true } });
      if (!channel) throw new NotFoundError('Channel');

      const profile = await db.userProfile.findUnique({
        where: { userId: request.user.sub },
        select: { id: true },
      });
      if (!profile) throw new NotFoundError('Profile');

      await db.savedChannel.deleteMany({
        where: { profileId: profile.id, channelId: channel.id },
      });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
