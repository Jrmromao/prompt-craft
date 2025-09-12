const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
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
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react'],
    serverActions: {}, // or remove if not needed
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  typescript: {
    // Remove ignoreBuildErrors to catch type errors
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
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.prompthive.co https://www.googletagmanager.com https://challenges.cloudflare.com; connect-src 'self' https://*.clerk.accounts.dev https://clerk.prompthive.co; img-src 'self' data: https: https://img.clerk.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.clerk.accounts.dev https://clerk.prompthive.co https://challenges.cloudflare.com; form-action 'self'; frame-ancestors 'self'",
          },
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
  org: "prompthiveco",
  project: "prompthive",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);