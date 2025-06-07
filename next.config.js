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
};

module.exports = nextConfig; 