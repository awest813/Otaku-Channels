'use client';

import * as React from 'react';
import { ExternalLink, RefreshCw, Wifi, WifiOff } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProviderStat {
  domain: string;
  label: string | null;
  isActive: boolean;
  sources: { active: number; removed: number; pending: number; total: number };
  lastCheckedAt: string | null;
  health: number;
}

interface BrokenTitleSource {
  id: string;
  url: string;
  lastCheckedAt: string | null;
  anime: { id: string; slug: string; title: string } | null;
}

interface BrokenEpisodeSource {
  id: string;
  url: string;
  updatedAt: string;
  episode: {
    id: string;
    episodeNumber: number;
    title: string | null;
    anime: { id: string; slug: string; title: string };
  } | null;
}

interface BrokenData {
  titleSources: BrokenTitleSource[];
  episodeSources: BrokenEpisodeSource[];
}

function HealthBar({ value }: { value: number }) {
  const color =
    value >= 90 ? 'bg-green-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className='flex items-center gap-2'>
      <div className='h-1.5 w-20 rounded-full bg-slate-700'>
        <div
          className={cn('h-1.5 rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('text-xs font-medium', value >= 90 ? 'text-green-400' : value >= 70 ? 'text-amber-400' : 'text-red-400')}>
        {value}%
      </span>
    </div>
  );
}

export default function SourcesPage() {
  const [providers, setProviders] = React.useState<ProviderStat[]>([]);
  const [broken, setBroken] = React.useState<BrokenData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<'providers' | 'broken'>('providers');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, brokenRes] = await Promise.all([
        fetch('/api/admin/sources/providers', { headers: authHeader, credentials: 'include' }),
        fetch('/api/admin/sources/broken', { headers: authHeader, credentials: 'include' }),
      ]);

      if (!provRes.ok || !brokenRes.ok) throw new Error('Failed to fetch data');

      const [provJson, brokenJson] = await Promise.all([provRes.json(), brokenRes.json()]);
      setProviders(provJson.data ?? []);
      setBroken(brokenJson.data ?? { titleSources: [], episodeSources: [] });
    } catch {
      setError('Failed to load source data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const brokenCount =
    (broken?.titleSources.length ?? 0) + (broken?.episodeSources.length ?? 0);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Content Sources</h1>
          <p className='text-sm text-slate-400'>
            {providers.length} providers · {brokenCount} broken links
          </p>
        </div>
        <button
          onClick={fetchAll}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1'>
        <button
          onClick={() => setTab('providers')}
          className={cn(
            'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            tab === 'providers'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-300',
          )}
        >
          Provider Health
        </button>
        <button
          onClick={() => setTab('broken')}
          className={cn(
            'flex items-center justify-center gap-2 flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            tab === 'broken'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:text-slate-300',
          )}
        >
          Broken Links
          {brokenCount > 0 && (
            <span className='rounded-full bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400'>
              {brokenCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className='rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Provider health table */}
      {tab === 'providers' && (
        <div className='overflow-x-auto rounded-xl border border-slate-800'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-800 bg-slate-900/60'>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                  Provider
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                  Health
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden sm:table-cell'>
                  Sources
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide hidden md:table-cell'>
                  Last Checked
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800'>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className='px-4 py-4'>
                        <div className='h-4 animate-pulse rounded bg-slate-800' />
                      </td>
                    </tr>
                  ))
                : providers.map((p) => (
                    <tr key={p.domain} className='transition-colors hover:bg-slate-900/40'>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {p.isActive ? (
                            <Wifi className='h-4 w-4 text-green-400' />
                          ) : (
                            <WifiOff className='h-4 w-4 text-slate-500' />
                          )}
                          <div>
                            <p className='font-medium text-white'>{p.label ?? p.domain}</p>
                            <p className='text-xs text-slate-500'>{p.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <HealthBar value={p.health} />
                      </td>
                      <td className='hidden px-4 py-3 text-slate-400 sm:table-cell'>
                        <span className='text-green-400'>{p.sources.active}</span> active
                        {p.sources.removed > 0 && (
                          <> · <span className='text-red-400'>{p.sources.removed}</span> dead</>
                        )}
                        {p.sources.pending > 0 && (
                          <> · <span className='text-amber-400'>{p.sources.pending}</span> pending</>
                        )}
                      </td>
                      <td className='hidden px-4 py-3 text-xs text-slate-500 md:table-cell'>
                        {p.lastCheckedAt
                          ? new Date(p.lastCheckedAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={cn(
                            'rounded border px-1.5 py-0.5 text-xs font-medium',
                            p.isActive
                              ? 'border-green-800 text-green-400 bg-green-950/20'
                              : 'border-slate-700 text-slate-500 bg-slate-800',
                          )}
                        >
                          {p.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Broken links */}
      {tab === 'broken' && (
        <div className='space-y-4'>
          {loading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className='h-16 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60'
                />
              ))}
            </div>
          ) : brokenCount === 0 ? (
            <div className='rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-12 text-center'>
              <p className='text-slate-400'>No broken links detected</p>
              <p className='mt-1 text-xs text-slate-600'>
                Run the source-check job to update status
              </p>
            </div>
          ) : (
            <>
              {/* Title-level broken sources */}
              {broken && broken.titleSources.length > 0 && (
                <div>
                  <h3 className='mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                    Title Sources ({broken.titleSources.length})
                  </h3>
                  <div className='overflow-x-auto rounded-xl border border-slate-800'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-slate-800 bg-slate-900/60'>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase'>Anime</th>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase'>URL</th>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase hidden md:table-cell'>Last Checked</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-800'>
                        {broken.titleSources.map((s) => (
                          <tr key={s.id} className='hover:bg-slate-900/40'>
                            <td className='px-4 py-2.5 text-white'>
                              {s.anime?.title ?? '—'}
                            </td>
                            <td className='px-4 py-2.5'>
                              <a
                                href={s.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 text-xs text-red-400 hover:text-red-300'
                              >
                                <span className='max-w-xs truncate'>{s.url}</span>
                                <ExternalLink className='h-3 w-3 shrink-0' />
                              </a>
                            </td>
                            <td className='hidden px-4 py-2.5 text-xs text-slate-500 md:table-cell'>
                              {s.lastCheckedAt
                                ? new Date(s.lastCheckedAt).toLocaleString()
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Episode-level broken sources */}
              {broken && broken.episodeSources.length > 0 && (
                <div>
                  <h3 className='mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                    Episode Sources ({broken.episodeSources.length})
                  </h3>
                  <div className='overflow-x-auto rounded-xl border border-slate-800'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-slate-800 bg-slate-900/60'>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase'>Anime · Episode</th>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-slate-400 uppercase'>URL</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-800'>
                        {broken.episodeSources.map((s) => (
                          <tr key={s.id} className='hover:bg-slate-900/40'>
                            <td className='px-4 py-2.5 text-white'>
                              <p>{s.episode?.anime.title ?? '—'}</p>
                              {s.episode && (
                                <p className='text-xs text-slate-500'>
                                  Ep {s.episode.episodeNumber}
                                  {s.episode.title ? ` — ${s.episode.title}` : ''}
                                </p>
                              )}
                            </td>
                            <td className='px-4 py-2.5'>
                              <a
                                href={s.url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-1 text-xs text-red-400 hover:text-red-300'
                              >
                                <span className='max-w-xs truncate'>{s.url}</span>
                                <ExternalLink className='h-3 w-3 shrink-0' />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
