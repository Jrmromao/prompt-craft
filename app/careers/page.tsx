import { Suspense } from 'react';
import CareersContent from './CareersContent';

export default function CareersPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <CareersContent />
    </Suspense>
  );
}
