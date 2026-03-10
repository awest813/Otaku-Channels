import type { Metadata } from 'next';

import ProfileContent from './ProfileContent';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div className='mx-auto max-w-screen-lg px-4 py-8'>
      <ProfileContent />
    </div>
  );
}
