/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // =============================================
  // ВАЖНО: Включаем standalone output для Docker
  // =============================================
  output: "standalone",

  // =============================================
  // Environment variables доступные на клиенте
  // =============================================
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },

  // =============================================
  // TradingView Charting Library headers
  // =============================================
  async headers() {
    return [
      {
        source: "/charting_library/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },

  // =============================================
  // API Rewrites (опционально - проксирование через Next.js)
  // =============================================
  async rewrites() {
    // Если хотите проксировать API через Next.js (избегает CORS)
    // Раскомментируйте следующий блок:
    /*
    const apiUrl = process.env.BACKEND_URL || 'http://coinservice:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
      {
        source: '/status',
        destination: `${apiUrl}/status`,
      },
    ];
    */
    return [];
  },

  // =============================================
  // Webpack configuration
  // =============================================
  webpack: (config, { isServer }) => {
    // TradingView library is loaded from public folder
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // =============================================
  // Image optimization (если используете next/image)
  // =============================================
  images: {
    // Домены для внешних изображений
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Отключаем оптимизацию в standalone режиме если нужно
    // unoptimized: true,
  },
};

module.exports = nextConfig;
