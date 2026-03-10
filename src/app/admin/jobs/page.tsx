'use client';

import { CheckCircle, Clock, Play, RefreshCw, XCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface RepeatableJob {
  key: string;
  name: string;
  cron: string | null;
  next: number | null;
}

interface CompletedJob {
  id: string | undefined;
  name: string;
  finishedOn: number | undefined;
  returnvalue: unknown;
}

interface FailedJob {
  id: string | undefined;
  name: string;
  failedReason: string | undefined;
  finishedOn: number | undefined;
}

interface QueueStat {
  name: string;
  counts: Record<string, number>;
  repeatableJobs: RepeatableJob[];
  recentCompleted: CompletedJob[];
  recentFailed: FailedJob[];
}

const QUEUE_LABELS: Record<string, string> = {
  'metadata-refresh': 'Metadata Refresh',
  'source-check': 'Source Check',
  'trending-recompute': 'Trending Recompute',
  'session-cleanup': 'Session Cleanup',
};

const QUEUE_DESCRIPTIONS: Record<string, string> = {
  'metadata-refresh': 'Syncs anime metadata from Jikan, AniList, and Kitsu',
  'source-check': 'Verifies content source URLs are still accessible',
  'trending-recompute': 'Recalculates trending scores from recent watch events',
  'session-cleanup': 'Removes expired and revoked refresh tokens',
};

function CountBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className='flex flex-col items-center'>
      <span className={cn('text-lg font-bold tabular-nums', color)}>
        {value}
      </span>
      <span className='text-xs text-slate-500'>{label}</span>
    </div>
  );
}

export default function JobsPage() {
  const [queues, setQueues] = React.useState<QueueStat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = React.useState<string | null>(
    null
  );
  const [triggerResult, setTriggerResult] = React.useState<
    Record<string, string>
  >({});

  const authHeader = React.useMemo<Record<string, string>>(() => {
    const tok =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
    const headers: Record<string, string> = {};
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
    return headers;
  }, []);

  const fetchJobs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/jobs', {
        headers: authHeader,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setQueues(json.data ?? []);
    } catch {
      setError(
        'Failed to load job status. Make sure the worker process is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const triggerJob = async (
    queueName: string,
    payload: Record<string, unknown> = {}
  ) => {
    if (triggerLoading) return;
    setTriggerLoading(queueName);
    setTriggerResult((prev) => ({ ...prev, [queueName]: '' }));
    try {
      const res = await fetch(`/api/admin/jobs/${queueName}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Trigger failed');
      setTriggerResult((prev) => ({
        ...prev,
        [queueName]: `Job queued: ${json.jobId}`,
      }));
      setTimeout(() => fetchJobs(), 2000);
    } catch (e) {
      setTriggerResult((prev) => ({
        ...prev,
        [queueName]: `Error: ${
          e instanceof Error ? e.message : 'Trigger failed'
        }`,
      }));
    } finally {
      setTriggerLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Job Status</h1>
          <p className='text-sm text-slate-400'>BullMQ background job queues</p>
        </div>
        <button
          onClick={fetchJobs}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {error && (
        <div className='rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-400'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60'
              />
            ))
          : queues.map((q) => (
              <div
                key={q.name}
                className='rounded-xl border border-slate-800 bg-slate-900/60 p-5'
              >
                {/* Queue header */}
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <h2 className='font-semibold text-white'>
                      {QUEUE_LABELS[q.name] ?? q.name}
                    </h2>
                    <p className='mt-0.5 text-xs text-slate-500'>
                      {QUEUE_DESCRIPTIONS[q.name] ?? q.name}
                    </p>
                  </div>
                  <button
                    onClick={() => triggerJob(q.name)}
                    disabled={!!triggerLoading}
                    className='flex items-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/30 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-950/50 disabled:opacity-50'
                  >
                    <Play className='h-3 w-3' />
                    {triggerLoading === q.name ? 'Queuing…' : 'Run Now'}
                  </button>
                </div>

                {triggerResult[q.name] && (
                  <p
                    className={cn(
                      'mt-2 text-xs',
                      triggerResult[q.name].startsWith('Error')
                        ? 'text-red-400'
                        : 'text-green-400'
                    )}
                  >
                    {triggerResult[q.name]}
                  </p>
                )}

                {/* Job counts */}
                <div className='mt-4 flex flex-wrap gap-6'>
                  <CountBadge
                    label='waiting'
                    value={q.counts.waiting ?? 0}
                    color='text-slate-300'
                  />
                  <CountBadge
                    label='active'
                    value={q.counts.active ?? 0}
                    color='text-cyan-400'
                  />
                  <CountBadge
                    label='completed'
                    value={q.counts.completed ?? 0}
                    color='text-green-400'
                  />
                  <CountBadge
                    label='failed'
                    value={q.counts.failed ?? 0}
                    color={q.counts.failed ? 'text-red-400' : 'text-slate-400'}
                  />
                  <CountBadge
                    label='delayed'
                    value={q.counts.delayed ?? 0}
                    color='text-amber-400'
                  />
                </div>

                {/* Schedule */}
                {q.repeatableJobs.length > 0 && (
                  <div className='mt-4'>
                    <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500'>
                      Schedule
                    </p>
                    <div className='space-y-1'>
                      {q.repeatableJobs.map((rj) => (
                        <div
                          key={rj.key}
                          className='flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-1.5'
                        >
                          <div className='flex items-center gap-2'>
                            <Clock className='h-3.5 w-3.5 text-slate-500' />
                            <code className='text-xs text-slate-300'>
                              {rj.cron}
                            </code>
                          </div>
                          {rj.next && (
                            <span className='text-xs text-slate-500'>
                              Next: {new Date(rj.next).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent jobs */}
                <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  {/* Completed */}
                  {q.recentCompleted.length > 0 && (
                    <div>
                      <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500'>
                        Recent Completed
                      </p>
                      <div className='space-y-1'>
                        {q.recentCompleted.map((j, idx) => (
                          <div
                            key={j.id ?? idx}
                            className='flex items-center justify-between rounded bg-slate-800/40 px-2.5 py-1'
                          >
                            <div className='flex items-center gap-1.5'>
                              <CheckCircle className='h-3 w-3 text-green-500' />
                              <span className='text-xs text-slate-400'>
                                {j.name}
                              </span>
                            </div>
                            <span className='text-xs text-slate-600'>
                              {j.finishedOn
                                ? new Date(j.finishedOn).toLocaleTimeString()
                                : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed */}
                  {q.recentFailed.length > 0 && (
                    <div>
                      <p className='mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500'>
                        Recent Failures
                      </p>
                      <div className='space-y-1'>
                        {q.recentFailed.map((j, idx) => (
                          <div
                            key={j.id ?? idx}
                            className='rounded bg-red-950/20 px-2.5 py-1'
                          >
                            <div className='flex items-center gap-1.5'>
                              <XCircle className='h-3 w-3 text-red-500' />
                              <span className='text-xs text-slate-400'>
                                {j.name}
                              </span>
                            </div>
                            {j.failedReason && (
                              <p className='mt-0.5 line-clamp-1 text-xs text-red-400'>
                                {j.failedReason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
