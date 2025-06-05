import { Suspense } from 'react';
import TermsContent from './TermsContent';

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TermsContent />
    </Suspense>
  );
} 