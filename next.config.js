// phase === 'phase-production-build' during `next build`
/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => {

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'servicesartisans.fr' },
      { protocol: 'https', hostname: 'umjmbdbwcsxrvfqktiui.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  staticPageGenerationTimeout: 600,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
      'zod',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/accueil', destination: '/', permanent: true },
      // Legacy routes
      { source: '/france', destination: '/services', permanent: true },
      { source: '/carte', destination: '/services', permanent: true },
      { source: '/carte-liste', destination: '/services', permanent: true },
      { source: '/recherche', destination: '/services', permanent: true },
      { source: '/pro/:path*', destination: '/espace-artisan', permanent: true },
      { source: '/services/artisan/:path*', destination: '/services', permanent: true },
    ]
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr',
    NEXT_PHASE: phase,
  },
}

return nextConfig
}
