'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ClerkProvider = dynamic(() => import('@clerk/nextjs').then(mod => mod.ClerkProvider), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export function ClerkWrapper({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
