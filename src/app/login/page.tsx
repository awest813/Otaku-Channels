import type { Metadata } from 'next';

import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <LoginForm />
      </div>
    </div>
  );
}
