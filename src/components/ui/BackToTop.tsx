'use client';

import { ArrowUp } from 'lucide-react';
import * as React from 'react';

export default function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className='fixed bottom-24 right-4 z-50 rounded-full bg-slate-800/90 p-2.5 text-slate-300 shadow-lg ring-1 ring-slate-700 backdrop-blur-sm transition-all hover:bg-cyan-500 hover:text-slate-950 hover:ring-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:right-6'
      aria-label='Back to top'
    >
      <ArrowUp className='h-4 w-4' />
    </button>
  );
}
