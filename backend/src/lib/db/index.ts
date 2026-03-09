import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

declare global {
  // Prevent multiple instances in dev (hot reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  (db as any).$on('query', (e: any) => {
    if (e.duration > 200) {
      logger.warn({ query: e.query, duration: e.duration }, 'Slow query');
    }
  });
}

(db as any).$on('error', (e: any) => {
  logger.error({ message: e.message }, 'Prisma error');
});

export async function connectDb() {
  await db.$connect();
  logger.info('Database connected');
}

export async function disconnectDb() {
  await db.$disconnect();
  logger.info('Database disconnected');
}
