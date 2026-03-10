import { render, screen } from '@testing-library/react';
import React from 'react';

import MediaCard from '@/components/media/MediaCard';
import { ToastProvider } from '@/components/ui/Toast';

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

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

const baseSeries = {
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

describe('MediaCard', () => {
  it('renders the series title', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    expect(screen.getByText('Blade of Eternity')).toBeInTheDocument();
  });

  it('links to the series detail page', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/series/blade-of-eternity');
  });

  it('renders the thumbnail image with alt text', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    expect(screen.getByAltText('Blade of Eternity')).toBeInTheDocument();
  });

  it('renders the release year', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    expect(screen.getByText('2021')).toBeInTheDocument();
  });

  it('renders the episode count for a series', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    expect(screen.getByText('24 eps')).toBeInTheDocument();
  });

  it('renders up to two genre tags', () => {
    renderWithProviders(<MediaCard item={baseSeries} />);
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
  });

  it('renders only the first two genres when more than two are present', () => {
    renderWithProviders(
      <MediaCard
        item={{ ...baseSeries, genres: ['Action', 'Fantasy', 'Adventure'] }}
      />
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Fantasy')).toBeInTheDocument();
    expect(screen.queryByText('Adventure')).not.toBeInTheDocument();
  });

  it('does not render episode count for a movie', () => {
    const movie = {
      id: 'm1',
      slug: 'eternal-gate',
      title: 'Eternal Gate',
      description: 'A gate between worlds opens.',
      thumbnail: 'https://example.com/movie-thumb.jpg',
      heroImage: 'https://example.com/movie-hero.jpg',
      type: 'movie' as const,
      genres: ['Fantasy'],
      language: 'sub' as const,
      sourceName: 'YouTube Official',
      sourceType: 'youtube' as const,
      isEmbeddable: true,
      watchUrl: 'https://www.youtube.com/watch?v=movie1',
      releaseYear: 2020,
      tags: [],
    };
    renderWithProviders(<MediaCard item={movie} />);
    expect(screen.queryByText(/eps/i)).not.toBeInTheDocument();
  });
});
