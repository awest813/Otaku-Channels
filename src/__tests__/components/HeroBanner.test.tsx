import { render, screen } from '@testing-library/react';
import React from 'react';

import HeroBanner from '@/components/media/HeroBanner';

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, ...props }: { alt: string }) => <img alt={alt} {...props} />,
}));

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

const mockSeries = {
  id: 's1',
  slug: 'blade-of-eternity',
  title: 'Blade of Eternity',
  description: 'A young swordsman discovers ancient powers.',
  thumbnail: 'https://example.com/thumb.jpg',
  heroImage: 'https://example.com/hero.jpg',
  type: 'series' as const,
  genres: ['Action', 'Fantasy'],
  language: 'sub' as const,
  sourceName: 'YouTube Official',
  sourceType: 'youtube' as const,
  isEmbeddable: true,
  watchUrl: 'https://www.youtube.com/watch?v=abc123',
  releaseYear: 2021,
  episodeCount: 24,
  tags: ['Trending'],
};

describe('HeroBanner', () => {
  it('renders the series title', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(
      screen.getByRole('heading', { name: 'Blade of Eternity' })
    ).toBeInTheDocument();
  });

  it('renders the series description', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(
      screen.getByText('A young swordsman discovers ancient powers.')
    ).toBeInTheDocument();
  });

  it('renders genre pills', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
  });

  it('renders the release year', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('renders "Watch Now" link for embeddable content', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(screen.getByRole('link', { name: /Watch Now/i })).toHaveAttribute(
      'href',
      '/series/blade-of-eternity'
    );
  });

  it('renders "Watch on source name" link for non-embeddable content', () => {
    render(<HeroBanner series={{ ...mockSeries, isEmbeddable: false }} />);
    expect(
      screen.getByRole('link', { name: /Watch on YouTube Official/i })
    ).toBeInTheDocument();
  });

  it('renders the hero image with the series title as alt text', () => {
    render(<HeroBanner series={mockSeries} />);
    expect(screen.getByAltText('Blade of Eternity')).toBeInTheDocument();
  });
});
