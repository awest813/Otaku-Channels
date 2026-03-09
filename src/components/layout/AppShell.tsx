import * as React from 'react';

import BackToTop from '@/components/ui/BackToTop';
import { ToastProvider } from '@/components/ui/Toast';

import Footer from './Footer';
import TopNav from './TopNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className='flex min-h-screen flex-col bg-slate-950 text-white'>
        <TopNav />
        <main className='flex-1' id='main-content'>
          {children}
        </main>
        <Footer />
        <BackToTop />
      </div>
    </ToastProvider>
  );
}
