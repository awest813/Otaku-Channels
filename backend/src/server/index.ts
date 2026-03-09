import { buildServer } from './server';
import { config } from '../config';
import { logger } from '../lib/logger';
import { connectDb, disconnectDb } from '../lib/db';
import { connectRedis, disconnectRedis } from '../lib/redis';

async function main() {
  // Bootstrap infra
  await connectDb();
  await connectRedis();

  const app = await buildServer();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Graceful shutdown initiated');
    try {
      await app.close();
      await disconnectDb();
      await disconnectRedis();
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await app.listen({ port: config.PORT, host: config.HOST });
    logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started');
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

main();
