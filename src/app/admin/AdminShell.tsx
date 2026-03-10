'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import {
  BarChart2,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Link2Off,
  Merge,
  Settings2,
  Shield,
  Users,
  Wifi,
} from 'lucide-react';

import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/admin', icon: BarChart2, exact: true },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Anime', href: '/admin/anime', icon: BookOpen },
  { label: 'Reports', href: '/admin/reports', icon: ClipboardList },
  { label: 'Sources', href: '/admin/sources', icon: Wifi },
  { label: 'Jobs', href: '/admin/jobs', icon: BriefcaseBusiness },
  { label: 'Audit Log', href: '/admin/audit', icon: FileText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && (!user || !['ADMIN', 'MODERATOR'].includes(user.role))) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-slate-950'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400' />
      </div>
    );
  }

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return null;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className='flex min-h-screen bg-slate-950'>
      {/* Sidebar */}
      <aside className='hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 lg:flex'>
        <div className='flex h-14 items-center gap-2 border-b border-slate-800 px-4'>
          <Shield className='h-4 w-4 text-cyan-400' />
          <span className='text-sm font-semibold text-white'>Admin Panel</span>
        </div>

        <nav className='flex flex-1 flex-col gap-0.5 p-3' aria-label='Admin navigation'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(item.href, item.exact)
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              )}
            >
              <item.icon className='h-4 w-4 shrink-0' />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='border-t border-slate-800 p-3'>
          <div className='rounded-lg bg-slate-800/50 px-3 py-2'>
            <p className='text-xs font-medium text-slate-300'>{user.username}</p>
            <p className='text-xs text-slate-500'>{user.role}</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className='flex flex-1 flex-col min-w-0'>
        {/* Mobile header */}
        <div className='flex h-14 items-center gap-3 border-b border-slate-800 px-4 lg:hidden'>
          <Shield className='h-4 w-4 text-cyan-400' />
          <span className='text-sm font-semibold text-white'>Admin</span>
          <div className='ml-auto flex gap-1 overflow-x-auto'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'shrink-0 rounded px-2 py-1 text-xs font-medium transition-colors',
                  isActive(item.href, item.exact)
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'text-slate-400 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className='flex-1 overflow-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
