/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'index, follow, max-image-preview=large' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=60' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Dev API proxy (ok to keep; on Vercel set API_BASE_URL instead)
      {
        source: '/api/:path*',
        destination:
          process.env.API_BASE_URL
            ? `${process.env.API_BASE_URL}/api/:path*`
            : 'http://localhost:3001/api/:path*',
      },
      // Remove self-rewrites that do nothing / can cause odd routing:
      // (deleted your card1 → card1 self-maps)
    ];
  },

  async redirects() {
    return [
      {
        source: '/location-from-location',
        destination: '/location-from-location/locationtolocation',
        permanent: true,
      },
    ];
  },

  images: {
    domains: ['cdnjs.cloudflare.com', 'unpkg.com'],
  },

  experimental: {},
};

module.exports = nextConfig;
