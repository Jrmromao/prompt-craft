import { Suspense } from 'react';
import BlogContent from './BlogContent';

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BlogContent />
    </Suspense>
  );
} 