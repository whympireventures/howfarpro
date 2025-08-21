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
      // Pretty hyphen URL → valid internal route (/how-far-is/[slug]/from-me)
      { source: '/how-far-is-:slug-from-me', destination: '/how-far-is/:slug/from-me' },

      // Dev API proxy
      {
        source: '/api/:path*',
        destination:
          process.env.API_BASE_URL
            ? `${process.env.API_BASE_URL}/api/:path*`
            : 'http://localhost:3001/api/:path*',
      },
    ];
  },

  async redirects() {
    return [
      // Old URLs → pretty URL
      {
        source: '/location-from-me/:slug',
        destination: '/how-far-is-:slug-from-me',
        permanent: true,
      },
      // Existing redirect you had
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
