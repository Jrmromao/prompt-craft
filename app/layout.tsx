import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBarWrapper } from "@/components/layout/NavBarWrapper";
import { Footer } from "@/app/components/Footer";
import Providers from "@/components/Providers";
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptCraft - AI Prompt Engineering Platform",
  description: "Create, share, and discover AI prompts for various use cases",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <ThemeProvider>
            <Providers>
              <div className="min-h-screen flex flex-col">
                <NavBarWrapper />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </Providers>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}