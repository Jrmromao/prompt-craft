import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '../components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://optirelay.com'),
  title: {
    default: 'OptiRelay - Cut AI Costs by 40% | LLM Cost Optimization',
    template: '%s | OptiRelay'
  },
  description: 'Reduce your OpenAI, Anthropic, and Claude API costs by 40% with intelligent routing, caching, and real-time analytics. Track every dollar spent on AI.',
  keywords: ['AI cost optimization', 'LLM cost tracking', 'OpenAI cost reduction', 'Anthropic API costs', 'Claude API pricing', 'AI analytics', 'prompt optimization', 'AI spending tracker'],
  authors: [{ name: 'OptiRelay' }],
  creator: 'OptiRelay',
  publisher: 'OptiRelay',
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
    title: 'OptiRelay'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://optirelay.com',
    siteName: 'OptiRelay',
    title: 'OptiRelay - Cut AI Costs by 40%',
    description: 'Reduce your OpenAI, Anthropic, and Claude API costs by 40% with intelligent routing, caching, and real-time analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OptiRelay - AI Cost Optimization Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OptiRelay - Cut AI Costs by 40%',
    description: 'Reduce your OpenAI, Anthropic, and Claude API costs by 40% with intelligent routing, caching, and real-time analytics.',
    images: ['/og-image.png'],
    creator: '@optirelay',
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
    canonical: 'https://optirelay.com',
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
    name: 'OptiRelay',
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
    description: 'Reduce your OpenAI, Anthropic, and Claude API costs by 40% with intelligent routing, caching, and real-time analytics.',
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
