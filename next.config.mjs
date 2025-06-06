/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.clerk.com', 'images.clerk.dev'],
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config, { isServer }) => {
    // Add handling for class inheritance issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimize for production
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },
};

export default nextConfig; 