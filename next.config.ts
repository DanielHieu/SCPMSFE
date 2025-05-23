import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ /* config options here */
  images: {
    domains: ['localhost', '127.0.0.1', 'scpmbe-hrhheedhh7gmatev.southeastasia-01.azurewebsites.net'],
  },
  headers: async () => {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
