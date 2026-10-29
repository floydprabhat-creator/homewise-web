import type { NextConfig } from 'next';

const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  // Keep the dev badge clear of the sidebar's theme toggle and log out button (bottom-left).
  devIndicators: { position: 'bottom-right' },
  experimental: {
    // Requests are buffered for proxy.ts, capped at 10 MB by default. Spending entries carry up to
    // 3 files of 5 MB each (see MAX_FILE_BYTES in the API), plus form fields.
    proxyClientMaxBodySize: '16mb',
  },
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
