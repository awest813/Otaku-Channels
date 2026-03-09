import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
  href?: string;
}

export default function SectionHeader({ title, href }: Props) {
  return (
    <div className='flex items-center justify-between'>
      <h2 className='text-lg font-semibold text-white md:text-xl'>{title}</h2>
      {href && (
        <Link
          href={href}
          className='flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300'
        >
          See all <ChevronRight className='h-4 w-4' />
        </Link>
      )}
    </div>
  );
}
