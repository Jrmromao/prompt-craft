import {Inter} from "next/font/google"
import "./globals.css"
import {ClerkProvider} from "@clerk/nextjs";
import { ptBR } from '@clerk/localizations'
import { SpeedInsights } from '@vercel/speed-insights/next';
import {Providers} from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({subsets: ["latin"]})

export const metadata = {
    title: "This a Saas Template",
    description: "This a Saas Template",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider localization={ptBR}>
            <html lang="pt-BR">
            <body
                className={`${inter.className} flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100`}>
            <Providers>
                {children}
                <Analytics />
            </Providers>
            <SpeedInsights />
            </body>
            </html>
        </ClerkProvider>
    )
}