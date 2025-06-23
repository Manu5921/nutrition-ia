import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
    // ppr: true, // Partial Prerendering - Disabled (requires canary)
  },

  // Optimisation des images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirections SEO
  async redirects() {
    return [
      {
        source: '/dashboard/recipes',
        destination: '/dashboard/recettes',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/profil',
        permanent: true,
      },
      {
        source: '/subscription',
        destination: '/abonnement',
        permanent: true,
      },
    ];
  },

  // Optimisation du bundle
  webpack: (config, { dev, isServer }) => {
    // Optimisation pour la production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Optimisation pour Vercel
  output: 'standalone',
  
  // PWA et caching
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },

  // Logs de build
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Optimisation TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint - Temporairement désactivé pour déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Compression
  compress: true,

  // Trailing slash pour le SEO
  trailingSlash: false,

  // Power by header
  poweredByHeader: false,

  // Réduction du JavaScript côté client
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
};

export default nextConfig;
