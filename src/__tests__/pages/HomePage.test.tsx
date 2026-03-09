import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

describe('Homepage', () => {
  it('renders the Otaku Channels pitch', () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        /A browser-based anime TV guide for legally free streams/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Playback guardrails/i)).toBeInTheDocument();
  });
});
