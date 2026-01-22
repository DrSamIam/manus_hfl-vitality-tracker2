/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip type checking and linting during build to reduce memory usage
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allow API calls to the existing server (for local dev)
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
