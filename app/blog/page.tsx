import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import BlogContent from './BlogContent';

export default async function BlogPage() {
  const user = await currentUser();
  const navUser = user
    ? {
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
      }
    : { name: 'Guest', email: '' };

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogContent user={navUser} />
    </Suspense>
  );
} 