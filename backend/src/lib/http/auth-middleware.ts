import type { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../errors';
import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;   // userId
  role: Role;
  jti?: string;  // token id
}

// Decorates request with `user` after verifying the JWT
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<JwtPayload>();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

// Role gate — call after requireAuth
export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const payload = request.user as JwtPayload;
    if (!payload || !roles.includes(payload.role)) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }
  };
}

// Augment Fastify types so request.user is typed
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload;
  }
}
