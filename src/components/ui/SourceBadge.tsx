import { cn } from '@/lib/utils';

import type { SourceType } from '@/types';

const styles: Record<SourceType, string> = {
  youtube: 'bg-red-600/20 text-red-400 border-red-600/30',
  retro: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
  freestream: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  live: 'bg-green-600/20 text-green-400 border-green-600/30',
};

const icons: Record<SourceType, string> = {
  youtube: '▶',
  retro: '📼',
  freestream: '🆓',
  live: '🔴',
};

const names: Record<SourceType, string> = {
  youtube: 'YouTube',
  retro: 'Retro',
  freestream: 'FreeStream',
  live: 'Live',
};

export default function SourceBadge({
  sourceType,
  className,
}: {
  sourceType: SourceType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[sourceType],
        className
      )}
    >
      <span aria-hidden='true'>{icons[sourceType]}</span>
      {names[sourceType]}
    </span>
  );
}
