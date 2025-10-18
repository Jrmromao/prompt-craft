const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'www.gravatar.com' },
    ],
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  experimental: {
    optimizeCss: false,
    optimizePackageImports: [
      '@clerk/nextjs',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-scroll-area',
      'recharts',
      'react-markdown',
      'date-fns'
    ],
    serverComponentsExternalPackages: ['prisma', '@prisma/client']
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TypeScript errors
  },
  output: 'standalone',
  poweredByHeader: false,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Download-Options', value: 'noopen' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.costlens.dev https://www.googletagmanager.com https://challenges.cloudflare.com; connect-src 'self' https://*.clerk.accounts.dev https://clerk.costlens.dev https://www.googletagmanager.com; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://*.clerk.accounts.dev https://clerk.costlens.dev https://challenges.cloudflare.com; form-action 'self'; frame-ancestors 'self'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || 'https://costlens.dev' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/api/auth/sign-in',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/api/auth/sign-up',
        destination: '/sign-up',
        permanent: true,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        readline: false,
      };
    }
    return config;
  },
};

const sentryWebpackPluginOptions = {
  org: "costlens",
  project: "costlens",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

// Temporarily disable Sentry for Next.js 15 compatibility
module.exports = nextConfig;
// module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);