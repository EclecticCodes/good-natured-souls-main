/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async redirects() {
    return [
      { source: '/fanclub', destination: '/', permanent: false },
      { source: '/fanclub/:path*', destination: '/', permanent: false },
      { source: '/articles', destination: '/', permanent: false },
      { source: '/articles/:path*', destination: '/', permanent: false },
    ];
  },
};
module.exports = nextConfig;
