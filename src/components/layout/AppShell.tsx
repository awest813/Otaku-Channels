import * as React from 'react';

import BackToTop from '@/components/ui/BackToTop';

import Footer from './Footer';
import TopNav from './TopNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col bg-slate-950 text-white'>
      <TopNav />
      <main className='flex-1'>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
