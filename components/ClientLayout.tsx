'use client';

import { ReactNode } from 'react';
import { Footer } from '@/app/components/Footer';
import { ClerkProviderWrapper } from '@/components/ClerkProviderWrapper';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UnifiedNavigation } from '@/components/layout/UnifiedNavigation';
import { BottomTabNavigation } from '@/components/mobile/BottomTabNavigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ClerkProviderWrapper>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Providers>
          <ThemeProvider>
            <TooltipProvider>
              <div className="flex min-h-screen flex-col">
                <UnifiedNavigation />
                <main className="flex-grow pb-16 md:pb-0">{children}</main>
                <Footer />
                <BottomTabNavigation />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </ErrorBoundary>
      <Toaster />
      
      {/* PWA Registration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `,
        }}
      />
    </ClerkProviderWrapper>
  );
}
