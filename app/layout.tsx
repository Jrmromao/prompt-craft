import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '../components/ClientLayout';
import GoogleAnalytics from '../components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://costlens.dev'),
  title: {
    default: 'CostLens.dev - Reduce AI Costs by up to 60-80% | Smart Routing & Optimization',
    template: '%s | CostLens.dev'
  },
  description: 'Reduce AI costs by up to 60-80% with smart routing, caching, and optimization. Track spending across OpenAI, Anthropic, and Claude in real-time.',
  keywords: ['AI cost tracking', 'LLM cost analytics', 'OpenAI cost monitoring', 'Anthropic API costs', 'Claude API pricing', 'AI spending analytics', 'cost optimization', 'developer tools'],
  authors: [{ name: 'CostLens.dev' }],
  creator: 'CostLens.dev',
  publisher: 'CostLens.dev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CostLens.dev'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://costlens.dev',
    siteName: 'CostLens.dev',
    title: 'CostLens.dev - Reduce AI Costs by up to 60-80%',
    description: 'Reduce AI costs by up to 60-80% with smart routing, caching, and optimization. Track spending in real-time.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CostLens.dev - AI Cost Analytics Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CostLens.dev - Reduce AI Costs by up to 60-80%',
    description: 'Reduce AI costs by up to 60-80% with smart routing, caching, and optimization. Track spending in real-time.',
    images: ['/og-image.png'],
    creator: '@costlensdev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://costlens.dev',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'CostLens.dev',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'Track, analyze, and optimize your AI API costs across OpenAI, Anthropic, and Claude. Real-time cost monitoring for developers.',
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-NH6L4KNMGP'} />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
