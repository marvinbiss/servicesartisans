/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
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
    instrumentationHook: true,
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'date-fns',
      'zod',
      'framer-motion',
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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
          // CSP also defined in middleware.ts (takes precedence for non-static routes)
          // This CSP serves as fallback for static assets not processed by middleware
          // In dev, Next.js uses eval() for source maps — 'unsafe-eval' is required
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-inline' is a known limitation: required for Next.js inline scripts on static routes
              // (full nonce-based CSP for static routes requires Next.js 15+; middleware handles dynamic routes with nonce)
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://t.contentsquare.net https://www.clarity.ms https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.anthropic.com https://api.openai.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api-adresse.data.gouv.fr https://www.clarity.ms https://t.contentsquare.net https://connect.facebook.net https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.openstreetmap.org",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          }] : []),
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache-Control for programmatic public pages (CDN caching)
      {
        source: '/services/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/devis/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/tarifs/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/avis/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/villes/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/departements/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/regions/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/problemes/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/urgence/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/barometre/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/blog/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Static public pages — long cache
      {
        source: '/faq',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/contact',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/comment-ca-marche',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/comparaison/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/artisans',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/carte-artisans',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/a-propos',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/garantie',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/cgv',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/confidentialite',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/accessibilite',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/avant-apres',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/calendrier-travaux',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/badge-artisan',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/carrieres',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Homepage
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Contenu éditorial & guides
      {
        source: '/glossaire',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/guides/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/questions/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/normes',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Outils & calculateurs
      {
        source: '/outils/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/checklist-travaux',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/calculateur',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/barometre-prix',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Données & statistiques
      {
        source: '/statistiques-artisans-france',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Tarifs & devis (variantes)
      {
        source: '/tarifs-artisans/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // Vérification artisan
      {
        source: '/verifier-artisan',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/notre-processus-de-verification',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      // /recherche removed — 301-redirects to /services, cache header never applied
      // Pages institutionnelles & légales
      {
        source: '/presse',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/partenaires',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/mediation',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/mentions-legales',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/politique-avis',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/plan-du-site',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/accueil', destination: '/', permanent: true },
      // P3 simulateur — ancienne route remplacée par /simulateur-aides-renovation
      { source: '/simulateur-prime-cee', destination: '/simulateur-aides-renovation', permanent: true },
      // BAR-TH-104 abrogée 01/01/2024 par la DGEC — remplacée par BAR-TH-171 (PAC air/eau haute performance, SCOP ≥ 4).
      // Redirect permanent de toutes les URLs legacy vers la fiche en vigueur.
      { source: '/cee/bar-th-104', destination: '/cee/bar-th-171', permanent: true },
      { source: '/cee/bar-th-104/guide', destination: '/cee/bar-th-171/guide', permanent: true },
      { source: '/cee/bar-th-104/:ville', destination: '/cee/bar-th-171/:ville', permanent: true },
      // BAR-TH-106 (chaudière individuelle gaz/fioul à condensation) abrogée 01/01/2024 — arrêté du 4 octobre 2023 (JORFTEXT000048158900).
      // Remplacée par BAR-TH-171 (PAC air/eau haute performance, SCOP ≥ 4) et BAR-TH-172 (PAC eau/eau).
      { source: '/cee/bar-th-106', destination: '/cee/bar-th-171', permanent: true },
      { source: '/cee/bar-th-106/guide', destination: '/cee/bar-th-171/guide', permanent: true },
      { source: '/cee/bar-th-106/:ville', destination: '/cee/bar-th-171/:ville', permanent: true },
      // BAR-TH-160 (isolation d'un réseau hydraulique) supprimée au 01/08/2025 — arrêté du 27 juin 2025 (JORFTEXT000051857168).
      // Pas de remplacement direct : redirect vers la liste des fiches CEE en vigueur.
      { source: '/cee/bar-th-160', destination: '/cee', permanent: true },
      { source: '/cee/bar-th-160/guide', destination: '/cee', permanent: true },
      { source: '/cee/bar-th-160/:ville', destination: '/cee', permanent: true },
      // BAR-TH-164 (rénovation globale d'une maison individuelle) abrogée — arrêté du 19 décembre 2023 (JORFTEXT000048680133).
      // Remplacée par BAR-TH-174 (rénovation d'ampleur maison individuelle). Le guide éditorial BAR-TH-174 n'étant pas encore
      // publié, on redirige vers la liste des fiches CEE plutôt que vers une 404. À rebasculer sur /cee/bar-th-174/... dès
      // que le guide existe dans operation-guides-content.ts.
      { source: '/cee/bar-th-164', destination: '/cee', permanent: true },
      { source: '/cee/bar-th-164/guide', destination: '/cee', permanent: true },
      { source: '/cee/bar-th-164/:ville', destination: '/cee', permanent: true },
      // Legacy routes
      { source: '/france', destination: '/services', permanent: true },
      { source: '/carte', destination: '/services', permanent: true },
      { source: '/carte-liste', destination: '/services', permanent: true },
      { source: '/recherche', destination: '/services', permanent: true },
      { source: '/pro/:path*', destination: '/espace-artisan', permanent: true },
      { source: '/services/artisan/:path*', destination: '/services', permanent: true },
      { source: '/metiers', destination: '/services', permanent: true },
      { source: '/artisan/:service/:location', destination: '/services/:service/:location', permanent: true },
      { source: '/artisan/:service', destination: '/services/:service', permanent: true },
      // French legal page aliases (RGPD compliance)
      { source: '/politique-de-confidentialite', destination: '/confidentialite', permanent: true },
      { source: '/politique-confidentialite', destination: '/confidentialite', permanent: true },
      { source: '/conditions-generales', destination: '/cgv', permanent: true },
      // Common alternative slugs
      { source: '/services/peintre', destination: '/services/peintre-en-batiment', permanent: true },
      { source: '/services/peintre/:location', destination: '/services/peintre-en-batiment/:location', permanent: true },
      { source: '/services/peintre/:location/:id', destination: '/services/peintre-en-batiment/:location/:id', permanent: true },
      // Blog cannibalisation fixes — 301 redirects to canonical articles
      // Isolation: canonical = prix-isolation-thermique-2026-tarifs (updated 2026-04-03, was isolation-maison-guide-complet)
      { source: '/blog/isolation-thermique-guide', destination: '/blog/prix-isolation-thermique-2026-tarifs', permanent: true },
      { source: '/blog/isolation-thermique-meilleures-solutions-2026', destination: '/blog/prix-isolation-thermique-2026-tarifs', permanent: true },
      // Toiture/prix: canonical = prix-toiture-2026-refection-reparation-materiaux
      { source: '/blog/prix-couvreur-2026-cout-refection-toiture', destination: '/blog/prix-toiture-2026-refection-reparation-materiaux', permanent: true },
      { source: '/blog/refaire-toiture-guide-proprietaire', destination: '/blog/prix-toiture-2026-refection-reparation-materiaux', permanent: true },

      // ====== SEO Cannibalization Audit 2026-04-03 — 22 redirects (23 in audit, 1 eco-ptz was same slug) ======
      // See: scripts/gsc-data/cannibalization-audit.md

      // --- batch-seo-boost1 (all 5 articles → pillar) ---
      // G1: MaPrimeRénov 2026
      { source: '/blog/maprimerenov-2026-guide-complet-aides-renovation', destination: '/blog/maprimerénov-2026-conditions-montants', permanent: true },
      // G8: Choisir/Vérifier Artisan
      { source: '/blog/comment-choisir-artisan-confiance-guide-2026', destination: '/blog/comment-verifier-artisan-avant-engager', permanent: true },
      // G16: Prix Rénovation Maison
      { source: '/blog/prix-renovation-maison-2026-budget-complet', destination: '/blog/renovation-maison-prix-m2-2026', permanent: true },
      // G9: Pompe à Chaleur
      { source: '/blog/pompe-a-chaleur-guide-complet-2026', destination: '/blog/prix-pompe-a-chaleur-2026', permanent: true },
      // G15: Isolation Maison
      { source: '/blog/isolation-maison-guide-complet-materiaux-prix-aides', destination: '/blog/prix-isolation-thermique-2026-tarifs', permanent: true },

      // --- batch-seo-boost2 (all 5 articles → pillar) ---
      // G18: DPE
      { source: '/blog/dpe-diagnostic-performance-energetique-tout-savoir', destination: '/blog/dpe-obligatoire-2026-guide', permanent: true },
      // G7: Devis Travaux
      { source: '/blog/devis-travaux-comprendre-comparer-negocier', destination: '/blog/devis-travaux-comprendre', permanent: true },
      // G6: Rénovation Salle de Bain
      { source: '/blog/renovation-salle-de-bain-guide-complet-prix-2026', destination: '/blog/renovation-salle-de-bain-budget-etapes', permanent: true },
      // G12: Entretien Maison
      { source: '/blog/entretien-maison-calendrier-annuel-checklist', destination: '/blog/entretien-annuel-maison-checklist-complete', permanent: true },
      // G11: Arnaques Artisans
      { source: '/blog/arnaques-artisans-reconnaitre-eviter-recours', destination: '/blog/10-arnaques-courantes-batiment', permanent: true },

      // --- batch-seo-boost3 (4 of 5 articles → pillar, kept prix-toiture) ---
      // G2: Éco-PTZ — eco-ptz-2026-pret-taux-zero-renovation exists in batch-aides-2026 (pillar), no redirect needed
      // The boost3 duplicate was removed; the aides-2026 version remains as the canonical article
      // G13: Rénovation Énergétique
      { source: '/blog/renovation-energetique-par-ou-commencer', destination: '/blog/travaux-renovation-energetique-par-ou-commencer', permanent: true },
      // G26: Normes NF C 15-100
      { source: '/blog/normes-electriques-2026-nfc-15-100-guide', destination: '/blog/electricite-normes-securite', permanent: true },
      // G27: Fuite d'Eau Urgence
      { source: '/blog/fuite-eau-urgence-guide-complet-gestes-couts', destination: '/blog/fuite-eau-que-faire-urgence', permanent: true },

      // --- batch-renovation-2026 (3 articles → pillar) ---
      // G6: Rénovation Salle de Bain (bis)
      { source: '/blog/renovation-salle-de-bain-prix-guide-2026', destination: '/blog/renovation-salle-de-bain-budget-etapes', permanent: true },
      // G7: Devis Travaux (bis)
      { source: '/blog/devis-travaux-guide-complet', destination: '/blog/devis-travaux-comprendre', permanent: true },
      // G20: Cuisine Équipée
      { source: '/blog/cuisine-equipee-prix-pose-2026', destination: '/blog/prix-cuisiniste-2026-pose-cuisine', permanent: true },

      // --- batch-securite-energie (1 article → pillar) ---
      // G9: PAC air-eau
      { source: '/blog/pompe-chaleur-air-eau-guide-2026', destination: '/blog/prix-pompe-a-chaleur-2026', permanent: true },

      // --- batch-reglementation (1 article → pillar) ---
      // G14: Cumul Aides
      { source: '/blog/aides-renovation-2026-cumul-guide', destination: '/blog/cumul-aides-renovation-2026-tableau', permanent: true },

      // --- batch-aides-saisonnier (1 article → pillar) ---
      // G14: Cumul Aides (bis)
      { source: '/blog/cumul-aides-renovation-energetique-2026', destination: '/blog/cumul-aides-renovation-2026-tableau', permanent: true },

      // --- batch-conseils (1 article → pillar) ---
      // G21: Préparer Maison Hiver
      { source: '/blog/preparer-maison-hiver-guide-complet', destination: '/blog/preparer-maison-hiver-checklist', permanent: true },

      // --- batch-saisonnier-urgence (1 article → pillar) ---
      // G21: Préparer Maison Hiver (bis)
      { source: '/blog/preparer-maison-hiver', destination: '/blog/preparer-maison-hiver-checklist', permanent: true },

      // --- batch-energie-2026 (1 article → pillar) ---
      // G23: Extension Maison
      { source: '/blog/extension-maison-prix-m2-2026', destination: '/blog/prix-extension-maison-2026', permanent: true },

      // ====== Helpful Content cleanup — 150 prix×ville redirects (2026-04-03) ======
      // Reduced from 200 to 50 articles (5 metiers × 10 villes).
      // 150 removed slugs redirect to their national price article.
      // Generated programmatically: 5 removed metiers × 20 villes + 5 kept metiers × 10 removed villes
      ...(() => {
        const redirects = []

        // Mapping: metier slug → national article slug
        const nationalArticles = {
          'plombier': 'prix-plombier-2026-tarifs-horaires',
          'electricien': 'prix-electricien-2026-tarifs-travaux',
          'serrurier': 'prix-serrurier-2026-tarifs-interventions',
          'chauffagiste': 'prix-chauffagiste-2026-installation-entretien',
          'peintre-en-batiment': 'prix-peintre-batiment-2026-guide-complet',
          'menuisier': 'prix-menuisier-2026-tarifs-travaux',
          'macon': 'prix-macon-2026-gros-oeuvre-renovation',
          'couvreur': 'prix-toiture-2026-refection-reparation-materiaux',
          'carreleur': 'prix-carreleur-2026-pose-fourniture',
          'plaquiste': 'prix-platrier-2026-tarifs-platerie',
        }

        // All 20 original villes
        const allVilles = [
          'paris', 'marseille', 'lyon', 'toulouse', 'nice',
          'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille',
          'rennes', 'reims', 'le-havre', 'saint-etienne', 'toulon',
          'grenoble', 'dijon', 'angers', 'nimes', 'villeurbanne',
        ]

        // Kept: 5 metiers × 10 villes (first 10 villes)
        const keptMetiers = ['plombier', 'electricien', 'serrurier', 'chauffagiste', 'peintre-en-batiment']
        const removedMetiers = ['menuisier', 'macon', 'couvreur', 'carreleur', 'plaquiste']
        const removedVilles = allVilles.slice(10) // last 10

        // 1) Removed metiers × ALL 20 villes = 100 redirects
        for (const metier of removedMetiers) {
          for (const ville of allVilles) {
            redirects.push({
              source: `/blog/prix-${metier}-${ville}-2026`,
              destination: `/blog/${nationalArticles[metier]}`,
              permanent: true,
            })
          }
        }

        // 2) Kept metiers × removed villes = 50 redirects
        for (const metier of keptMetiers) {
          for (const ville of removedVilles) {
            redirects.push({
              source: `/blog/prix-${metier}-${ville}-2026`,
              destination: `/blog/${nationalArticles[metier]}`,
              permanent: true,
            })
          }
        }

        return redirects // 150 total
      })(),
    ]
  },

  async rewrites() {
    return [
      // Next.js 14.2 generateSitemaps() doesn't auto-generate the sitemap index
      { source: '/sitemap.xml', destination: '/api/sitemap-index' },
      // Provider sitemaps served dynamically (DB-dependent, can't pre-render at build time)
      { source: '/sitemap/providers-:id.xml', destination: '/api/sitemap-providers?id=:id' },
    ]
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr',
  },
}

// --- Sentry wrap -------------------------------------------------------------
// Only wraps when @sentry/nextjs is importable and an org/project is set.
// In dev without SENTRY_DSN the SDK init is no-op (see sentry.*.config.ts).
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(nextConfig, {
  // Org/project pulled from env so credentials stay out of the repo.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps only in CI/Vercel to avoid slowing local builds.
  silent: !process.env.CI,

  // Hide source maps from the public bundle (uploaded privately to Sentry).
  hideSourceMaps: true,

  // Tree-shake Sentry debug logger in prod (~30KB saved).
  disableLogger: true,

  // Route Sentry traffic through our domain to bypass ad-blockers.
  tunnelRoute: '/monitoring',

  // Only enable upload/wrapping when an auth token is present.
  // Without it the build still works, you just don't get source maps.
  authToken: process.env.SENTRY_AUTH_TOKEN,
})

