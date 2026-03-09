import * as React from 'react';

import { cn } from '@/lib/utils';

type SkeletonProps = React.ComponentPropsWithoutRef<'div'>;

export default function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn('animate-shimmer bg-slate-800', className)}
      style={{
        backgroundImage:
          'linear-gradient(to right, #1e293b 0%, #334155 20%, #1e293b 40%, #1e293b 100%)',
        backgroundSize: '700px 100%',
        backgroundRepeat: 'no-repeat',
      }}
      {...rest}
    />
  );
}
