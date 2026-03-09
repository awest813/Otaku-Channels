/**
 * Background job queues using BullMQ
 *
 * Queues defined here:
 *  - metadata-refresh: periodic sync of anime metadata from Jikan/AniList
 *  - source-check: periodically verify source URLs are still active
 *  - trending-recompute: recalculate trending scores from watch events
 *  - session-cleanup: remove expired refresh tokens
 *  - schedule-generate: pre-generate schedule windows for fast reads
 *
 * Workers are implemented in src/lib/jobs/workers/ and started via
 * `npm run worker` (see src/worker.ts).
 */

import { Queue } from 'bullmq';
import { config } from '../../config';
import { logger } from '../logger';

// BullMQ bundles its own ioredis — pass connection URL string instead of the
// shared Redis instance to avoid type incompatibilities between two ioredis versions.
const connection = { connection: { url: config.REDIS_URL } };

export const metadataRefreshQueue = new Queue('metadata-refresh', connection);
export const sourceCheckQueue = new Queue('source-check', connection);
export const trendingRecomputeQueue = new Queue('trending-recompute', connection);
export const sessionCleanupQueue = new Queue('session-cleanup', connection);

// Schedule recurring jobs
export async function scheduleRecurringJobs() {
  try {
    // Clean up expired sessions daily
    await sessionCleanupQueue.add(
      'cleanup',
      {},
      { repeat: { pattern: '0 3 * * *' }, jobId: 'session-cleanup-daily' },
    );

    // Recompute trending scores hourly
    await trendingRecomputeQueue.add(
      'recompute',
      {},
      { repeat: { pattern: '0 * * * *' }, jobId: 'trending-hourly' },
    );

    // Check source availability every 6 hours
    await sourceCheckQueue.add(
      'check-all',
      {},
      { repeat: { pattern: '0 */6 * * *' }, jobId: 'source-check-6h' },
    );

    logger.info('Recurring jobs scheduled');
  } catch (err) {
    logger.warn({ err }, 'Failed to schedule recurring jobs — queue may be unavailable');
  }
}
