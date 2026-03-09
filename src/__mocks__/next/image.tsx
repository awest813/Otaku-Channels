import React from 'react';

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

// Strip Next.js-only props that are not valid HTML img attributes to prevent
// React DOM warnings ("Received `true` for a non-boolean attribute `fill`")
// when next/image is rendered in the Jest / jsdom test environment.
const NextImageMock = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fill: _fill,
      priority: _priority,
      unoptimized: _unoptimized,
      sizes: _sizes,
      ...rest
    },
    ref
  ) => {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...rest}
      />
    );
  }
);

NextImageMock.displayName = 'NextImageMock';

export default NextImageMock;
