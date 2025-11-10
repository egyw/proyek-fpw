import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Allow cross-origin requests in development (e.g., from mobile devices on same network)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          // CSP disabled for Midtrans Snap compatibility
          // Warning: This reduces security but allows Midtrans eval()
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' *;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
