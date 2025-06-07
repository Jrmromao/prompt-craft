import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import { NavBarWrapper } from "@/components/layout/NavBarWrapper";
import { Footer } from '@/app/components/Footer';
import Providers from '@/components/Providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PromptCraft - AI Prompt Engineering Platform',
  description: 'Create, share, and discover AI prompts for various use cases',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <TooltipProvider>
          <ThemeProvider>
            <Providers>
              <div className="flex min-h-screen flex-col">
                {/* <NavBarWrapper /> */}
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </Providers>
          </ThemeProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
