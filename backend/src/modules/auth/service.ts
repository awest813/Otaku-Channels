import type { FastifyInstance } from 'fastify';
import { db } from '../../lib/db';
import { redis } from '../../lib/redis';
import {
  hashPassword,
  verifyPassword,
  generateRefreshToken,
  hashToken,
} from '../../lib/security';
import {
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
} from '../../lib/errors';
import { config, adminSeedEmails } from '../../config';
import type { RegisterInput, LoginInput } from './schema';
import type { Role } from '@prisma/client';
import type { JwtPayload } from '../../lib/http/auth-middleware';

// TTLs in seconds
const REFRESH_TTL_S = parseTTLToSeconds(config.JWT_REFRESH_TTL);

function parseTTLToSeconds(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 86400;
  const [, n, unit] = match;
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(n) * (multipliers[unit] ?? 86400);
}

export async function registerUser(app: FastifyInstance, input: RegisterInput) {
  const existing = await db.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    if (existing.email === input.email) throw new ConflictError('Email already registered');
    throw new ConflictError('Username already taken');
  }

  const passwordHash = await hashPassword(input.password);
  const role: Role = adminSeedEmails.includes(input.email.toLowerCase()) ? 'ADMIN' : 'USER';

  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase(),
      username: input.username,
      passwordHash,
      role,
      profile: { create: {} },
    },
    select: { id: true, email: true, username: true, role: true },
  });

  const { accessToken, refreshTokenRaw } = await issueTokenPair(app, user.id, user.role);
  return { user, accessToken, refreshToken: refreshTokenRaw };
}

export async function loginUser(app: FastifyInstance, input: LoginInput) {
  const user = await db.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true, email: true, username: true, role: true, passwordHash: true, isBanned: true },
  });

  if (!user) throw new UnauthorizedError('Invalid credentials');
  if (user.isBanned) throw new ForbiddenError('This account has been suspended');

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const { accessToken, refreshTokenRaw } = await issueTokenPair(app, user.id, user.role);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken: refreshTokenRaw };
}

export async function refreshAccessToken(app: FastifyInstance, rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const stored = await db.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, role: true, isBanned: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token is invalid or expired');
  }
  if (stored.user.isBanned) throw new ForbiddenError('Account suspended');

  // Rotate: revoke old, issue new
  await db.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  const { accessToken, refreshTokenRaw } = await issueTokenPair(
    app,
    stored.user.id,
    stored.user.role,
  );
  return { accessToken, refreshToken: refreshTokenRaw };
}

export async function logoutUser(rawToken: string) {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await db.refreshToken
    .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
    .catch(() => {
      /* token may not exist, that's fine */
    });
}

export async function revokeAllUserSessions(userId: string) {
  await db.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  // Also invalidate any cached access tokens (stored in Redis deny-list)
  await redis.del(`user_tokens:${userId}`);
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function issueTokenPair(app: FastifyInstance, userId: string, role: Role) {
  const payload: JwtPayload = { sub: userId, role };
  const accessToken = app.jwt.sign(payload);

  const refreshTokenRaw = generateRefreshToken();
  const tokenHash = hashToken(refreshTokenRaw);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_S * 1000);

  await db.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { accessToken, refreshTokenRaw };
}
