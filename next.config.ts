import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment-specific configurations
  // This is similar to how you might configure different settings in Python
  
  // Enable source maps in development for better debugging
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  
  // Optimize for production builds
  compress: true,
  
  // Configure environment variables that should be available to the client
  // In Next.js, only variables prefixed with NEXT_PUBLIC_ are available in the browser
  env: {
    CUSTOM_ENVIRONMENT: process.env.NODE_ENV,
  },
  
  // Configure headers for API routes (useful when integrating with your backend)
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Configure redirects for better production deployment
  async redirects() {
    return [];
  },
  
  // Configure rewrites if needed (useful for API proxying in development)
  async rewrites() {
    // Only apply rewrites in development to proxy to local backend
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:7777/:path*',
        },
      ];
    }
    return [];
  },
  
  // Optimize images and other static assets
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Configure experimental features for better performance
  experimental: {
    optimizePackageImports: ['@/components', '@/hooks', '@/services'],
  },
};

export default nextConfig;
