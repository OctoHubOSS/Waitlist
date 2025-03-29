/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'minivault.cordx.lol'
      }
    ],
  },
  async redirects() {
    // Only apply redirects in production
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/:path((?!coming-soon|api|_next|static|public|waitlist/unsubscribe|waitlist/subscribe).*)*',
          destination: '/coming-soon',
          permanent: true,
        }
      ];
    }
    return [];
  }
};

module.exports = nextConfig;