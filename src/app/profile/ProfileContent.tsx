'use client';

import { BookMarked, CheckCircle, Save, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { useAuth } from '@/context/auth';

interface UserProfile {
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferSub: boolean;
  preferDub: boolean;
  favoriteGenres: string[];
  preferredSources: string[];
  theme: string;
}

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mecha',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
];

const SOURCE_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'crunchyroll', label: 'Crunchyroll' },
  { value: 'tubi', label: 'Tubi' },
  { value: 'retrocrush', label: 'RetroCrush' },
  { value: 'pluto', label: 'Pluto TV' },
];

export default function ProfileContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = React.useState('');
  const [bio, setBio] = React.useState('');
  const [preferSub, setPreferSub] = React.useState(true);
  const [preferDub, setPreferDub] = React.useState(false);
  const [favoriteGenres, setFavoriteGenres] = React.useState<string[]>([]);
  const [preferredSources, setPreferredSources] = React.useState<string[]>([]);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Load profile from backend
  React.useEffect(() => {
    if (!user) return;
    setLoadingProfile(true);
    fetch('/api/user/profile', { credentials: 'include' })
      .then((r) => {
        if (r.status === 404) return null; // profile not set up yet
        if (!r.ok) throw new Error(`Profile fetch failed: ${r.status}`);
        return r.json() as Promise<{ profile: UserProfile }>;
      })
      .then((data) => {
        if (data?.profile) {
          const p = data.profile;
          setProfile(p);
          setDisplayName(p.displayName ?? '');
          setBio(p.bio ?? '');
          setPreferSub(p.preferSub ?? true);
          setPreferDub(p.preferDub ?? false);
          setFavoriteGenres(p.favoriteGenres ?? []);
          setPreferredSources(p.preferredSources ?? []);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn('[ProfileContent] failed to load profile:', err);
      })
      .finally(() => setLoadingProfile(false));
  }, [user]);

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleSource = (source: string) => {
    setPreferredSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
          preferSub,
          preferDub,
          favoriteGenres,
          preferredSources,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Failed to save');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save preferences'
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className='flex items-center justify-center py-20'>
        <span className='h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      {/* Header */}
      <div className='mb-8 flex items-center gap-4'>
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/20 ring-2 ring-cyan-500/40'>
          <User className='h-7 w-7 text-cyan-400' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-white md:text-3xl'>
            {profile?.displayName ?? user.username}
          </h1>
          <p className='text-sm text-slate-400'>
            @{user.username} · {user.email}
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className='mb-8 flex flex-wrap gap-3'>
        <Link
          href='/watchlist'
          className='flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-white'
        >
          <BookMarked className='h-4 w-4 text-cyan-400' />
          My Watchlist
        </Link>
      </div>

      {/* Preferences form */}
      <form
        onSubmit={handleSave}
        className='space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-6'
      >
        <h2 className='text-lg font-semibold text-white'>Preferences</h2>

        {/* Display name */}
        <div>
          <label
            htmlFor='displayName'
            className='mb-1.5 block text-sm font-medium text-slate-300'
          >
            Display name
          </label>
          <input
            id='displayName'
            type='text'
            maxLength={64}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={user.username}
            className='w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400'
          />
        </div>

        {/* Bio */}
        <div>
          <label
            htmlFor='bio'
            className='mb-1.5 block text-sm font-medium text-slate-300'
          >
            Bio
          </label>
          <textarea
            id='bio'
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='Tell us about yourself…'
            className='w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400'
          />
        </div>

        {/* Sub / Dub preference */}
        <div>
          <p className='mb-2 text-sm font-medium text-slate-300'>
            Language preference
          </p>
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => {
                setPreferSub(true);
                setPreferDub(false);
              }}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                preferSub
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
              )}
            >
              Subtitled (Sub)
            </button>
            <button
              type='button'
              onClick={() => {
                setPreferDub(true);
                setPreferSub(false);
              }}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                preferDub
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
              )}
            >
              Dubbed (Dub)
            </button>
            <button
              type='button'
              onClick={() => {
                setPreferSub(true);
                setPreferDub(true);
              }}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                preferSub && preferDub
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
              )}
            >
              No preference
            </button>
          </div>
        </div>

        {/* Favorite genres */}
        <div>
          <p className='mb-2 text-sm font-medium text-slate-300'>
            Favorite genres
          </p>
          <div className='flex flex-wrap gap-2'>
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type='button'
                onClick={() => toggleGenre(genre)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  favoriteGenres.includes(genre)
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred sources */}
        <div>
          <p className='mb-2 text-sm font-medium text-slate-300'>
            Preferred streaming sources
          </p>
          <div className='flex flex-wrap gap-2'>
            {SOURCE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type='button'
                onClick={() => toggleSource(value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  preferredSources.includes(value)
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-900/30 px-4 py-2.5 text-sm text-red-400'
          >
            {error}
          </p>
        )}

        {/* Save button */}
        <div className='flex items-center gap-3'>
          <button
            type='submit'
            disabled={saving}
            className={cn(
              'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold',
              'bg-cyan-500 text-slate-950 transition-colors hover:bg-cyan-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
              saving && 'cursor-not-allowed opacity-60'
            )}
          >
            {saving ? (
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent' />
            ) : saved ? (
              <CheckCircle className='h-4 w-4' />
            ) : (
              <Save className='h-4 w-4' />
            )}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save preferences'}
          </button>
        </div>
      </form>
    </>
  );
}
