import { Suspense } from 'react';
import PricingSection from '@/components/PricingSection';


console.log('PricingPage');

export default function PricingPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}
    >
      <PricingSection />
    </Suspense>
  );
}
