import { render, screen } from '@testing-library/react';
import React from 'react';

import HeroBannerSkeleton from '@/components/media/HeroBannerSkeleton';
import MediaCardSkeleton from '@/components/media/MediaCardSkeleton';
import MediaRailSkeleton from '@/components/media/MediaRailSkeleton';

describe('MediaCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MediaCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('is marked as aria-hidden', () => {
    const { container } = render(<MediaCardSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts a custom className', () => {
    const { container } = render(
      <MediaCardSkeleton className='custom-class' />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('MediaRailSkeleton', () => {
  it('renders with default card count of 5', () => {
    const { container } = render(<MediaRailSkeleton />);
    // 5 card wrappers inside the flex row
    const cardWrappers = container.querySelectorAll('.flex-none');
    expect(cardWrappers).toHaveLength(5);
  });

  it('renders the specified number of skeleton cards', () => {
    const { container } = render(<MediaRailSkeleton count={3} />);
    const cardWrappers = container.querySelectorAll('.flex-none');
    expect(cardWrappers).toHaveLength(3);
  });

  it('has aria-busy attribute for accessibility', () => {
    render(<MediaRailSkeleton />);
    const section = screen.getByRole('region', { name: /loading content/i });
    expect(section).toHaveAttribute('aria-busy', 'true');
  });
});

describe('HeroBannerSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<HeroBannerSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has aria-busy attribute for accessibility', () => {
    const { container } = render(<HeroBannerSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });
});
