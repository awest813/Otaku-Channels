import { buildServer } from './server';
import { config, isProd } from '../config';
import { logger } from '../lib/logger';
import { connectDb, disconnectDb } from '../lib/db';
import { connectRedis, disconnectRedis } from '../lib/redis';
import { execFileSync } from 'child_process';
import path from 'path';

/**
 * Run pending Prisma migrations before the server accepts traffic.
 * Uses `prisma migrate deploy` which is safe to run on an already-migrated DB
 * (it is a no-op when there are no pending migrations).
 *
 * This acts as a database migration safety check: the process exits early if
 * migrations fail rather than starting with a schema mismatch.
 *
 * The local `prisma` binary from `node_modules/.bin` is used directly to avoid
 * relying on `npx` and any associated network lookups.
 */
async function runMigrations() {
  logger.info('Checking database migrations…');
  try {
    // Resolve the locally installed Prisma CLI binary — avoids `npx` network calls
    const prismaBin = path.resolve(
      __dirname,
      '..',
      '..',
      'node_modules',
      '.bin',
      'prisma',
    );
    execFileSync(prismaBin, ['migrate', 'deploy'], { stdio: 'inherit' });
    logger.info('Database migrations are up-to-date');
  } catch (err) {
    logger.fatal({ err }, 'Database migration failed — aborting startup');
    process.exit(1);
  }
}

async function main() {
  // Run migrations before accepting traffic
  if (config.NODE_ENV !== 'test') {
    await runMigrations();
  }

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

    // ── Startup banner ───────────────────────────────────────────────────────
    const lines = [
      '',
      '  ┌─────────────────────────────────────────────────────┐',
      '  │           Otaku Channels — Backend ready            │',
      '  ├─────────────────────────────────────────────────────┤',
      `  │  API        http://localhost:${config.PORT}/api/v1             │`,
      `  │  Docs       http://localhost:${config.PORT}/docs               │`,
      `  │  Health     http://localhost:${config.PORT}/health             │`,
      `  │  Readiness  http://localhost:${config.PORT}/ready              │`,
      '  ├─────────────────────────────────────────────────────┤',
      `  │  ENV        ${config.NODE_ENV.padEnd(39)}│`,
      `  │  Log level  ${config.LOG_LEVEL.padEnd(39)}│`,
      `  │  Frontend   ${config.FRONTEND_URL.padEnd(39)}│`,
      '  └─────────────────────────────────────────────────────┘',
      '',
    ];

    if (!isProd) {
      // Dev hints
      lines.push('  Tip: Run the background worker in a separate terminal:');
      lines.push('       npm run worker:dev');
      lines.push('');
      if (!config.CONSUMET_BASE_URL) {
        lines.push('  Note: CONSUMET_BASE_URL is not set — streaming source lookup disabled.');
        lines.push('        See backend/.env.example for self-hosting instructions.');
        lines.push('');
      }
    }

    // Print banner to stdout directly (bypasses pino JSON in dev pretty mode)
    process.stdout.write(lines.join('\n') + '\n');

    logger.info({ port: config.PORT, env: config.NODE_ENV }, 'Server started');
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

main();
