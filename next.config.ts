const nextConfig = {
  async rewrites() {
    return [
      // Keep your existing API proxy
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      // Add the new rewrite with proper parameter mapping
      {
        source: '/card1/how-far-is-:destination-from-me',
        destination: '/card1/how-far-is-:destination-from-me', 
      },
      // Optional: trailing slash version
      {
        source: '/card1/how-far-is-:destination-from-me/',
        destination: '/card1/how-far-is-:destination-from-me',
      }
    ];
  },
  experimental: {
    // Your experimental config
  },
  images: {
    domains: ['cdnjs.cloudflare.com', 'unpkg.com'],
  },
};

module.exports = nextConfig;