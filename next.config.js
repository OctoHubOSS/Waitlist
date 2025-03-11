/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  }
};

module.exports = nextConfig;
