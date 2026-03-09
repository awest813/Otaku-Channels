import { cn } from '@/lib/utils';

export default function GenrePill({
  genre,
  active,
  onClick,
}: {
  genre: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const base =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          base,
          'cursor-pointer',
          active
            ? 'bg-cyan-500 text-slate-950'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        )}
      >
        {genre}
      </button>
    );
  }
  return (
    <span
      className={cn(
        base,
        active ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
      )}
    >
      {genre}
    </span>
  );
}
