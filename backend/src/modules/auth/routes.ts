import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { RegisterSchema, LoginSchema, RefreshSchema } from './schema';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from './service';
import { requireAuth } from '../../lib/http/auth-middleware';
import { sendError } from '../../lib/errors';
import { config } from '../../config';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function authRoutes(app: FastifyInstance) {
  // Stricter rate limit on auth endpoints
  const authRateLimit = {
    config: {
      rateLimit: {
        max: config.AUTH_RATE_LIMIT_MAX,
        timeWindow: config.AUTH_RATE_LIMIT_WINDOW_MS,
      },
    },
  };

  // POST /api/v1/auth/register
  app.post('/register', authRateLimit, async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      const result = await registerUser(app, body);
      reply.setCookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
      return reply.status(201).send({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/auth/login
  app.post('/login', authRateLimit, async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      const result = await loginUser(app, body);
      reply.setCookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
      return reply.send({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/auth/refresh
  app.post('/refresh', async (request, reply) => {
    try {
      // Accept token from cookie or body
      const cookieToken = request.cookies[REFRESH_COOKIE];
      const bodyToken = (request.body as any)?.refreshToken;
      const rawToken = cookieToken ?? bodyToken;

      if (!rawToken) {
        const parsed = RefreshSchema.safeParse(request.body);
        if (!parsed.success) throw new Error('Refresh token required');
      }

      const result = await refreshAccessToken(app, rawToken);
      reply.setCookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
      return reply.send({ accessToken: result.accessToken });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // POST /api/v1/auth/logout
  app.post('/logout', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const cookieToken = request.cookies[REFRESH_COOKIE];
      await logoutUser(cookieToken ?? '');
      reply.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
      return reply.send({ ok: true });
    } catch (err) {
      return sendError(reply, err);
    }
  });

  // GET /api/v1/auth/me
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const { db } = await import('../../lib/db');
      const user = await db.user.findUnique({
        where: { id: request.user.sub },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isVerified: true,
          createdAt: true,
          profile: true,
        },
      });
      if (!user) throw new Error('User not found');
      return reply.send({ user });
    } catch (err) {
      return sendError(reply, err);
    }
  });
}
