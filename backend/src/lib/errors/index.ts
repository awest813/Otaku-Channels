import type { FastifyReply } from 'fastify';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, 'BAD_REQUEST');
  }
}

// Fastify error handler
export function sendError(reply: FastifyReply, err: unknown) {
  if (err instanceof AppError) {
    return reply.status(err.statusCode).send({
      error: { code: err.code ?? 'ERROR', message: err.message },
    });
  }
  // Unexpected errors — don't leak internal details in prod
  const isProd = process.env.NODE_ENV === 'production';
  return reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected error occurred' : String(err),
    },
  });
}
