/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: '/fanclub', destination: '/', permanent: false },
      { source: '/fanclub/:path*', destination: '/', permanent: false },
      { source: '/store', destination: '/', permanent: false },
      { source: '/store/:path*', destination: '/', permanent: false },
      { source: '/articles', destination: '/', permanent: false },
      { source: '/articles/:path*', destination: '/', permanent: false },
    ];
  },
};
module.exports = nextConfig;
