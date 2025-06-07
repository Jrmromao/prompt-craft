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
  // Add experimental features for better API route handling
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'stripe'],
  },
  // Ensure API routes are not statically optimized
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure build output
  output: 'standalone',
  // Configure ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configure API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 