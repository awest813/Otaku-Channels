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

import React from 'react';

import HomePage from '@/app/page';

describe('Homepage', () => {
  it('renders the Anime TV hero and rails', async () => {
    const Page = await HomePage();
    render(Page as React.ReactElement);

    expect(screen.getByText(/Trending Free Anime/i)).toBeInTheDocument();
    expect(screen.getByText(/Official YouTube Anime/i)).toBeInTheDocument();
    expect(screen.getByText(/Live Channels/i)).toBeInTheDocument();
  });
});
