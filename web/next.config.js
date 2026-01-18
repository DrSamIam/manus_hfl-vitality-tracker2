/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow API calls to the existing server
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: 'http://localhost:3000/trpc/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
