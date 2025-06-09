/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prompthive.co',
      },
      {
        protocol: 'https',
        hostname: 'www.prompthive.co',
      },
      {
        protocol: 'https',
        hostname: 'prompt-craft-git-main-joao-romaos-projects.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure API routes are not statically optimized
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure build output - only use standalone in production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  // Configure ESLint
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Configure API routes and security headers
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://www.googletagmanager.com https://challenges.cloudflare.com;
      connect-src 'self' https://*.clerk.accounts.dev;
      img-src 'self' data: https: https://img.clerk.com;
      worker-src 'self' blob:;
      style-src 'self' 'unsafe-inline';
      frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com;
      form-action 'self';
      frame-ancestors 'self';
    `.replace(/\n/g, ' ').trim();

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ];
  },
  // Fix for crypto module in standalone mode
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
