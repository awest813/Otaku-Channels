import { render, screen } from '@testing-library/react';

// Mock next/navigation for the TopNav component
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
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

// Mock the backend so the async server component uses mock data
jest.mock('@/lib/backend');

// Mock the auth context so components that call useAuth don't throw
jest.mock('@/context/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    clearError: jest.fn(),
  }),
}));

// Mock MediaRail to avoid ResizeObserver dependency in jsdom
jest.mock('@/components/media/MediaRail', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <section>{title}</section>,
}));

// Mock TrendingRail (async server component) to return a deterministic stub
jest.mock('@/components/media/TrendingRail', () => ({
  __esModule: true,
  default: () => <section>Trending Now</section>,
}));

// Mock ForYouRail (client component using hooks) to avoid hook dependencies
jest.mock('@/components/media/ForYouRail', () => ({
  __esModule: true,
  default: () => null,
}));

import React from 'react';

import { ToastProvider } from '@/components/ui/Toast';

import HomePage from '@/app/page';

describe('Homepage', () => {
  it('renders the Anime TV hero and rails', async () => {
    const Page = await HomePage();
    render(<ToastProvider>{Page as React.ReactElement}</ToastProvider>);

    expect(screen.getByText(/Trending Now/i)).toBeInTheDocument();
    expect(screen.getByText(/Official on YouTube/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Channels/i)).toBeInTheDocument();
  });
});
