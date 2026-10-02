/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),

  images: {
    // Image optimization is on. It was previously disabled for a static
    // `next export` target that no longer exists (the dead `hosting` block in
    // firebase.json), which meant the 1600x900 hero was served at full size to
    // every visitor regardless of viewport.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    // Rewrites barrel imports to direct paths so only the icons actually used
    // are bundled, instead of the whole react-icons/fa set.
    optimizePackageImports: ['react-icons/fa', 'framer-motion'],
  },
};

module.exports = nextConfig;
