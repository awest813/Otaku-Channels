import { SearchX } from 'lucide-react';

export default function EmptyState({ message = 'No results found' }: { message?: string }) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-16 text-slate-500'>
      <SearchX className='h-10 w-10' />
      <p className='text-sm'>{message}</p>
    </div>
  );
}
