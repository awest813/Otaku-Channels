/**
 * Worker process entry point
 *
 * Start with: npm run worker
 *
 * Each factory creates a BullMQ Worker that connects to Redis and processes
 * jobs from its named queue. Workers run in the same Node process here but
 * can trivially be split into separate processes/containers in production.
 */

import { createSessionCleanupWorker } from './session-cleanup.worker';
import { createTrendingWorker } from './trending.worker';
import { createSourceCheckWorker } from './source-check.worker';
import { createMetadataWorker } from './metadata.worker';
import { logger } from '../../logger';

export function startWorkers() {
  const workers = [
    createSessionCleanupWorker(),
    createTrendingWorker(),
    createSourceCheckWorker(),
    createMetadataWorker(),
  ];

  logger.info(`Started ${workers.length} BullMQ workers`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Worker process shutting down');
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return workers;
}
