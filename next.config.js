/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour la production
  output: 'standalone',

  // Packages externes pour les composants serveur (nouvelle syntaxe Next.js 15)
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // ESLint configuration pour ignorer les erreurs en production
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration pour ignorer les erreurs en production
  typescript: {
    ignoreBuildErrors: true,
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
