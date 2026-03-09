import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import GenrePill from '@/components/ui/GenrePill';

describe('GenrePill', () => {
  describe('as a static span (no onClick)', () => {
    it('renders the genre text', () => {
      render(<GenrePill genre='Action' />);
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<GenrePill genre='Action' />);
      expect(screen.getByText('Action').tagName).toBe('SPAN');
    });

    it('applies inactive styles when active is false', () => {
      render(<GenrePill genre='Fantasy' active={false} />);
      const el = screen.getByText('Fantasy');
      expect(el.className).toContain('bg-slate-800');
    });

    it('applies active styles when active is true', () => {
      render(<GenrePill genre='Fantasy' active={true} />);
      const el = screen.getByText('Fantasy');
      expect(el.className).toContain('bg-cyan-500');
    });
  });

  describe('as a button (with onClick)', () => {
    it('renders as a button element', () => {
      render(<GenrePill genre='Sci-Fi' onClick={jest.fn()} />);
      expect(
        screen.getByRole('button', { name: 'Sci-Fi' })
      ).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<GenrePill genre='Mecha' onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button', { name: 'Mecha' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies active styles when active is true', () => {
      render(<GenrePill genre='Retro' onClick={jest.fn()} active={true} />);
      const btn = screen.getByRole('button', { name: 'Retro' });
      expect(btn.className).toContain('bg-cyan-500');
    });

    it('applies inactive styles when active is false', () => {
      render(<GenrePill genre='Retro' onClick={jest.fn()} active={false} />);
      const btn = screen.getByRole('button', { name: 'Retro' });
      expect(btn.className).toContain('bg-slate-800');
    });
  });
});
