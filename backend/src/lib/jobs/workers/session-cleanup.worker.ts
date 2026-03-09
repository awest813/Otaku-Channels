/**
 * Session cleanup worker
 *
 * Removes expired and revoked refresh tokens from the database.
 * Scheduled daily at 03:00 UTC.
 */

import { Worker } from 'bullmq';
import { config } from '../../../config';
import { db } from '../../db';
import { logger } from '../../logger';

const connection = { url: config.REDIS_URL };

export function createSessionCleanupWorker() {
  const worker = new Worker(
    'session-cleanup',
    async (job) => {
      logger.info({ jobId: job.id }, 'Starting session cleanup');

      const cutoff = new Date();

      // Delete tokens that are expired or revoked
      const { count } = await db.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: cutoff } },
            { revokedAt: { not: null } },
          ],
        },
      });

      logger.info({ jobId: job.id, deleted: count }, 'Session cleanup complete');
      return { deleted: count };
    },
    { connection, concurrency: 1 },
  );

  worker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, result }, 'session-cleanup job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'session-cleanup job failed');
  });

  return worker;
}
