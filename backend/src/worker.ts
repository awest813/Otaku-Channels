/**
 * Standalone worker process
 *
 * Run: npx tsx src/worker.ts
 * Or via package.json script: npm run worker
 */

import { logger } from './lib/logger';
import { scheduleRecurringJobs } from './lib/jobs';
import { startWorkers } from './lib/jobs/workers';

async function main() {
  logger.info('Starting Otaku Channels worker process');

  // Register recurring (cron) jobs into BullMQ
  await scheduleRecurringJobs();

  // Start all worker processors
  startWorkers();

  logger.info('Worker process ready');
}

main().catch((err) => {
  logger.error({ err }, 'Worker process failed to start');
  process.exit(1);
});
