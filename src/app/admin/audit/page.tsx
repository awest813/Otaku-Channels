'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AuditActor {
  id: string;
  username: string;
  role: string;
}

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: AuditActor | null;
}

interface AuditResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  BAN_USER: { label: 'Ban User', color: 'text-red-400 bg-red-950/20 border-red-900/50' },
  UNBAN_USER: { label: 'Unban User', color: 'text-green-400 bg-green-950/20 border-green-900/50' },
  CHANGE_USER_ROLE: { label: 'Change Role', color: 'text-cyan-400 bg-cyan-950/20 border-cyan-900/50' },
  UPDATE_ANIME_VISIBILITY: { label: 'Visibility', color: 'text-purple-400 bg-purple-950/20 border-purple-900/50' },
  MERGE_ANIME: { label: 'Merge Anime', color: 'text-amber-400 bg-amber-950/20 border-amber-900/50' },
  TRIGGER_JOB: { label: 'Trigger Job', color: 'text-slate-300 bg-slate-800 border-slate-700' },
};

const KNOWN_ACTIONS = Object.keys(ACTION_LABELS);

function ActionBadge({ action }: { action: string }) {
  const def = ACTION_LABELS[action];
  if (!def) {
    return (
      <span className='rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400'>
        {action}
      </span>
    );
  }
  return (
    <span
      className={cn('rounded border px-1.5 py-0.5 text-xs font-medium', def.color)}
    >
      {def.label}
    </span>
  );
}

export default function AuditLogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? '1');
  const actionFilter = searchParams.get('action') ?? '';

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/admin/audit?${params}`, {
        headers: authHeader,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AuditResponse = await res.json();
      setLogs(json.data);
      setTotal(json.total);
    } catch {
      setError('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== 'page') p.delete('page');
    router.push(`/admin/audit?${p}`);
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Audit Log</h1>
          <p className='text-sm text-slate-400'>{total.toLocaleString()} entries</p>
        </div>
        <button
          onClick={fetchLogs}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className='flex gap-3'>
        <select
          value={actionFilter}
          onChange={(e) => updateParam('action', e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value=''>All actions</option>
          {KNOWN_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a].label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className='rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Log table */}
      <div className='overflow-x-auto rounded-xl border border-slate-800'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-800 bg-slate-900/60'>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Time
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Actor
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Action
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell'>
                Target
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden lg:table-cell'>
                Metadata
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-800'>
            {loading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className='px-4 py-3'>
                      <div className='h-4 animate-pulse rounded bg-slate-800' />
                    </td>
                  </tr>
                ))
              : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='px-4 py-12 text-center text-slate-500'>
                      No audit log entries found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className='transition-colors hover:bg-slate-900/40'>
                      <td className='px-4 py-3 text-xs text-slate-500 whitespace-nowrap'>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className='px-4 py-3'>
                        {log.actor ? (
                          <div>
                            <p className='text-sm font-medium text-white'>{log.actor.username}</p>
                            <p className='text-xs text-slate-500'>{log.actor.role}</p>
                          </div>
                        ) : (
                          <span className='text-slate-600'>system</span>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <ActionBadge action={log.action} />
                      </td>
                      <td className='hidden px-4 py-3 sm:table-cell'>
                        <span className='text-xs text-slate-400'>{log.targetType}</span>
                        {log.targetId && (
                          <code
                            className='ml-1.5 cursor-pointer rounded bg-slate-800 px-1 py-0.5 text-xs text-slate-500 hover:text-slate-300'
                            onClick={() => navigator.clipboard.writeText(log.targetId)}
                            title='Click to copy'
                          >
                            {log.targetId.slice(0, 8)}…
                          </code>
                        )}
                      </td>
                      <td className='hidden px-4 py-3 lg:table-cell'>
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <code className='rounded bg-slate-800 px-2 py-1 text-xs text-slate-400'>
                            {JSON.stringify(log.metadata).slice(0, 80)}
                            {JSON.stringify(log.metadata).length > 80 ? '…' : ''}
                          </code>
                        ) : (
                          <span className='text-slate-700'>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-slate-400'>
          <span>
            Page {page} of {totalPages} · {total} entries
          </span>
          <div className='flex gap-2'>
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', String(page - 1))}
              className='flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40'
            >
              <ChevronLeft className='h-4 w-4' />
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => updateParam('page', String(page + 1))}
              className='flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40'
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
