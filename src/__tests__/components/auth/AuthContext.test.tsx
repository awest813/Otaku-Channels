import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';

import { AuthProvider, useAuth } from '@/context/auth';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper component to expose auth context values
function AuthDisplay() {
  const { user, loading, login, signup, logout } = useAuth();
  if (loading) return <div>Loading…</div>;
  return (
    <div>
      <div data-testid='user'>{user ? user.username : 'guest'}</div>
      <button
        onClick={() =>
          login({ email: 'test@example.com', password: 'Password1' })
        }
      >
        Login
      </button>
      <button
        onClick={() =>
          signup({
            email: 'new@example.com',
            username: 'newuser',
            password: 'Password1',
          })
        }
      >
        Signup
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('starts with guest when /me returns 401', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthDisplay />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('guest');
    });
  });

  it('rehydrates user from /me on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'u1',
          email: 'test@example.com',
          username: 'testuser',
          role: 'USER',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
      }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthDisplay />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  it('sets user after successful login', async () => {
    // /me returns 401 on mount
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    });
    // login call returns user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'u2',
          email: 'test@example.com',
          username: 'loginuser',
          role: 'USER',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'tok',
      }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthDisplay />
        </AuthProvider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('guest')
    );

    await act(async () => {
      await fireEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('loginuser');
    });
  });

  it('clears user after logout', async () => {
    // /me returns a user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 'u3',
          email: 'user@example.com',
          username: 'logoutuser',
          role: 'USER',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
      }),
    });
    // logout call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await act(async () => {
      render(
        <AuthProvider>
          <AuthDisplay />
        </AuthProvider>
      );
    });

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('logoutuser')
    );

    await act(async () => {
      await fireEvent.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('guest');
    });
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn());

    expect(() => render(<AuthDisplay />)).toThrow(
      'useAuth must be used within AuthProvider'
    );

    consoleSpy.mockRestore();
  });
});
