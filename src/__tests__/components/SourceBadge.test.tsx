import { render, screen } from '@testing-library/react';
import React from 'react';

import SourceBadge from '@/components/ui/SourceBadge';

describe('SourceBadge', () => {
  it('renders "YouTube" label for youtube source type', () => {
    render(<SourceBadge sourceType='youtube' />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('renders "Retro" label for retro source type', () => {
    render(<SourceBadge sourceType='retro' />);
    expect(screen.getByText('Retro')).toBeInTheDocument();
  });

  it('renders "FreeStream" label for freestream source type', () => {
    render(<SourceBadge sourceType='freestream' />);
    expect(screen.getByText('FreeStream')).toBeInTheDocument();
  });

  it('renders "Live" label for live source type', () => {
    render(<SourceBadge sourceType='live' />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders the icon with aria-hidden so it is decorative', () => {
    render(<SourceBadge sourceType='youtube' />);
    // The icon span should be hidden from assistive technology
    const iconSpan = screen.getByText('▶');
    expect(iconSpan).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies an extra className when provided', () => {
    const { container } = render(
      <SourceBadge sourceType='youtube' className='extra-class' />
    );
    expect(container.firstChild).toHaveClass('extra-class');
  });
});
