'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  EyeOff,
  Link2Off,
  RefreshCw,
  Users,
} from 'lucide-react';

import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';

interface Stats {
  users: number;
  anime: number;
  channels: number;
  pendingSources: number;
  openReports: number;
  bannedUsers: number;
  hiddenAnime: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href?: string;
  accent?: string;
}) {
  const inner = (
    <div
      className={cn(
        'flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors',
        href && 'hover:border-slate-700 hover:bg-slate-900',
      )}
    >
      <div>
        <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>{label}</p>
        <p className={cn('mt-1 text-2xl font-bold', accent ?? 'text-white')}>{value}</p>
      </div>
      <div
        className={cn(
          'rounded-lg p-2',
          accent ? 'bg-slate-800' : 'bg-slate-800',
        )}
      >
        <Icon className={cn('h-5 w-5', accent ?? 'text-slate-400')} />
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setStats(json.data);
    } catch (e) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Dashboard</h1>
          <p className='mt-0.5 text-sm text-slate-400'>
            Welcome back, {user?.username}. Here's the current catalog health.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-700 hover:text-white'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {error && (
        <div className='rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Stats grid */}
      {loading ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className='h-24 animate-pulse rounded-xl border border-slate-800 bg-slate-900/60'
            />
          ))}
        </div>
      ) : stats ? (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
          <StatCard
            label='Total Users'
            value={stats.users.toLocaleString()}
            icon={Users}
            href='/admin/users'
          />
          <StatCard
            label='Banned Users'
            value={stats.bannedUsers}
            icon={Users}
            href='/admin/users?banned=true'
            accent={stats.bannedUsers > 0 ? 'text-amber-400' : undefined}
          />
          <StatCard
            label='Anime Titles'
            value={stats.anime.toLocaleString()}
            icon={BookOpen}
            href='/admin/anime'
          />
          <StatCard
            label='Hidden Titles'
            value={stats.hiddenAnime}
            icon={EyeOff}
            href='/admin/anime?isVisible=false'
            accent={stats.hiddenAnime > 0 ? 'text-slate-300' : undefined}
          />
          <StatCard
            label='Open Reports'
            value={stats.openReports}
            icon={ClipboardList}
            href='/admin/reports'
            accent={stats.openReports > 0 ? 'text-red-400' : undefined}
          />
          <StatCard
            label='Pending Sources'
            value={stats.pendingSources}
            icon={Link2Off}
            href='/admin/sources'
            accent={stats.pendingSources > 0 ? 'text-amber-400' : undefined}
          />
          <StatCard
            label='Live Channels'
            value={stats.channels}
            icon={BriefcaseBusiness}
          />
        </div>
      ) : null}

      {/* Quick actions */}
      <section>
        <h2 className='mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wide'>
          Quick Actions
        </h2>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {[
            { label: 'Review Reports', href: '/admin/reports', icon: ClipboardList },
            { label: 'Manage Users', href: '/admin/users', icon: Users },
            { label: 'Moderate Anime', href: '/admin/anime', icon: BookOpen },
            { label: 'Job Status', href: '/admin/jobs', icon: BriefcaseBusiness },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className='flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-900 hover:text-white'
            >
              <action.icon className='h-4 w-4 text-cyan-400' />
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Attention needed */}
      {stats && (stats.openReports > 0 || stats.pendingSources > 0) && (
        <section>
          <h2 className='mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4 text-amber-400' />
            Needs Attention
          </h2>
          <div className='space-y-2'>
            {stats.openReports > 0 && (
              <Link
                href='/admin/reports'
                className='flex items-center justify-between rounded-lg border border-amber-900/40 bg-amber-950/20 px-4 py-3 text-sm transition-colors hover:border-amber-900/60'
              >
                <span className='text-amber-300'>
                  {stats.openReports} open user report{stats.openReports !== 1 ? 's' : ''} awaiting
                  review
                </span>
                <span className='text-amber-500 text-xs'>Review →</span>
              </Link>
            )}
            {stats.pendingSources > 0 && (
              <Link
                href='/admin/sources'
                className='flex items-center justify-between rounded-lg border border-cyan-900/40 bg-cyan-950/20 px-4 py-3 text-sm transition-colors hover:border-cyan-900/60'
              >
                <span className='text-cyan-300'>
                  {stats.pendingSources} content source{stats.pendingSources !== 1 ? 's' : ''}{' '}
                  pending review
                </span>
                <span className='text-cyan-500 text-xs'>Review →</span>
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
