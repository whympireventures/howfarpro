/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // API proxy (use API_BASE_URL in prod; localhost in dev)
      {
        source: '/api/:path*',
        destination: process.env.API_BASE_URL
          ? `${process.env.API_BASE_URL}/api/:path*`
          : 'http://localhost:3001/api/:path*',
      },
      // Pretty two-location URL → internal route
      {
        source: '/how-far-is-:destination-from-:origin',
        destination: '/location-from-location/:destination/from/:origin',
      },
      {
        source: '/how-far-is-:destination-from-:origin/',
        destination: '/location-from-location/:destination/from/:origin',
      },
    ];
  },

  async redirects() {
    return [
      // Internal → Pretty (canonical)
      {
        source: '/location-from-location/:destination/from/:origin',
        destination: '/how-far-is-:destination-from-:origin',
        permanent: true,
      },
    ];
  },

  images: { domains: ['cdnjs.cloudflare.com', 'unpkg.com'] },
};

module.exports = nextConfig;

