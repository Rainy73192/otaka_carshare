const withNextIntl = require('next-intl/plugin')(
  './src/i18n.ts',
  {
    _next_intl_trailing_slash: 'never'
  }
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ];
  },
  trailingSlash: false,
  // 强制禁用缓存
  generateEtags: false,
  poweredByHeader: false,
  // 添加缓存控制头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
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
            key: 'ngrok-skip-browser-warning',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);