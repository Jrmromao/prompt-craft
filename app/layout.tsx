import {Inter} from "next/font/google"
import "./globals.css"
import {ClerkProvider} from "@clerk/nextjs";
import { enUS } from '@clerk/localizations'
import { SpeedInsights } from '@vercel/speed-insights/next';
import {Providers} from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from '@/lib/utils';

const inter = Inter({subsets: ["latin"]})

export const metadata = {
    title: "PromptC",
    description: "PromptCraft is a platform for creating and sharing AI prompts",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider localization={enUS}>
            <html lang="en" suppressHydrationWarning>
                <body className={cn('min-h-screen bg-background font-sans antialiased')}>
                    <Providers>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                            <Analytics />
                            <Toaster />
                        </ThemeProvider>
                    </Providers>
                    <SpeedInsights />
                </body>
            </html>
        </ClerkProvider>
    )
}