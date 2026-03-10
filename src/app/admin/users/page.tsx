'use client';

import { Ban, ChevronLeft, ChevronRight, RefreshCw, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  isBanned: boolean;
  createdAt: string;
  _count: { watchHistory: number; favorites: number; reports: number };
}

interface UsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

const ROLES = ['USER', 'MODERATOR', 'ADMIN'] as const;

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const roleFilter = searchParams.get('role') ?? '';
  const bannedFilter = searchParams.get('banned') ?? '';

  const authHeader = React.useMemo<Record<string, string>>(() => {
    const tok =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
    const headers: Record<string, string> = {};
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
    return headers;
  }, []);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (bannedFilter) params.set('banned', bannedFilter);

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: authHeader,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: UsersResponse = await res.json();
      setUsers(json.data);
      setTotal(json.total);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, bannedFilter, authHeader]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    p.delete('page');
    router.push(`/admin/users?${p}`);
  };

  const toggleBan = async (user: AdminUser) => {
    if (actionLoading) return;
    const confirmed = confirm(
      `${user.isBanned ? 'Unban' : 'Ban'} user "${user.username}"?`
    );
    if (!confirmed) return;

    setActionLoading(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ banned: !user.isBanned }),
      });
      if (!res.ok) throw new Error();
      await fetchUsers();
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const changeRole = async (user: AdminUser, newRole: string) => {
    if (actionLoading) return;
    setActionLoading(`${user.id}-role`);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      await fetchUsers();
    } catch {
      alert('Role change failed');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 50);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-white'>Users</h1>
          <p className='text-sm text-slate-400'>
            {total.toLocaleString()} total users
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <input
          type='text'
          placeholder='Search username or email…'
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter')
              updateParam('search', (e.target as HTMLInputElement).value);
          }}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none'
        />
        <select
          value={roleFilter}
          onChange={(e) => updateParam('role', e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value=''>All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={bannedFilter}
          onChange={(e) => updateParam('banned', e.target.value)}
          className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none'
        >
          <option value=''>All statuses</option>
          <option value='false'>Active</option>
          <option value='true'>Banned</option>
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
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400'>
                User
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400'>
                Role
              </th>
              <th className='hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 sm:table-cell'>
                Activity
              </th>
              <th className='hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400 md:table-cell'>
                Joined
              </th>
              <th className='px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-400'>
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
              : users.map((u) => (
                  <tr
                    key={u.id}
                    className={cn(
                      'transition-colors hover:bg-slate-900/40',
                      u.isBanned && 'opacity-60'
                    )}
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4 shrink-0 text-slate-500' />
                        <div>
                          <p className='font-medium text-white'>{u.username}</p>
                          <p className='text-xs text-slate-500'>{u.email}</p>
                        </div>
                        {u.isBanned && (
                          <span className='rounded bg-red-950 px-1.5 py-0.5 text-xs text-red-400'>
                            banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        disabled={!!actionLoading}
                        className='rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-cyan-500 focus:outline-none disabled:opacity-50'
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='hidden px-4 py-3 text-slate-400 sm:table-cell'>
                      <span title='Watch history'>
                        {u._count.watchHistory} watches
                      </span>
                      {' · '}
                      <span title='Reports filed'>
                        {u._count.reports} reports
                      </span>
                    </td>
                    <td className='hidden px-4 py-3 text-xs text-slate-500 md:table-cell'>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <button
                        onClick={() => toggleBan(u)}
                        disabled={!!actionLoading}
                        className={cn(
                          'flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                          u.isBanned
                            ? 'border-green-800 bg-green-950/30 text-green-400 hover:bg-green-950/50'
                            : 'border-red-900 bg-red-950/20 text-red-400 hover:bg-red-950/40'
                        )}
                      >
                        <Ban className='h-3 w-3' />
                        {actionLoading === u.id
                          ? '…'
                          : u.isBanned
                          ? 'Unban'
                          : 'Ban'}
                      </button>
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
            Page {page} of {totalPages} · {total} users
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
