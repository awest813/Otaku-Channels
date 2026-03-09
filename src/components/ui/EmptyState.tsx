import { SearchX } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  title = 'Nothing here',
  message = 'No results found.',
  action,
}: Props) {
  return (
    <div className='flex flex-col items-center justify-center gap-4 py-16 text-center'>
      <div className='rounded-full bg-slate-800/60 p-5'>
        <SearchX className='h-8 w-8 text-slate-500' />
      </div>
      <div>
        <p className='font-semibold text-slate-300'>{title}</p>
        <p className='mt-1 text-sm text-slate-500'>{message}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className='mt-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
