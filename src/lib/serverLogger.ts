/* eslint-disable no-console */
/**
 * Structured server-side logger for Next.js API route handlers.
 *
 * Emits JSON lines in production (machine-parseable by Vercel / Datadog / etc.)
 * and human-friendly coloured output in development.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogRecord {
  level: LogLevel;
  ts: string;
  msg: string;
  [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === 'production';

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const record: LogRecord = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...meta,
  };

  if (isProd) {
    // JSON lines — ingest by Vercel log drains, Datadog, Logtail, etc.
    const line = JSON.stringify(record);
    if (level === 'error' || level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
  } else {
    // Human-readable for local dev
    const colours: Record<LogLevel, string> = {
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    const colour = colours[level];
    const extra =
      meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
    const fn =
      level === 'error'
        ? console.error
        : level === 'warn'
        ? console.warn
        : console.log;
    fn(`${colour}[${level.toUpperCase()}]${reset} ${record.ts} ${msg}${extra}`);
  }
}

export const serverLogger = {
  debug: (msg: string, meta?: Record<string, unknown>) =>
    emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) =>
    emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) =>
    emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) =>
    emit('error', msg, meta),
};
