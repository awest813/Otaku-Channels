'use client';

/**
 * AuthContext — session lifecycle management.
 *
 * Wraps the app so any component can read the current user and call
 * login / signup / logout without prop-drilling.
 *
 * Flow:
 *  1. On mount, GET /api/auth/me to rehydrate from an existing cookie.
 *  2. login() / signup() POST to /api/auth/login or /api/auth/register.
 *  3. logout() POSTs to /api/auth/logout (server clears the cookie).
 */

import * as React from 'react';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export interface UserProfile {
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  preferSub: boolean;
  preferDub: boolean;
  preferredLanguage: string;
  favoriteGenres: string[];
  preferredSources: string[];
  theme: string;
}

interface SignupInput {
  email: string;
  username: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the initial /me check is in flight */
  loading: boolean;
  /** Non-null when the last auth action failed */
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser };
    return data.user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Rehydrate session on mount
  React.useEffect(() => {
    fetchMe()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? 'Login failed');
    }
    const data = (await res.json()) as { user: AuthUser };
    setUser(data.user);
  }, []);

  const signup = React.useCallback(async (input: SignupInput) => {
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? 'Signup failed');
    }
    const data = (await res.json()) as { user: AuthUser };
    setUser(data.user);
  }, []);

  const logout = React.useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {
      // best-effort
    });
    setUser(null);
  }, []);

  const clearError = React.useCallback(() => setError(null), []);

  const value = React.useMemo(
    () => ({ user, loading, error, login, signup, logout, clearError }),
    [user, loading, error, login, signup, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
