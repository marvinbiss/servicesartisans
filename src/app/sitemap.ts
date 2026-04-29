import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getQuestionSlugs } from '@/lib/data/questions'
import { comparisons } from '@/lib/data/comparisons'
import { GSC_PRIORITY_CITIES } from '@/lib/seo/gsc-priority-cities'
import {
  STATIC_BATCH,
  LARGE_BATCH,
  SITEMAP_CITY_COUNT,
  SITEMAP_CITY_COUNT_TIER2,
  SITEMAP_SERVICE_CITIES_COUNT,
} from '@/lib/seo/sitemap-config'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { CEE_OPERATIONS_WITH_GUIDE } from '@/lib/cee/operation-guides-content'
import { RGE_QUALIFICATIONS_WITH_GUIDE } from '@/lib/rge/qualification-guides-content'
import { articleSlugs } from '@/lib/data/blog/articles'
import { allArticles } from '@/lib/data/blog/articles'
import { blogCategories, categoryToSlug, normalizeCategory } from '@/lib/data/blog/categories'
import { allArticlesMeta } from '@/lib/data/blog/articles-index'
import { fetchAllLastmodData, type SitemapLastmodData } from '@/lib/seo/lastmod-queries'
import { aidesSlugs } from '@/lib/aides/aides-catalog'
// Return 404 for sitemap IDs not in generateSitemaps() — prevents ghost sitemaps
// from returning empty-but-valid XML that Google keeps crawling forever.
export const dynamicParams = false

// Build-time date for pages whose content rarely changes (hub pages, static
// pages, guides). Refreshed on every deploy — this is honest freshness,
// not fake: the page WAS re-rendered and re-validated on this date. Combined
// with weekly redeploys it keeps the lastmod signal active without
// artificially claiming daily content updates.
const STATIC_DATE = new Date().toISOString().slice(0, 10)

// CEE — codes d'opérations seed (migration 383). Source statique, alignée sur
// `cee_operations`. Utilisée par les sitemaps pour éviter un round-trip DB au
// build (les codes FOS ne bougent qu'à la publication d'un nouvel arrêté DGEC).
// Fiches abrogées retirées : BAR-TH-106 (01/01/2024, remplacée par BAR-TH-171),
// BAR-TH-160 (01/08/2025, pas de remplacement direct), BAR-TH-164 (remplacée
// par BAR-TH-174). Nouvelles fiches en vigueur ajoutées : BAR-TH-172, 174,
// 175, 177. Ordre alphabétique conservé.
const CEE_OPERATION_CODES: readonly string[] = [
  'bar-en-101',
  'bar-en-102',
  'bar-en-103',
  'bar-en-104',
  'bar-en-108',
  'bar-th-112',
  'bar-th-113',
  'bar-th-125',
  'bar-th-127',
  'bar-th-129',
  'bar-th-143',
  'bar-th-148',
  'bar-th-159',
  'bar-th-161',
  'bar-th-171',
  'bar-th-172',
  'bar-th-173',
  'bar-th-174',
  'bar-th-175',
  'bar-th-177',
  'bar-se-104',
] as const

// Lazily-loaded lastmod data from DB. Fetched once, reused across all sitemap IDs.
// If DB is unavailable, all maps are empty → lastmod is omitted (honest).
let _lastmodData: SitemapLastmodData | null = null
async function getLastmodData(): Promise<SitemapLastmodData> {
  if (!_lastmodData) {
    _lastmodData = await fetchAllLastmodData()
  }
  return _lastmodData
}

/**
 * Lookup helpers — normalize city/dept/region names for map lookup.
 * Returns undefined if no real lastmod data exists (= omit lastmod).
 */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Generate sitemap index entries.
 * Next.js 14 calls this to produce /sitemap/[id].xml and a sitemap index.
 */
export async function generateSitemaps() {
  // Tiered sitemap strategy — ~742K URLs total.
  // Tier 1 (service, devis, tarifs, urgence × ALL cities): contenu le plus riche.
  // Tier 2 (tarifs-tâche, avis, problèmes × top 500 cities): plus template-like.
  // Quartier-level sitemaps removed (too granular, thin content).
  // Use SITEMAP_SERVICE_CITIES_COUNT (= SITEMAP_CITY_COUNT + GSC priority extras)
  // pour matcher la longueur réelle de `mergedCities` ci-dessous, sinon les
  // ~3 700 URLs GSC priority sortent du dernier batch slice.
  const serviceCitiesBatchCount = Math.ceil(
    (services.length * SITEMAP_SERVICE_CITIES_COUNT) / LARGE_BATCH
  )

  const emergencySlugs = Object.keys(tradeContent)
  const problemSlugs = getProblemSlugs()

  // Tier 2: avis, problemes use top 500 cities only.
  // tarifs-task-cities REMOVED 2026-04-29 (stratégie 140K vague 1) :
  // 184 500 URLs supprimées via DELETE 410 (cf. evaluateGonePath +
  // docs/strategy-140k-2026-04-29.md). 0 KW Ahrefs, 0 backlinks, cannibalise
  // /services/[s]/[v] qui contient déjà ces tâches comme sections.

  const sitemaps: { id: string }[] = [
    { id: 'static' },
    ...Array.from({ length: serviceCitiesBatchCount }, (_, i) => ({ id: `service-cities-${i}` })),
    { id: 'cities' },
    { id: 'geo' },
    { id: 'devis-services' },
    // Tier 1: devis, urgence, tarifs → all 2 267 cities
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `devis-service-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((emergencySlugs.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `urgence-service-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((services.length * SITEMAP_CITY_COUNT) / STATIC_BATCH) },
      (_, i) => ({ id: `tarifs-service-cities-${i}` })
    ),
    // Tier 2: avis, problèmes → top 500 cities
    // tarifs-task-cities REMOVED 2026-04-29 (DELETE 410 — gone-paths.ts).
    { id: 'avis-services' },
    // Reviews schema drift résolu 2026-04-12 (migrations 385+386 + bascule
    // admin client + type canonical src/types/review.ts). Réactivation des
    // shards /avis/{service}/{ville} dans le sitemap.
    ...Array.from(
      {
        length: Math.ceil(
          (Object.keys(tradeContent).length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH
        ),
      },
      (_, i) => ({ id: `avis-service-cities-${i}` })
    ),
    { id: 'problemes' },
    ...Array.from(
      { length: Math.ceil((problemSlugs.length * SITEMAP_CITY_COUNT_TIER2) / STATIC_BATCH) },
      (_, i) => ({ id: `problemes-cities-${i}` })
    ),
    ...Array.from(
      { length: Math.ceil((departements.length * getTradesSlugs().length) / LARGE_BATCH) },
      (_, i) => ({ id: `dept-services-${i}` })
    ),
    { id: 'barometre' },
    { id: 'region-services' },
    // RGE pSEO — Tier 2 (top 500 villes) car pages nouvelles, on évite de diluer
    // le ratio d'indexation tant que Google évalue la qualité du cluster RGE.
    // Scaler au full SITEMAP_CITY_COUNT une fois le ratio > 40%.
    { id: 'rge-city' }, // /artisans-rge/[ville] — 500 URLs
    { id: 'rge-service' }, // /rge/[service] — 14 URLs (hub par métier)
    { id: 'rge-qualification' }, // /rge/qualifications + /rge/qualifications/[slug] — 5 URLs
    { id: 'rge-service-city' }, // /rge/[service]/[ville] — 14 × 500 = 7 000 URLs
    { id: 'rge-service-dept' }, // /rge/[service]/departement/[dept] — 14 × 101 = 1 414 URLs
    // CEE pSEO — Tier 2 : 19 op\u00e9rations × 500 villes = 9 500 URLs
    // + hub par op\u00e9ration (19 URLs). Pages noindex fail-open si 0 provider.
    { id: 'cee-operation' }, // /cee/[op] — 19 URLs
    { id: 'cee-operation-guide' }, // /cee/[op]/guide — 5 URLs (high-intent guides)
    { id: 'cee-operation-city' }, // /cee/[op]/[ville] — 19 × 500 = 9 500 URLs
  ]

  // Provider sitemaps are served dynamically via /api/sitemap-providers
  // (DB-dependent, can't reliably pre-render at build time).
  // They are referenced in the sitemap index (/api/sitemap-index) and
  // rewritten via next.config.js: /sitemap/providers-*.xml → /api/sitemap-providers?id=*

  return sitemaps
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  // ── Static pages + services ─────────────────────────────────────────
  if (id === 'static') {
    // Homepage — STATIC_DATE: content changes rarely (hero, sections are stable)
    const homepage: MetadataRoute.Sitemap = [
      { url: SITE_URL, lastModified: STATIC_DATE, changeFrequency: 'weekly', priority: 1.0 },
    ]

    // Hub pages — STATIC_DATE: aggregation pages with stable structure
    const hubPages: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/tarifs`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/urgence`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/devis`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      // /avis listé dans le shard reviews (ligne 1092) avec lastmod
      // dynamique basé sur reviewByService — éviter le doublon ici.
      {
        url: `${SITE_URL}/blog`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/guides`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/rge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/rge/sources`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/rge/comment-devenir-rge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/rge/fraude-rge-comment-verifier`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/rge/tarifs-audit-energetique`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/cee/guides`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee/coup-de-pouce-2026`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/cee/mandataire-vs-direct`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/maprimerenov-cumulaison-cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // /simulateur-prime-cee → 301 → /simulateur-aides-renovation (next.config.js).
      // Seul le slug canonical est listé pour économiser le crawl budget.
      {
        url: `${SITE_URL}/simulateur-aides-renovation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/devenir-partenaire-cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/leads-exclusifs-vs-partages`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/comparatif-primes-cee-2026`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/ademe`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/questions`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/barometre`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/barometre/regions`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/barometre/tarifs`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/barometre/rge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // /recherche removed — 301-redirects to /services (next.config.js). Including redirected URLs
      // in sitemaps wastes crawl budget and sends conflicting signals to Google.
      {
        url: `${SITE_URL}/comparaison`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/glossaire`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/normes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/statistiques-artisans-france`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Static pages — STATIC_DATE: rarely change, honest lastmod
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/a-propos`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      // FAQ lastmod = date the FAQPage schema was reactivated (commit 64b0a627)
      {
        url: `${SITE_URL}/faq`,
        lastModified: '2026-04-03',
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/comment-ca-marche`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/notre-processus-de-verification`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/politique-avis`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/mediation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/garantie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/outils`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/outils/calculateur-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/outils/diagnostic`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/carte-artisans`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      // Pillar hub rénovation énergétique — YMYL, E-E-A-T, aides 2026.
      // lastmod bump manuellement quand les barèmes/aides évoluent.
      {
        url: `${SITE_URL}/renovation-energetique`,
        lastModified: '2026-04-19',
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      // Hub /aides — chantier #6 catalogue 12 aides 2026 (35-45K req/mois).
      {
        url: `${SITE_URL}/aides`,
        lastModified: '2026-04-29',
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      ...aidesSlugs.map((slug) => ({
        url: `${SITE_URL}/aides/${slug}`,
        lastModified: '2026-04-29',
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
      // Sprint 0.4 — Open data backbone (CC-BY 4.0 → backlinks DR 92 data.gouv.fr).
      {
        url: `${SITE_URL}/open-data`,
        lastModified: '2026-04-29',
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/datasets/rge`,
        lastModified: '2026-04-29',
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/developpeurs`,
        lastModified: '2026-04-29',
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/artisans`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/avant-apres`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/calendrier-travaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/checklist-travaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/badge-artisan`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/verifier-artisan`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/recherche`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/widget-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      // E-E-A-T & transparency pages (auteurs, méthodo, sources) — priority 0.4-0.5 :
      // signal YMYL fort pour Google, backlink-friendly, traffic direct faible.
      {
        url: `${SITE_URL}/equipe`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/methodologie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/sources`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.4,
      },
      // Plan du site HTML — aide le maillage interne + facilite le crawl des
      // robots moins sophistiqués. Priority 0.3 (navigation utility).
      {
        url: `${SITE_URL}/plan-du-site`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.3,
      },
      // Badge artisan (link-building) + études (data-driven editorial).
      {
        url: `${SITE_URL}/badge`,
        lastModified: STATIC_DATE,
        changeFrequency: 'yearly',
        priority: 0.4,
      },
      {
        url: `${SITE_URL}/etudes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/etudes/deserts-artisanaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    // Guide pages
    const guideSlugs = [
      'acompte-artisan-legal-maximum',
      'adoucisseur-eau-prix-pose',
      'aide-isolation-maison-proprietaire',
      'aides-renovation-2026',
      'alarme-maison-installation-prix',
      'amenagement-combles-perdus-prix',
      'amiante-desamiantage-prix-obligation',
      'annuaire-rge-verifier-officiel',
      'artisan-rge',
      'assainissement-individuel-fosse-septique',
      'assurance-dommage-ouvrage',
      'assurance-habitation-travaux',
      'audit-energetique-prix-aides',
      'borne-recharge-irve-obligation',
      'budget-renovation',
      'cee-monter-dossier-etapes',
      'chantier-abandonne-artisan-recours',
      'chaudiere-fioul-interdite-2026',
      'chaudiere-gaz-vs-granules',
      'chaudiere-ne-chauffe-plus',
      'chauffe-eau-thermodynamique-prix',
      'classe-energie-f-interdite-2028',
      'climatisation-reversible-prix-pose',
      'cloison-placo-prix-pose-m2',
      'cloture-jardin-reglementation',
      'comment-choisir-artisan-rge',
      'comment-faire-devis-travaux',
      'comparer-3-devis-artisans',
      'condensation-fenetres-causes',
      'controle-rge-frequence',
      'coup-de-pouce-chauffage-2026',
      'credit-travaux-pret-personnel-comparatif',
      'declaration-prealable-travaux',
      'degat-eaux-responsabilites-voisin',
      'delai-retractation-devis-artisan',
      'devis-facture-mentions-obligatoires',
      'devis-travaux',
      'diagnostics-immobiliers',
      'diagnostics-vente-obligatoires',
      'domotique-installation-smart-home',
      'dpe-mauvais-que-faire',
      'dtu-plomberie-normes',
      'eco-pret-taux-zero-2026',
      'eviter-arnaques-artisan',
      'expertise-batiment-prix-quand-faire-appel',
      'extension-maison',
      'faux-devis-detecter-signaler',
      'fissures-maison-inquietantes',
      'fuite-eau-que-faire',
      'garantie-decennale',
      'garantie-decennale-obligatoire',
      'garantie-parfait-achevement',
      'humidite-mur-interieur-solution',
      'infiltration-eau-toiture-diagnostic',
      'infiltration-fenetre-pvc',
      'installation-pompe-chaleur-etapes',
      'interphone-visiophone-installation-prix',
      'isolation-combles',
      'isolation-exterieure-vs-interieure',
      'isolation-phonique-mur-appartement',
      'isolation-thermique',
      'labels-qualifications-artisans',
      'malfacons-travaux-recours',
      'maprimerenov-2026',
      'maprimerenov-copropriete',
      'maprimerenov-parcours-accompagne',
      'moisissure-mur-chambre-traitement',
      'mon-accompagnateur-renov-obligatoire',
      'normes-electriques',
      'odeur-canalisation-remede',
      'ouverture-mur-porteur-prix',
      'panne-electrique-generale-conduite',
      'panneau-solaire-prix-rentabilite',
      'parquet-massif-pose-prix-m2',
      'passoire-thermique-renovation',
      'pergola-bioclimatique-prix-m2',
      'permis-construire',
      'perte-rge-consequences',
      'plafond-maprimerenov-revenus-2026',
      'plombier-tarif-horaire-2026',
      'poele-granules-aides-2026',
      'pont-thermique-maison-traitement',
      'pompe-a-chaleur',
      'portail-motorise-prix-pose',
      'porte-claquee-serrurier-prix',
      'prime-pompe-chaleur-locataire',
      'prix-carrelage-pose-m2',
      'prix-changement-fenetres-double-vitrage',
      'prix-electricien-heure-2026',
      'prix-installation-chaudiere-gaz',
      'prix-isolation-combles-100m2',
      'prix-peinture-appartement-50m2',
      'prix-pompe-chaleur-air-eau-installee',
      'prix-ravalement-facade-maison',
      'prix-renovation-maison-100m2',
      'prix-renovation-salle-bain-4m2',
      'qualipac-signification-obtenir',
      'radiateur-electrique-inertie-prix',
      'ravalement-facade-obligation-10-ans',
      'reception-travaux-pv-checklist',
      'refuser-devis-artisan-signe',
      'remontee-capillaire-mur-solution',
      'remplacement-fenetres-aides-2026',
      'renovation-cuisine',
      'renovation-energetique-complete',
      'renovation-fenetres',
      'renovation-salle-de-bain',
      'renovation-toiture',
      'retenue-garantie-5-pourcent',
      'serrurier-arnaques-tarifs-honnetes',
      'surelevation-toiture-prix',
      'tableau-electrique-aux-normes-2026',
      'taxe-amenagement-calcul-2026',
      'terrasse-bois-composite-prix-m2',
      'travaux-copropriete',
      'trouver-artisan',
      'tva-5-5-travaux-conditions',
      'velux-installation-prix',
      'ventilation-double-flux-prix',
      'veranda-prix-pose-m2',
      'verifier-siret-artisan',
      'vice-cache-immobilier-recours',
      'vmc-obligatoire-maison-neuve',
      'volet-roulant-motorise-prix',
    ]
    // Guides — STATIC_DATE: editorial content, updated manually when revised
    const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
      url: `${SITE_URL}/guides/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Question pages
    // Questions — STATIC_DATE: Q&A content, stable once published
    const questionPages: MetadataRoute.Sitemap = getQuestionSlugs().map((slug) => ({
      url: `${SITE_URL}/questions/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    }))

    // Comparison pages
    // Comparisons — STATIC_DATE: editorial content, stable once published
    const comparisonPages: MetadataRoute.Sitemap = comparisons.map((c) => ({
      url: `${SITE_URL}/comparaison/${c.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    // Blog articles — lastModified réel (seul contenu avec vraie date vérifiable)
    // Priority 0.7: blog content drives organic traffic and E-E-A-T signals
    const blogArticlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => {
      const article = allArticles[slug]
      return {
        url: `${SITE_URL}/blog/${slug}`,
        lastModified: article ? new Date(article.updatedDate || article.date) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

    // Service hub pages — lastmod = dernier provider ajouté/modifié pour ce service.
    // Falls back to STATIC_DATE for services with no providers yet.
    const { byService } = await getLastmodData()

    const servicesIndex: MetadataRoute.Sitemap = [
      {
        url: `${SITE_URL}/services`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ]

    const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      lastModified: byService.get(service.slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // "Autour de moi" — 10 high-volume services with browser geolocation UX
    // linked to the 30 top French cities. Pilier 3.C of CEO strategy.
    const AROUND_ME_SERVICES = [
      'plombier',
      'electricien',
      'serrurier',
      'chauffagiste',
      'peintre-en-batiment',
      'menuisier',
      'macon',
      'couvreur',
      'carreleur',
      'jardinier',
    ] as const
    const aroundMePages: MetadataRoute.Sitemap = AROUND_ME_SERVICES.map((slug) => ({
      url: `${SITE_URL}/services/${slug}/autour-de-moi`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    const emergencySlugs = Object.keys(tradeContent)
    const urgencePages: MetadataRoute.Sitemap = emergencySlugs.map((slug) => ({
      url: `${SITE_URL}/urgence/${slug}`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/tarifs/${slug}`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    // Blog category pages — lastModified = date du dernier article de la catégorie
    const blogCategoryPages: MetadataRoute.Sitemap = blogCategories
      .filter((c) =>
        allArticlesMeta.some((a) => categoryToSlug(normalizeCategory(a.category)) === c.slug)
      )
      .map((c) => {
        const categoryArticles = allArticlesMeta.filter(
          (a) => categoryToSlug(normalizeCategory(a.category)) === c.slug
        )
        const latestDate =
          categoryArticles.length > 0
            ? new Date(Math.max(...categoryArticles.map((a) => new Date(a.date).getTime())))
            : undefined
        return {
          url: `${SITE_URL}/blog/categorie/${c.slug}`,
          lastModified: latestDate,
        }
      })

    // Blog tag pages — all unique tags
    const tagSet = new Map<string, string>()
    for (const a of allArticlesMeta) {
      for (const t of a.tags) {
        const slug = t
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        if (!tagSet.has(slug)) tagSet.set(slug, t)
      }
    }
    const blogTagPages: MetadataRoute.Sitemap = Array.from(tagSet.keys()).map((tagSlug) => {
      // Trouver la date du dernier article ayant ce tag
      const tagArticles = allArticlesMeta.filter((a) =>
        a.tags.some(
          (t) =>
            t
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') === tagSlug
        )
      )
      const latestDate =
        tagArticles.length > 0
          ? new Date(Math.max(...tagArticles.map((a) => new Date(a.date).getTime())))
          : undefined
      return {
        url: `${SITE_URL}/blog/tag/${tagSlug}`,
        lastModified: latestDate,
      }
    })

    // /aides/[dept]/maprimerenov — 101 metropolitan + DOM-TOM dept pages.
    // ISR (revalidate 86400), pre-rendered top 20 at build. Priority 0.75:
    // targeted long-tail MPR intent per department.
    const { departements: deptList } = await import('@/lib/data/france')
    const aidesDeptMprPages: MetadataRoute.Sitemap = deptList.map((d) => ({
      url: `${SITE_URL}/aides/${d.slug}/maprimerenov`,
      lastModified: '2026-04-19',
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

    return [
      ...homepage,
      ...hubPages,
      ...staticPages,
      ...guidePages,
      ...questionPages,
      ...comparisonPages,
      ...blogArticlePages,
      ...blogCategoryPages,
      ...blogTagPages,
      ...servicesIndex,
      ...servicePages,
      ...aroundMePages,
      ...urgencePages,
      ...tarifsPages,
      ...aidesDeptMprPages,
    ]
  }

  // ── Service × city — full scale: all 2 267 cities ──────────────────
  if (id.startsWith('service-cities-') && !id.startsWith('service-cities-extended-')) {
    const batchIndex = parseInt(id.replace('service-cities-', ''), 10)
    const BATCH = LARGE_BATCH
    const offset = batchIndex * BATCH

    // Merge top cities by population + GSC priority cities (deduplicated)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const phase1Slugs = new Set(phase1Cities.map((v) => v.slug))
    const gscExtras = GSC_PRIORITY_CITIES.filter((slug) => !phase1Slugs.has(slug))
      .map((slug) => villes.find((v) => v.slug === slug))
      .filter((v): v is NonNullable<typeof v> => v != null)
    const mergedCities = [...phase1Cities, ...gscExtras]

    const { byDeptServiceSlug } = await getLastmodData()

    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      for (const ville of mergedCities) {
        // Service×city — lastmod from latest provider activity in dept×service.
        // If no data → omitted (honest). Priority 0.8: primary conversion pages.
        const deptKey = `${normalizeName(ville.departement)}::${service.slug}`
        const lastmod = byDeptServiceSlug.get(deptKey)
        allUrls.push({
          url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
          lastModified: lastmod,
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }

    return allUrls.slice(offset, offset + BATCH)
  }

  // ── City pages ──────────────────────────────────────────────────────
  if (id === 'cities') {
    const { byCity } = await getLastmodData()

    const villesIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/villes`, changeFrequency: 'weekly', priority: 0.6 },
    ]

    // lastmod = date du dernier provider modifié dans cette ville. Si aucun → omis.
    // Priority 0.6: city pages are strong geo-landing pages for local SEO
    const villePages: MetadataRoute.Sitemap = villes.map((ville) => ({
      url: `${SITE_URL}/villes/${ville.slug}`,
      lastModified: byCity.get(normalizeName(ville.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    return [...villesIndex, ...villePages]
  }

  // ── Geo pages (départements + régions) ──────────────────────────────
  if (id === 'geo') {
    const { byDepartment, byRegion } = await getLastmodData()

    const departementsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/departements`, changeFrequency: 'weekly', priority: 0.7 },
    ]

    // lastmod = date du dernier provider modifié dans ce département. Si aucun → omis.
    const departementPages: MetadataRoute.Sitemap = departements.map((dept) => ({
      url: `${SITE_URL}/departements/${dept.slug}`,
      lastModified: byDepartment.get(normalizeName(dept.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    const regionsIndex: MetadataRoute.Sitemap = [
      { url: `${SITE_URL}/regions`, changeFrequency: 'weekly', priority: 0.7 },
    ]

    // lastmod = date du dernier provider modifié dans cette région. Si aucun → omis.
    const regionPages: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/regions/${region.slug}`,
      lastModified: byRegion.get(normalizeName(region.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))

    return [...departementsIndex, ...departementPages, ...regionsIndex, ...regionPages]
  }

  // ── Devis service hub pages ─────────────────────────────────────────
  // Devis hub pages — STATIC_DATE: template content, stable
  if (id === 'devis-services') {
    return Object.keys(tradeContent).map((slug) => ({
      url: `${SITE_URL}/devis/${slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  }

  // ── Devis service×city pages — all combos, priority boost for qualified ─
  // Pages have hasUniqueData: true (tradeContent + editorial + price tables + FAQ),
  // so they're always indexed. Include all in sitemap for discovery.
  if (id.startsWith('devis-service-cities-')) {
    const batchIndex = parseInt(id.replace('devis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos, byDeptServiceSlug } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const ville of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) {
          const isQualified = !qualifiedCombos || qualifiedCombos.has(`${svc.slug}::${ville.slug}`)
          const deptKey = `${normalizeName(ville.departement)}::${svc.slug}`
          result.push({
            url: `${SITE_URL}/devis/${svc.slug}/${ville.slug}`,
            lastModified: byDeptServiceSlug.get(deptKey),
            changeFrequency: 'monthly',
            priority: isQualified ? 0.7 : 0.5,
          })
        }
        count++
      }
    }

    return result
  }

  // ── Urgence service×city pages — all combos, priority boost for qualified ─
  if (id.startsWith('urgence-service-cities-')) {
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const emergencySlugs = Object.keys(tradeContent)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos, byDeptServiceSlug } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of emergencySlugs) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) {
          const isQualified = !qualifiedCombos || qualifiedCombos.has(`${svc}::${v.slug}`)
          const deptKey = `${normalizeName(v.departement)}::${svc}`
          result.push({
            url: `${SITE_URL}/urgence/${svc}/${v.slug}`,
            lastModified: byDeptServiceSlug.get(deptKey),
            changeFrequency: 'monthly',
            priority: isQualified ? 0.6 : 0.4,
          })
        }
        count++
      }
    }

    return result
  }

  // ── Tarifs service×city pages — all combos, priority boost for qualified ─
  if (id.startsWith('tarifs-service-cities-')) {
    const batchIndex = parseInt(id.replace('tarifs-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT)
    const { qualifiedCombos, byDeptServiceSlug } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of services) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start) {
          const isQualified = !qualifiedCombos || qualifiedCombos.has(`${svc.slug}::${v.slug}`)
          const deptKey = `${normalizeName(v.departement)}::${svc.slug}`
          result.push({
            url: `${SITE_URL}/tarifs/${svc.slug}/${v.slug}`,
            lastModified: byDeptServiceSlug.get(deptKey),
            changeFrequency: 'monthly',
            priority: isQualified ? 0.7 : 0.5,
          })
        }
        count++
      }
    }

    return result
  }

  // ── Tarifs task×city pages — DELETED 2026-04-29 (stratégie 140K vague 1) ──
  // 184 500 URLs supprimées via DELETE 410. Voir evaluateGonePath()
  // dans src/lib/seo/gone-paths.ts + docs/strategy-140k-2026-04-29.md.
  // Le route file src/app/(public)/tarifs/[service]/[ville]/[travail]/page.tsx
  // est conservé jusqu'au déploiement du middleware mis à jour pour éviter
  // un build break ; il n'est plus indexé ni servi (middleware retourne 410).

  // ── Avis service hub pages ──────────────────────────────────────────
  if (id === 'avis-services') {
    const { reviewByService } = await getLastmodData()
    const tradeSlugs = Object.keys(tradeContent)
    // Hub /avis — lastmod = date du dernier avis toutes catégories confondues
    const allReviewDates = Array.from(reviewByService.values())
    const latestReview = allReviewDates.length > 0 ? allReviewDates.sort().reverse()[0] : undefined
    return [
      {
        url: `${SITE_URL}/avis`,
        lastModified: latestReview,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      // /avis/{service} — lastmod = date du dernier avis pour ce service. Si aucun → omis.
      ...tradeSlugs.map((slug) => ({
        url: `${SITE_URL}/avis/${slug}`,
        lastModified: reviewByService.get(slug),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ]
  }

  // ── Avis service×city pages ─────────────────────────────────────────
  // Réactivées 2026-04-12 après résolution du reviews schema drift
  // (migrations 414_reviews_rls_hardening + 415_reviews_add_missing_columns,
  // bascule POST /api/reviews sur admin client, type canonical review.ts).
  if (id.startsWith('avis-service-cities-')) {
    const batchIndex = parseInt(id.replace('avis-service-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const tradeSlugs = Object.keys(tradeContent)
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const svc of tradeSlugs) {
      for (const v of phase1Cities) {
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/avis/${svc}/${v.slug}`,
            changeFrequency: 'monthly',
            priority: 0.5,
          })
        count++
      }
    }

    return result
  }

  // ── Problemes hub + individual pages ────────────────────────────────
  // Problemes = contenu éditorial statique. Pas de lastmod (honnête).
  if (id === 'problemes') {
    const problemSlugs = getProblemSlugs()
    return [
      {
        url: `${SITE_URL}/problemes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      ...problemSlugs.map((slug) => ({
        url: `${SITE_URL}/problemes/${slug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
    ]
  }

  // ── Problemes × city pages (Tier 2: top 500 cities) ────────────
  if (id.startsWith('problemes-cities-')) {
    const batchIndex = parseInt(id.replace('problemes-cities-', ''))
    const BATCH = STATIC_BATCH
    const start = batchIndex * BATCH
    const end = start + BATCH
    const problemSlugs = getProblemSlugs()
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const result: MetadataRoute.Sitemap = []
    let count = 0

    outer: for (const problem of problemSlugs) {
      for (const ville of phase1Cities) {
        if (count >= end) break outer
        if (count >= start)
          result.push({
            url: `${SITE_URL}/problemes/${problem}/${ville.slug}`,
            changeFrequency: 'monthly',
            priority: 0.4,
          })
        count++
      }
    }

    return result
  }

  // ── Dept × service pages ────────────────────────────────────────────
  if (id.startsWith('dept-services-')) {
    const { byDeptService } = await getLastmodData()
    const batchIndex = parseInt(id.replace('dept-services-', ''))
    const tradeSlugs = getTradesSlugs()
    const allUrls: MetadataRoute.Sitemap = []
    for (const dept of departements) {
      for (const service of tradeSlugs) {
        // lastmod = date du dernier provider (dept, service). Si aucun → omis.
        const key = `${normalizeName(dept.name)}::${service}`
        allUrls.push({
          url: `${SITE_URL}/departements/${dept.slug}/${service}`,
          lastModified: byDeptService.get(key),
          changeFrequency: 'monthly',
          priority: 0.5,
        })
      }
    }
    return allUrls.slice(batchIndex * LARGE_BATCH, (batchIndex + 1) * LARGE_BATCH)
  }

  // ── Baromètre pages (regions + tarifs by métier) ────────────────────
  if (id === 'barometre') {
    const { byRegion, byService } = await getLastmodData()
    // Baromètre régions — lastmod = dernier provider modifié dans la région
    const barometreRegions: MetadataRoute.Sitemap = regions.map((region) => ({
      url: `${SITE_URL}/barometre/regions/${region.slug}`,
      lastModified: byRegion.get(normalizeName(region.name)),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    // Baromètre métiers — lastmod = dernier provider modifié pour ce service
    const barometreMetiers: MetadataRoute.Sitemap = getTradesSlugs().map((slug) => ({
      url: `${SITE_URL}/barometre/tarifs/${slug}`,
      lastModified: byService.get(slug),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
    return [...barometreRegions, ...barometreMetiers]
  }

  // ── Region × service pages ──────────────────────────────────────────
  if (id === 'region-services') {
    const { byRegionService } = await getLastmodData()
    const tradeSlugs = getTradesSlugs()
    return regions.flatMap((region) =>
      tradeSlugs.map((service) => {
        const key = `${normalizeName(region.name)}::${service}`
        return {
          url: `${SITE_URL}/regions/${region.slug}/${service}`,
          lastModified: byRegionService.get(key),
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }
      })
    )
  }

  // ── RGE city listings (/artisans-rge/[ville]) ──────────────────────
  // Tier 2: top 500 cities only. Pages noindex fail-open if 0 providers,
  // ISR corrige avec le vrai comptage. lastmod omis (listing dérivé de la DB,
  // pas de vrai changement template).
  if (id === 'rge-city') {
    const { byCity } = await getLastmodData()
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    return phase1Cities.map((ville) => ({
      url: `${SITE_URL}/artisans-rge/${ville.slug}`,
      lastModified: byCity.get(normalizeName(ville.name)),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  }

  // ── RGE service hub pages (/rge/[service]) ─────────────────────────
  // 14 URLs — une par métier énergétique couvert par la mention RGE.
  // Priority 0.7 (hub éditorial, entre la home /rge à 0.8 et les pSEO
  // ville à 0.6). lastmod statique : contenu éditorial versionné code.
  if (id === 'rge-service') {
    return RGE_ALLOWED_SERVICES.map((svc) => ({
      url: `${SITE_URL}/rge/${svc}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  // ── RGE qualifications guides (/rge/qualifications + /rge/qualifications/[slug])
  // Hub + guides éditoriaux dérivés de RGE_QUALIFICATION_GUIDES
  // (QualiPAC, QualiSol, QualiBois, Qualifelec, QualiPV, architecte audit énergétique).
  if (id === 'rge-qualification') {
    return [
      {
        url: `${SITE_URL}/rge/qualifications`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      ...RGE_QUALIFICATIONS_WITH_GUIDE.map((slug) => ({
        url: `${SITE_URL}/rge/qualifications/${slug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
      })),
    ]
  }

  // ── RGE service × city listings (/rge/[service]/[ville]) ───────────
  // 14 services énergétiques × 500 villes = 7 000 URLs max → pruned to combos
  // with ≥1 active RGE provider (Vague 1.3 sitemap purge). Fail-open: if the
  // DB query errors out, `rgeQualifiedServiceCity === null` ⇒ emit everything
  // (current behaviour). Noindex fail-open côté route reste filet de secours.
  if (id === 'rge-service-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const { rgeQualifiedServiceCity, rgeLastmodServiceCity } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const ville of phase1Cities) {
        const key = `${svc}::${ville.slug}`
        if (rgeQualifiedServiceCity && !rgeQualifiedServiceCity.has(key)) {
          continue
        }
        result.push({
          url: `${SITE_URL}/rge/${svc}/${ville.slug}`,
          lastModified: rgeLastmodServiceCity?.get(key),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
    return result
  }

  // ── RGE service × department listings (/rge/[service]/departement/[dept])
  // 14 services énergétiques × 101 départements = 1 414 URLs max → pruned
  // to combos with ≥1 active RGE provider. Fail-open identique.
  if (id === 'rge-service-dept') {
    const { rgeQualifiedServiceDept, rgeLastmodServiceDept } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const dept of departements) {
        const deptKey = normalizeName(dept.name)
        const mapKey = `${svc}::${deptKey}`
        if (rgeQualifiedServiceDept && !rgeQualifiedServiceDept.has(mapKey)) {
          continue
        }
        result.push({
          url: `${SITE_URL}/rge/${svc}/departement/${dept.slug}`,
          lastModified: rgeLastmodServiceDept?.get(mapKey),
          changeFrequency: 'weekly',
          priority: 0.55,
        })
      }
    }
    return result
  }

  // ── CEE operation hub pages (/cee/[op]) ──────────────────────────────
  // 19 URLs — une par op\u00e9ration CEE active. Priority 0.7, weekly.
  if (id === 'cee-operation') {
    return CEE_OPERATION_CODES.map((code) => ({
      url: `${SITE_URL}/cee/${code}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  }

  // ── CEE operation guides (/cee/[op]/guide) ──────────────────────────
  // Guides éditoriaux long-format pour les opérations high-intent
  // (dérivés dynamiquement de CEE_OPERATION_GUIDES).
  // Priority 0.75 (au-dessus du hub car contenu éditorial riche).
  if (id === 'cee-operation-guide') {
    return CEE_OPERATIONS_WITH_GUIDE.map((code) => ({
      url: `${SITE_URL}/cee/${code.toLowerCase()}/guide`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))
  }

  // ── CEE operation × city pSEO (/cee/[op]/[ville]) ───────────────────
  // 19 op\u00e9rations × top 500 villes = 9 500 URLs max → pruned aux combos
  // avec ≥1 artisan éligible (Vague 1.3). Fail-open si DB blip.
  if (id === 'cee-operation-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const { ceeQualifiedOperationCity, ceeLastmodOperationCity } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    for (const code of CEE_OPERATION_CODES) {
      for (const ville of phase1Cities) {
        const key = `${code}::${ville.slug}`
        if (ceeQualifiedOperationCity && !ceeQualifiedOperationCity.has(key)) {
          continue
        }
        result.push({
          url: `${SITE_URL}/cee/${code}/${ville.slug}`,
          lastModified: ceeLastmodOperationCity?.get(key),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
    return result
  }

  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
