import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Auth mock — stable object reference to avoid infinite effect loops
jest.mock('@/context/auth', () => {
  const stableUser = {
    id: 'u1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'USER',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  };
  return {
    useAuth: () => ({
      user: stableUser,
      loading: false,
      error: null,
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
    }),
  };
});

// Watchlist mock — stable list reference
jest.mock('@/hooks/useWatchlist', () => {
  const stableList = [
    {
      id: 'a1',
      slug: 'naruto',
      title: 'Naruto',
      thumbnail: '/naruto.jpg',
      sourceType: 'youtube',
      releaseYear: 2002,
    },
    {
      id: 'a2',
      slug: 'bleach',
      title: 'Bleach',
      thumbnail: '/bleach.jpg',
      sourceType: 'youtube',
      releaseYear: 2004,
    },
  ];
  return {
    useWatchlist: () => ({
      list: stableList,
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      has: jest.fn(() => false),
      synced: true,
    }),
  };
});

// Recently viewed mock — stable items reference
jest.mock('@/hooks/useRecentlyViewed', () => {
  const stableItems = [
    {
      id: 'a3',
      slug: 'one-piece',
      title: 'One Piece',
      thumbnail: '/one-piece.jpg',
      sourceType: 'youtube',
      releaseYear: 1999,
      viewedAt: 1700000000000,
    },
  ];
  return {
    useRecentlyViewed: () => ({
      items: stableItems,
      trackView: jest.fn(),
    }),
  };
});

// Mock fetch for profile load (404 = no profile yet)
const mockFetch = jest.fn().mockResolvedValue({
  ok: false,
  status: 404,
  json: async () => ({}),
});
global.fetch = mockFetch;

import ProfileContent from '@/app/profile/ProfileContent';

describe('ProfileContent', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });
  });

  it('renders user info header after loading', async () => {
    render(<ProfileContent />);

    await waitFor(() => {
      expect(
        screen.getByText('@testuser · test@example.com')
      ).toBeInTheDocument();
    });
  });

  it('renders watchlist preview section with item titles', async () => {
    render(<ProfileContent />);

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /watchlist preview/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByText('Bleach')).toBeInTheDocument();
  });

  it('renders watch history preview section with item titles', async () => {
    render(<ProfileContent />);

    await waitFor(() => {
      expect(
        screen.getByRole('region', { name: /watch history preview/i })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('One Piece')).toBeInTheDocument();
  });

  it('renders preferences form fields', async () => {
    render(<ProfileContent />);

    await waitFor(() => {
      expect(screen.getByText('Preferences')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByText(/language preference/i)).toBeInTheDocument();
    expect(screen.getByText(/favorite genres/i)).toBeInTheDocument();
    expect(
      screen.getByText(/preferred streaming sources/i)
    ).toBeInTheDocument();
  });

  it('shows "See all" link when watchlist is non-empty', async () => {
    render(<ProfileContent />);

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /see all/i });
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
