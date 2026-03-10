import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
  href?: string;
  description?: string;
}

export default function SectionHeader({ title, href, description }: Props) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div>
        <h2 className='text-lg font-semibold text-white md:text-xl'>{title}</h2>
        {description && (
          <p className='mt-0.5 text-xs text-slate-500'>{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className='flex shrink-0 items-center gap-0.5 text-sm text-cyan-400 transition-colors hover:text-cyan-300 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
        >
          See all <ChevronRight className='h-4 w-4' />
        </Link>
      )}
    </div>
  );
}
