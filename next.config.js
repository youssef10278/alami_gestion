/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour la production
  output: 'standalone',
  
  // Optimisations
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
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
  
  // Configuration PWA (si utilisée)
  ...(process.env.NODE_ENV === 'production' && {
    // Désactiver le turbopack en production pour éviter les problèmes
    experimental: {
      ...nextConfig.experimental,
      turbo: false,
    },
  }),
  
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
