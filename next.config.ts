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
};

export default nextConfig;
