'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ChevronLeft, ChevronRight, RefreshCw, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  reporter: { id: string; username: string } | null;
}

interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

const STATUS_OPTS = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const;

const statusColor: Record<string, string> = {
  OPEN: 'text-red-400 bg-red-950/30 border-red-900/50',
  UNDER_REVIEW: 'text-amber-400 bg-amber-950/30 border-amber-900/50',
  RESOLVED: 'text-green-400 bg-green-950/30 border-green-900/50',
  DISMISSED: 'text-slate-500 bg-slate-800 border-slate-700',
};

const targetColor: Record<string, string> = {
  ANIME: 'text-cyan-400',
  SOURCE: 'text-purple-400',
  USER: 'text-amber-400',
  CHANNEL: 'text-green-400',
};

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reports, setReports] = React.useState<Report[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? '1');
  const status = searchParams.get('status') ?? 'OPEN';

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchReports = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status, page: String(page), limit: '50' });
      const res = await fetch(`/api/admin/reports?${params}`, {
        headers: authHeader,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ReportsResponse = await res.json();
      setReports(json.data);
      setTotal(json.total);
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, value);
    if (key !== 'page') p.delete('page');
    router.push(`/admin/reports?${p}`);
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    if (actionLoading) return;
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      await fetchReports();
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>User Reports</h1>
          <p className='text-sm text-slate-400'>{total.toLocaleString()} {status.toLowerCase()} reports</p>
        </div>
        <button
          onClick={fetchReports}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className='flex gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1'>
        {STATUS_OPTS.map((s) => (
          <button
            key={s}
            onClick={() => updateParam('status', s)}
            className={cn(
              'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              status === s
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300',
            )}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error && (
        <div className='rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Reports list */}
      <div className='space-y-3'>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60'
              />
            ))
          : reports.length === 0 ? (
              <div className='rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-12 text-center text-slate-500'>
                No {status.toLowerCase().replace('_', ' ')} reports
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  className='rounded-xl border border-slate-800 bg-slate-900/60 p-4'
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span
                          className={cn(
                            'rounded border px-1.5 py-0.5 text-xs font-medium',
                            statusColor[r.status] ?? statusColor.DISMISSED,
                          )}
                        >
                          {r.status.replace('_', ' ')}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium',
                            targetColor[r.targetType] ?? 'text-slate-400',
                          )}
                        >
                          {r.targetType}
                        </span>
                        <code className='rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400'>
                          {r.targetId.slice(0, 12)}…
                        </code>
                      </div>
                      <p className='mt-2 font-medium text-white'>{r.reason}</p>
                      {r.details && (
                        <p className='mt-1 text-sm text-slate-400 line-clamp-2'>{r.details}</p>
                      )}
                      <div className='mt-2 flex items-center gap-3 text-xs text-slate-500'>
                        <span>
                          by {r.reporter?.username ?? 'anonymous'}
                        </span>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex shrink-0 flex-col gap-1.5'>
                      {r.status !== 'RESOLVED' && (
                        <button
                          onClick={() => updateStatus(r.id, 'RESOLVED')}
                          disabled={actionLoading === r.id}
                          className='flex items-center gap-1.5 rounded-lg border border-green-900 bg-green-950/20 px-2.5 py-1 text-xs font-medium text-green-400 transition-colors hover:bg-green-950/40 disabled:opacity-50'
                        >
                          <CheckCircle className='h-3.5 w-3.5' />
                          Resolve
                        </button>
                      )}
                      {r.status === 'OPEN' && (
                        <button
                          onClick={() => updateStatus(r.id, 'UNDER_REVIEW')}
                          disabled={actionLoading === r.id}
                          className='flex items-center gap-1.5 rounded-lg border border-amber-900 bg-amber-950/20 px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-950/40 disabled:opacity-50'
                        >
                          Under Review
                        </button>
                      )}
                      {r.status !== 'DISMISSED' && r.status !== 'RESOLVED' && (
                        <button
                          onClick={() => updateStatus(r.id, 'DISMISSED')}
                          disabled={actionLoading === r.id}
                          className='flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 disabled:opacity-50'
                        >
                          <XCircle className='h-3.5 w-3.5' />
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-slate-400'>
          <span>
            Page {page} of {totalPages}
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
