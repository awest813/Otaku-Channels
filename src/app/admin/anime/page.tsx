'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Merge,
  RefreshCw,
  Star,
  StarOff,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface AnimeRecord {
  id: string;
  slug: string;
  title: string;
  titleEnglish: string | null;
  type: string;
  status: string;
  isVisible: boolean;
  isFeatured: boolean;
  releaseYear: number | null;
  rating: number | null;
  malId: number | null;
  createdAt: string;
  updatedAt: string;
  _count: { contentSources: number; episodes: number };
}

interface AnimeResponse {
  data: AnimeRecord[];
  total: number;
  page: number;
  limit: number;
}

export default function AnimeModerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [anime, setAnime] = React.useState<AnimeRecord[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  // Merge tool state
  const [mergeSourceId, setMergeSourceId] = React.useState('');
  const [mergeTargetId, setMergeTargetId] = React.useState('');
  const [merging, setMerging] = React.useState(false);
  const [mergeResult, setMergeResult] = React.useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const isVisible = searchParams.get('isVisible') ?? '';
  const isFeatured = searchParams.get('isFeatured') ?? '';

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchAnime = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      if (isVisible) params.set('isVisible', isVisible);
      if (isFeatured) params.set('isFeatured', isFeatured);

      const res = await fetch(`/api/admin/anime?${params}`, {
        headers: authHeader,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AnimeResponse = await res.json();
      setAnime(json.data);
      setTotal(json.total);
    } catch {
      setError('Failed to load anime');
    } finally {
      setLoading(false);
    }
  }, [page, search, isVisible, isFeatured]);

  React.useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete('page');
    router.push(`/admin/anime?${p}`);
  };

  const toggleVisibility = async (record: AnimeRecord) => {
    if (actionLoading) return;
    setActionLoading(`${record.id}-vis`);
    try {
      const res = await fetch(`/api/admin/anime/${record.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ isVisible: !record.isVisible }),
      });
      if (!res.ok) throw new Error();
      await fetchAnime();
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFeatured = async (record: AnimeRecord) => {
    if (actionLoading) return;
    setActionLoading(`${record.id}-feat`);
    try {
      const res = await fetch(`/api/admin/anime/${record.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ isFeatured: !record.isFeatured }),
      });
      if (!res.ok) throw new Error();
      await fetchAnime();
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMerge = async () => {
    if (!mergeSourceId.trim() || !mergeTargetId.trim()) {
      alert('Both Source ID and Target ID are required');
      return;
    }
    if (!confirm(`Merge "${mergeSourceId}" into "${mergeTargetId}"? This cannot be undone.`))
      return;

    setMerging(true);
    setMergeResult(null);
    try {
      const res = await fetch('/api/admin/anime/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ sourceId: mergeSourceId.trim(), targetId: mergeTargetId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? 'Merge failed');
      setMergeResult(`Merged successfully into ${json.mergedInto}`);
      setMergeSourceId('');
      setMergeTargetId('');
      await fetchAnime();
    } catch (e: any) {
      setMergeResult(`Error: ${e.message}`);
    } finally {
      setMerging(false);
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Anime Moderation</h1>
          <p className='text-sm text-slate-400'>{total.toLocaleString()} titles</p>
        </div>
        <button
          onClick={fetchAnime}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {/* Merge tool */}
      <section className='rounded-xl border border-slate-700 bg-slate-900/60 p-4'>
        <h2 className='mb-3 flex items-center gap-2 text-sm font-semibold text-white'>
          <Merge className='h-4 w-4 text-cyan-400' />
          Merge Duplicate Titles
        </h2>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-slate-500'>Source ID (will be hidden)</label>
            <input
              value={mergeSourceId}
              onChange={(e) => setMergeSourceId(e.target.value)}
              placeholder='cuid...'
              className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-slate-500'>Target ID (kept)</label>
            <input
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              placeholder='cuid...'
              className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none'
            />
          </div>
          <button
            onClick={handleMerge}
            disabled={merging || !mergeSourceId || !mergeTargetId}
            className='rounded-lg bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-50'
          >
            {merging ? 'Merging…' : 'Merge'}
          </button>
        </div>
        {mergeResult && (
          <p
            className={cn(
              'mt-2 text-sm',
              mergeResult.startsWith('Error') ? 'text-red-400' : 'text-green-400',
            )}
          >
            {mergeResult}
          </p>
        )}
      </section>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <input
          type='text'
          placeholder='Search title or slug…'
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value);
          }}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none'
        />
        <select
          value={isVisible}
          onChange={(e) => updateParam('isVisible', e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value=''>All visibility</option>
          <option value='true'>Visible</option>
          <option value='false'>Hidden</option>
        </select>
        <select
          value={isFeatured}
          onChange={(e) => updateParam('isFeatured', e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value=''>All featured</option>
          <option value='true'>Featured</option>
          <option value='false'>Not featured</option>
        </select>
      </div>

      {error && (
        <div className='rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Table */}
      <div className='overflow-x-auto rounded-xl border border-slate-800'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-800 bg-slate-900/60'>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Title
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell'>
                Type / Year
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell'>
                Sources
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden lg:table-cell'>
                ID
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wide'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-800'>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className='px-4 py-3'>
                      <div className='h-4 animate-pulse rounded bg-slate-800' />
                    </td>
                  </tr>
                ))
              : anime.map((a) => (
                  <tr
                    key={a.id}
                    className={cn(
                      'transition-colors hover:bg-slate-900/40',
                      !a.isVisible && 'opacity-50',
                    )}
                  >
                    <td className='px-4 py-3'>
                      <p className='font-medium text-white'>{a.titleEnglish ?? a.title}</p>
                      {a.titleEnglish && (
                        <p className='text-xs text-slate-500'>{a.title}</p>
                      )}
                      <div className='mt-0.5 flex gap-1.5'>
                        {!a.isVisible && (
                          <span className='text-xs text-slate-500'>[hidden]</span>
                        )}
                        {a.isFeatured && (
                          <span className='text-xs text-cyan-500'>[featured]</span>
                        )}
                      </div>
                    </td>
                    <td className='hidden px-4 py-3 text-slate-400 sm:table-cell'>
                      <span className='capitalize'>{a.type?.toLowerCase()}</span>
                      {a.releaseYear && ` · ${a.releaseYear}`}
                    </td>
                    <td className='hidden px-4 py-3 text-slate-400 md:table-cell'>
                      {a._count.contentSources} src · {a._count.episodes} ep
                    </td>
                    <td className='hidden px-4 py-3 lg:table-cell'>
                      <code
                        className='cursor-pointer rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400 hover:text-white'
                        onClick={() => navigator.clipboard.writeText(a.id)}
                        title='Click to copy'
                      >
                        {a.id.slice(0, 8)}…
                      </code>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-end gap-1'>
                        <button
                          onClick={() => toggleVisibility(a)}
                          disabled={!!actionLoading}
                          title={a.isVisible ? 'Hide title' : 'Show title'}
                          className={cn(
                            'rounded p-1.5 transition-colors disabled:opacity-50',
                            a.isVisible
                              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              : 'text-green-400 hover:bg-green-950/30',
                          )}
                        >
                          {a.isVisible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </button>
                        <button
                          onClick={() => toggleFeatured(a)}
                          disabled={!!actionLoading}
                          title={a.isFeatured ? 'Unfeature' : 'Feature'}
                          className={cn(
                            'rounded p-1.5 transition-colors disabled:opacity-50',
                            a.isFeatured
                              ? 'text-cyan-400 hover:bg-cyan-950/30'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                          )}
                        >
                          {a.isFeatured ? (
                            <Star className='h-4 w-4 fill-current' />
                          ) : (
                            <StarOff className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-slate-400'>
          <span>
            Page {page} of {totalPages} · {total} titles
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
