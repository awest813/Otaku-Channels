'use client';

import { Eye, EyeOff, Tv, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { useAuth } from '@/context/auth';

export default function SignupForm() {
  const { signup, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({ email, username, password });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl'>
      {/* Header */}
      <div className='mb-8 text-center'>
        <Link
          href='/'
          className='mb-4 inline-flex items-center gap-2 text-xl font-bold text-white'
        >
          <Tv className='h-6 w-6 text-cyan-400' />
          Anime TV
        </Link>
        <h1 className='text-2xl font-bold text-white'>Create your account</h1>
        <p className='mt-1 text-sm text-slate-400'>
          Save your watchlist and watch history across devices
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4' noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor='email'
            className='mb-1.5 block text-sm font-medium text-slate-300'
          >
            Email address
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400',
              'border-slate-700 focus:border-transparent'
            )}
            placeholder='you@example.com'
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor='username'
            className='mb-1.5 block text-sm font-medium text-slate-300'
          >
            Username
          </label>
          <input
            id='username'
            type='text'
            autoComplete='username'
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(
              'w-full rounded-lg border bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400',
              'border-slate-700 focus:border-transparent'
            )}
            placeholder='coolwatcher42'
          />
          <p className='mt-1 text-xs text-slate-500'>
            Letters, numbers, underscores and hyphens only. 3–32 characters.
          </p>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor='password'
            className='mb-1.5 block text-sm font-medium text-slate-300'
          >
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='new-password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'w-full rounded-lg border bg-slate-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400',
                'border-slate-700 focus:border-transparent'
              )}
              placeholder='At least 8 chars, 1 uppercase, 1 number'
            />
            <button
              type='button'
              onClick={() => setShowPassword((p) => !p)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
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

        {/* Submit */}
        <button
          type='submit'
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold',
            'bg-cyan-500 text-slate-950 transition-colors hover:bg-cyan-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
            loading && 'cursor-not-allowed opacity-60'
          )}
        >
          {loading ? (
            <span
              className='h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent'
              aria-hidden='true'
            />
          ) : (
            <UserPlus className='h-4 w-4' />
          )}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className='mt-6 text-center text-sm text-slate-400'>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium text-cyan-400 hover:text-cyan-300 focus-visible:underline focus-visible:outline-none'
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
