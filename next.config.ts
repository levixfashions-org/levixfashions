import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Disables X-Powered-By: Next.js to obscure tech stack
  compress: true, // Gzip / Brotli compression for minimal payload size

  // High-performance image formats & remote domains
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'checkout.razorpay.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for static apparel assets
  },

  // Bundle & Tree-shaking optimizations for 90+ Lighthouse mobile score
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Compiler configurations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
