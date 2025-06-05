import { Suspense } from 'react';
import CareersContent from './CareersContent';

export default function CareersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CareersContent />
    </Suspense>
  );
} 