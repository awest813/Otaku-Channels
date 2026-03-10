import type { Metadata } from 'next';

import SignupForm from './SignupForm';

export const metadata: Metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <SignupForm />
      </div>
    </div>
  );
}
