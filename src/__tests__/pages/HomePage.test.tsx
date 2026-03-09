import { render, screen } from '@testing-library/react';

// Mock next/navigation for the TopNav component
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
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

// Mock MediaRail to avoid ResizeObserver dependency in jsdom
jest.mock('@/components/media/MediaRail', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <section>{title}</section>,
}));

import React from 'react';

import { ToastProvider } from '@/components/ui/Toast';

import HomePage from '@/app/page';

describe('Homepage', () => {
  it('renders the Anime TV hero and rails', async () => {
    const Page = await HomePage();
    render(<ToastProvider>{Page as React.ReactElement}</ToastProvider>);

    expect(screen.getByText(/Trending Free Anime/i)).toBeInTheDocument();
    expect(screen.getByText(/Official on YouTube/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Channels/i)).toBeInTheDocument();
  });
});
