/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour la production
  output: 'standalone',

  // Optimisations
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Désactiver le turbopack en production pour éviter les problèmes
    ...(process.env.NODE_ENV === 'production' && {
      turbo: false,
    }),
  },

  // Configuration des images
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
