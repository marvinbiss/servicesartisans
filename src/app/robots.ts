import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'

// Sprint AD Ahrefs 2026-05-03 — exceptions explicites pour assets open-data
// servis sous /api/ mais publiquement référençables (CC-BY 4.0). Google
// applique longest-match priority : `/api/glossaire-rge.json` (28 chars)
// override `/api/` (5 chars) du PRIVATE_DISALLOW. Permet aux crawlers
// data.gouv.fr / Wikipedia / journalistes de découvrir l'asset.
//
// Sprint AF Ahrefs 2026-05-03 — ajout variante CSV `/api/glossaire-rge.csv`
// pour les consommateurs non-JSON (data.gouv.fr datasets tabulaires, Excel,
// LibreOffice, BI tools). Même logique de longest-match override `/api/`.
//
// Itération LLM-era 2026-05-21 — élargissement à l'ensemble de la surface
// open-data afin que les crawlers Search (Google, Bing) ET les crawlers AI
// (OAI-SearchBot, Claude-SearchBot, PerplexityBot, MistralBot, Applebot-
// Extended, Meta-ExternalAgent, YouBot, Google-CloudVertexBot) puissent
// ingérer nos datasets CC-BY 4.0 dans leur corpus avec citation vérifiable :
//   - /api/datasets/      → CEE × région (JSON + CSV)
//   - /api/open-data/     → futures expositions data.gouv.fr
//   - /api/v1/rge/        → lookup/search SIRET RGE (mig 464 snapshots)
//   - /api/v1/barometre/  → indice rénovation énergétique + tarifs
//   - /api/v1/stats/      → statistiques publiques agrégées
//   - /api/v1/tarifs/     → barème par métier×ville
//   - /api/v1/docs/       → documentation API publique (OpenAPI)
// Longest-match override le `/api/` disallow uniquement sur ces préfixes ;
// /api/admin, /api/cron, /api/devis etc. restent bloqués.
const OPEN_DATA_ALLOW = [
  '/',
  '/api/glossaire-rge.json',
  '/api/glossaire-rge.csv',
  '/api/datasets/',
  '/api/open-data/',
  '/api/v1/rge/',
  '/api/v1/barometre/',
  '/api/v1/stats/',
  '/api/v1/tarifs/',
  '/api/v1/docs/',
]

const PRIVATE_DISALLOW = [
  // Immutable static assets (1-year cache headers) — no need for Google to crawl
  '/_next/static/',
  // Private/auth routes
  '/admin/',
  '/api/',
  '/auth/',
  '/espace-client/',
  '/espace-artisan/',
  '/booking/',
  // Auth pages (no SEO value)
  '/connexion',
  '/inscription',
  '/inscription-artisan',
  '/mot-de-passe-oublie',
  '/definir-mot-de-passe',
  // Internal search page (redirects to /services via 301 — waste of crawl budget)
  '/recherche',
  // Offline fallback page (PWA only, no SEO value)
  '/offline',
  // Query parameter variations (duplicate content).
  // Pattern /*?*param= covers BOTH first (?param=) and secondary (&param=) occurrences.
  // Google doc example: disallow: /*?*color= (blocks /items?color=x AND /items?cat=y&color=x)
  '/*?*sort=',
  '/*?*page=',
  '/*?*filter=',
  '/*?*q=',
  '/*?*redirect=',
  '/*?*tag=',
  '/*?*ref=',
  // UTM tracking parameters (Google Analytics / generic campaigns)
  '/*?*utm_source=',
  '/*?*utm_medium=',
  '/*?*utm_campaign=',
  '/*?*utm_term=',
  '/*?*utm_content=',
  '/*?*utm_id=',
  // Ad network click IDs — always duplicates of canonical landing pages
  '/*?*fbclid=',
  '/*?*gclid=',
  '/*?*gbraid=',
  '/*?*wbraid=',
  '/*?*dclid=',
  '/*?*msclkid=',
  '/*?*yclid=',
  '/*?*twclid=',
  '/*?*li_fat_id=',
  // Email marketing tracking (Mailchimp, Klaviyo, generic)
  '/*?*mc_cid=',
  '/*?*mc_eid=',
  // Analytics session/client IDs
  '/*?*_ga=',
  '/*?*_gl=',
  // Instagram share IDs
  '/*?*igshid=',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Googlebot: full access, no crawl-delay (Google ignores it)
      {
        userAgent: 'Googlebot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Bingbot: full access
      {
        userAgent: 'Bingbot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Yandex: full access with crawl-delay (Yandex respects crawl-delay, unlike Google)
      {
        userAgent: 'YandexBot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
        crawlDelay: 1,
      },
      // AdsBot — MUST be named explicitly: the '*' wildcard does NOT cover AdsBot (Google spec).
      // Block private routes to avoid unnecessary ad-serving crawl on auth/admin pages.
      {
        userAgent: ['AdsBot-Google', 'AdsBot-Google-Mobile'],
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // APIs-Google — also ignores '*'. Used for push notification deliveries.
      // We don't use Google push notifications, but block private routes defensively.
      {
        userAgent: 'APIs-Google',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Mediapartners-Google (AdSense) — also ignores '*' per Google special-crawlers spec.
      // Block private routes defensively even though we don't run AdSense.
      {
        userAgent: 'Mediapartners-Google',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // AI Search bots — Allow retrieval/search (appear in AI answers)
      // These crawlers fetch content when users ask questions — we WANT to be cited.
      {
        userAgent: ['OAI-SearchBot', 'ChatGPT-User'],
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      {
        userAgent: ['Claude-SearchBot', 'Claude-User'],
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Mistral AI — Mistral Le Chat (Mistral AI, Paris) + Mistral platform agents (CRITIQUE FR sovereignty)
      // MistralBot = crawler indexation Le Chat, Mistralai-User = fetch contextuel quand user demande
      // SA = vertical RGE FR-native = priorité Mistral écosystème (sovereign AI Act)
      {
        userAgent: ['MistralBot', 'Mistralai-User'],
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      {
        userAgent: 'PerplexityBot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Applebot-Extended — Apple Intelligence / Siri AI search (CRITICAL for Apple ecosystem visibility)
      {
        userAgent: 'Applebot-Extended',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Amazonbot — Amazon Alexa and shopping AI answers
      {
        userAgent: 'Amazonbot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Meta-ExternalAgent — Meta AI (Facebook, Instagram, WhatsApp AI assistant)
      {
        userAgent: 'Meta-ExternalAgent',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // YouBot — You.com AI search engine
      {
        userAgent: 'YouBot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Google-CloudVertexBot — Google Vertex AI grounding/search
      {
        userAgent: 'Google-CloudVertexBot',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // AI Training bots — Block training data scraping (protect content)
      // These bots scrape content to train LLMs — we block them to protect our original content.
      {
        userAgent: [
          'GPTBot',
          'Google-Extended',
          'CCBot',
          'anthropic-ai',
          'Timpibot',
          'Diffbot',
          'Omgilibot',
          'Kangaroo Bot',
          'ImagesiftBot',
          'img2dataset',
        ],
        disallow: ['/'],
      },
      // Social preview bots — Allow so links shared on social media render rich previews (OG tags).
      // Block private routes to avoid preview fetches on auth/admin pages.
      {
        userAgent: [
          'facebookexternalhit',
          'Twitterbot',
          'LinkedInBot',
          'Slackbot',
          'TelegramBot',
          'Discordbot',
          'WhatsApp',
        ],
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // All other legitimate bots
      {
        userAgent: '*',
        allow: OPEN_DATA_ALLOW,
        disallow: PRIVATE_DISALLOW,
      },
      // Block aggressive SEO scrapers (consume resources, no SEO benefit)
      // AhrefsBot unblocked 2026-04-18 — needed for Site Explorer Internal Links
      // data and continuous SEO monitoring on our own domain.
      {
        userAgent: [
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'PetalBot',
          'DataForSeoBot',
          'Bytespider',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: [
      // Recent sitemap first — Google crawls sitemaps in declaration order.
      // Pages modified in the last 7 days get crawled first (freshness signal).
      `${SITE_URL}/api/sitemap-recent`,
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/image-sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
      // 2026-04-22: retiré 3 RSS feeds (/feed/blog.xml, /feed/nouveaux-artisans.xml,
      // /feed/nouvelles-pages.xml). Ahrefs les flaggait "Invalid representation" :
      // un Sitemap doit suivre le protocole sitemaps.org (XML <urlset>), pas RSS 2.0.
      // Les RSS feeds restent exposés via <link rel="alternate"> dans le HTML head.
    ],
  }
}
