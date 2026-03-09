import { render, screen } from '@testing-library/react';
import React from 'react';

import WatchPlayerShell from '@/components/watch/WatchPlayerShell';

describe('WatchPlayerShell', () => {
  const youtubeUrl = 'https://www.youtube.com/watch?v=abc123';
  const externalUrl = 'https://example.com/watch';
  const sourceName = 'YouTube Official';
  const externalSourceName = 'FreeStream Anime';

  describe('when isEmbeddable is true and URL is a YouTube watch link', () => {
    it('renders a YouTube iframe with the correct embed URL', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl={youtubeUrl}
          sourceName={sourceName}
        />
      );

      const iframe = screen.getByTitle(`Watch on ${sourceName}`);
      expect(iframe).toBeInTheDocument();
      expect(iframe.tagName).toBe('IFRAME');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/abc123'
      );
    });

    it('sets allowFullScreen on the iframe', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl={youtubeUrl}
          sourceName={sourceName}
        />
      );
      const iframe = screen.getByTitle(`Watch on ${sourceName}`);
      expect(iframe).toHaveAttribute('allowfullscreen');
    });

    it('shows the embedded playback attribution notice', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl={youtubeUrl}
          sourceName={sourceName}
        />
      );
      expect(
        screen.getByText(/Embedded playback via.*No content is hosted/i)
      ).toBeInTheDocument();
    });
  });

  describe('when isEmbeddable is true but URL is not YouTube', () => {
    it('renders an external link button instead of an iframe', () => {
      const { container } = render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl={externalUrl}
          sourceName={externalSourceName}
        />
      );

      expect(container.querySelector('iframe')).not.toBeInTheDocument();
      const link = screen.getByRole('link', {
        name: new RegExp(`Open on ${externalSourceName}`, 'i'),
      });
      expect(link).toHaveAttribute('href', externalUrl);
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('when isEmbeddable is false', () => {
    it('does not render an iframe', () => {
      const { container } = render(
        <WatchPlayerShell
          isEmbeddable={false}
          watchUrl={externalUrl}
          sourceName={externalSourceName}
        />
      );
      expect(container.querySelector('iframe')).not.toBeInTheDocument();
    });

    it('shows a "Watch on source" external link', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={false}
          watchUrl={externalUrl}
          sourceName={externalSourceName}
        />
      );
      const link = screen.getByRole('link', {
        name: new RegExp(`Watch on ${externalSourceName}`, 'i'),
      });
      expect(link).toHaveAttribute('href', externalUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('shows the external source attribution notice', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={false}
          watchUrl={externalUrl}
          sourceName={externalSourceName}
        />
      );
      expect(
        screen.getByText(
          new RegExp(`This content is hosted by ${externalSourceName}`, 'i')
        )
      ).toBeInTheDocument();
    });
  });

  describe('YouTube URL parsing', () => {
    it('handles youtu.be short URLs', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl='https://youtu.be/xyz789'
          sourceName={sourceName}
        />
      );
      const iframe = screen.getByTitle(`Watch on ${sourceName}`);
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/xyz789'
      );
    });

    it('handles youtube.com without www', () => {
      render(
        <WatchPlayerShell
          isEmbeddable={true}
          watchUrl='https://youtube.com/watch?v=noWWW'
          sourceName={sourceName}
        />
      );
      const iframe = screen.getByTitle(`Watch on ${sourceName}`);
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/noWWW'
      );
    });
  });
});
