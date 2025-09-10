import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Footer } from '@/app/components/Footer';
import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { UnifiedNavigation } from '@/components/layout/UnifiedNavigation';
import { BottomTabNavigation } from '@/components/mobile/BottomTabNavigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptHive - AI Prompt Engineering Platform',
  description: 'Create, share, and discover AI prompts for various use cases',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PromptCraft'
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning>
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
        </body>
      </html>
    </ClerkProvider>
  );
}
