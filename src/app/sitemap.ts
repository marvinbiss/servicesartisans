import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/config'
import { services, villes, departements, regions } from '@/lib/data/france'
import { tradeContent, getTradesSlugs } from '@/lib/data/trade-content'
import { getProblemSlugs } from '@/lib/data/problems'
import { getIndexableProblemeCombos } from '@/lib/seo/problemes-whitelist'
import { getAllCommuneSlugs } from '@/lib/data/commune-data'
import {
  assertTierPartitionCoverage,
  getServiceCityPriority,
  isServiceVilleIndexable,
} from '@/lib/seo/services-tiers'
import { isRemovedByRgePivot, isUrgenceRgeCompatible } from '@/lib/seo/pivot-rge-removed-services'

// Boot-time guard : si un service est ajouté à france.ts sans MAJ tiers, throw
// au build pour éviter le silent fallback Tier C en prod.
assertTierPartitionCoverage()
import { getQuestionSlugs } from '@/lib/data/questions'
import { getTopLongTailKeywords } from '@/lib/seo/bloc3-longtail'
import { comparisons } from '@/lib/data/comparisons'
import { GSC_PRIORITY_CITIES } from '@/lib/seo/gsc-priority-cities'
import {
  STATIC_BATCH,
  LARGE_BATCH,
  SITEMAP_CITY_COUNT,
  SITEMAP_CITY_COUNT_TIER2,
  SITEMAP_CEE_CITY_COUNT,
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

// CEE — codes d'opérations seed. Source unique : src/lib/cee/operation-codes.ts
// (leaf module sans imports — réutilisé par sitemap.ts, lastmod-queries.ts,
// indexnow-submit/route.ts pour éliminer le drift triple SSoT).
import { CEE_OPERATION_CODES } from '@/lib/cee/operation-codes'
// Sprint AI Wave D Ahrefs 2026-05-03 — cluster CEE×région.
import { CEE_REGIONAL_SLUGS } from '@/lib/cee/regional-specifics'

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

  // emergencySlugs anciennement utilisé pour calculer le nombre de shards
  // urgence-service-cities (21 svc RGE × ~2 267 villes / 8K STATIC_BATCH = 14 shards).
  // V2 #4 stratégie 140K (2026-04-29) consolide tout dans 1 shard ⇒ plus besoin.
  // problemSlugs n'est plus utilisé ici depuis V2 #7 — 1 shard fixe `problemes-cities-0`
  // suffit (tiered allocation ≈ 7 000 URLs ≤ STATIC_BATCH = 8 000).

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
    // Tier 1: tarifs → all 2 267 cities
    // devis-service-cities REMOVED 2026-04-29 (V1 #2 — 301 vers /services/[s]/[v]).
    // Hub /devis et /devis/[s] (1-2 segments) restent dans sitemap (dans 'devis-services' ci-dessus).
    // urgence-service-cities (revert partiel pivot full RGE 2026-05-03) :
    // shard restauré avec périmètre restreint aux 5 trades RGE-compatibles
    // (plombier, chauffagiste, electricien, couvreur, climaticien — cf.
    // URGENCE_RGE_COMPATIBLE_SLUGS). Filtre appliqué dans le handler
    // ci-dessous. Les autres slugs urgence restent noindex via metadata
    // page-level. Combo final = 5 svc × ≤25 villes (whitelist 140K V2#4)
    // ≈ 125 URLs ≤ STATIC_BATCH 8 000 → 1 shard suffit.
    { id: 'urgence-service-cities-0' },
    // tarifs-service-cities REMOVED 2026-04-29 (V1 #3 — 301 vers
    // /services/[s]/[v]#tarifs avec PriceTableHTML injecté). Hub /tarifs
    // et /tarifs/[s] (1-2 segments) restent dans sitemap via 'static' bloc.
    // Tier 2: problèmes → top 500 cities
    // tarifs-task-cities REMOVED 2026-04-29 (DELETE 410 — gone-paths.ts).
    // tarifs-task-whitelist-gsc REMOVED 2026-04-30 (filet G3 transformé en 301
    // vers /services/[s]/[v]#tarifs — on n'indexe pas un redirect).
    { id: 'avis-services' },
    // avis-service-cities REMOVED 2026-04-29 (V1 #5 stratégie 140K). Pages
    // restent accessibles via internal links mais noindex tant que <3 avis sur
    // le combo (cf. metadata robots dans /avis/[service]/[ville]/page.tsx).
    // Auto re-add quand flywheel produit ≥3 avis sur le combo : créer un
    // nouveau shard `avis-qualified-cities-*` filtré par DB query (V2 task).
    { id: 'problemes' },
    // problemes-cities CONSOLIDATED 2026-04-29 (V2 #7 stratégie 140K) :
    // 61 problèmes × 500 villes = 30 500 → tiered allocation (haute=200,
    // moyenne=100, basse=50) ≈ 7 000 URLs. Tient dans 1 seul shard
    // (STATIC_BATCH = 8 000). Hors whitelist : 301 → /services/[primary]/[v]
    // (cf. src/lib/seo/problemes-whitelist.ts).
    { id: 'problemes-cities-0' },
    // V3 #1 stratégie 140K (2026-04-29) — BUILD /communes/[c] pour 35 999 communes
    // INSEE actives (long-tail + asset différenciateur data-driven). Hub /communes
    // listé dans 'static'. Le handler fetch dynamiquement les slugs depuis
    // Supabase (graceful fallback sur shard vide si DB indisponible). Si
    // commune.slug = ville statique : permanentRedirect 301 vers /villes/[v]
    // (canonical priority maintenu).
    //
    // 4 shards de STATIC_BATCH (8 000) = 32 000 capacité — empiriquement
    // suffisant : le filtre `getAllCommuneSlugs(qualifiedOnly=true)` (≥500 hab
    // OU ≥1 artisan) exclut les communes thin et ramène le total à ~28-30K.
    // Audit Sentry 2026-05-02 : `communes-cities-4` retournait -100% car shard
    // empty. Réintroduire dès que le total dépasse 32 000 (ex. après une
    // vague de claims provider_count >= 1).
    { id: 'communes' },
    { id: 'communes-cities-0' },
    { id: 'communes-cities-1' },
    { id: 'communes-cities-2' },
    { id: 'communes-cities-3' },
    // V3 #3 stratégie 140K (2026-04-29) — BUILD /aides/[dept]/[aide] pour 11
    // aides nationales × 101 départements = 1 111 URLs (la 12ème = MaPrimeRénov'
    // est déjà émise séparément par /aides/[dept]/maprimerenov, cf. shard 'static').
    // 1 seul shard suffit (1 111 URLs ≤ STATIC_BATCH 8 000).
    { id: 'aides-dept' },
    // Sprint AI Wave H 2026-05-03 — BUILD /aides/[dept] (hub aggregator dept,
    // cross-aides) pour les 30 dépts whitelistés. Distribue PageRank vers
    // /aides/[dept]/[aide] (5 indexées) + /aides/[dept]/maprimerenov + aides
    // nationales /aides/[aide]. Volume search "aides renovation [dept]" ≈
    // 200-500/mois × 30 = 6-15K req/mois capturables. 30 URLs ≤ STATIC_BATCH.
    { id: 'aides-dept-hub' },
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
    { id: 'cee-operation-city' }, // /cee/[op]/[v] — V3 #2 : 22 × ≤1 000 villes filtré ≥1 artisan
    // Sprint AI Wave D Ahrefs 2026-05-03 — cluster CEE×région (~14 régions × 19 ops).
    // Pages /cee/[op]/region/[region] avec contenu différencié (zone climatique
    // RT2012, aides régionales sourcées, top villes DB-driven). noindex fail-open
    // au render si 0 provider régional (anti-thin-content).
    { id: 'cee-operation-region' }, // /cee/[op]/region/[region] — ~266 URLs
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
      // /urgence (revert partiel pivot RGE 2026-05-03) : hub indexable —
      // périmètre restreint aux 5 trades qu'un artisan RGE peut prendre
      // (plombier, chauffagiste, electricien, couvreur, climaticien).
      // Sous-pages hors whitelist : noindex via metadata page-level.
      {
        url: `${SITE_URL}/urgence`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.85,
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
        // Sprint O Ahrefs 2026-05-03 — page canonique unique du DefinedTermSet
        // RGE (16 qualifications). Cible naturelle des liens externes presse
        // / blogs tiers / dictionnaires métier mentionnant "QualiPAC" ou
        // "Qualibat 7141". Priority 0.75 = entre hub /rge (0.8) et guides
        // qualifications (0.7) — entité topical canonique.
        url: `${SITE_URL}/rge/glossaire`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        // Sprint AG Ahrefs 2026-05-03 — endpoint open-data CC-BY 4.0 (Sprint AC).
        // Déclaration sitemap pour découverte explicite par data.gouv.fr Validator,
        // Bing/Yandex (Google indexe puis flague noindex via X-Robots-Tag — OK,
        // signal de présence suffit). Priority 0.3 = asset technique.
        url: `${SITE_URL}/api/glossaire-rge.json`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.3,
      },
      {
        // Sprint AG Ahrefs 2026-05-03 — variante CSV de l'endpoint open-data
        // (Sprint AF). Mêmes garanties (CC-BY 4.0, X-Robots-Tag noindex).
        // Format Excel-friendly (BOM + CRLF + RFC 4180) ciblant les data
        // analysts qui crawlent data.gouv.fr Validator. Priority 0.3.
        url: `${SITE_URL}/api/glossaire-rge.csv`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.3,
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
      // Sprint AI Wave I 2026-05-03 — comparator MaPrimeRénov’ vs CEE
      // (10 critères + 6 cas + bridge cumul). Volume "vs" exact ≈ 1-2K/mois.
      {
        url: `${SITE_URL}/aides/maprimerenov-vs-cee`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint AI Wave K 2026-05-03 — comparator éco-PTZ vs crédit personnel
      // travaux. Volume estimé 500-800 req/mois en variantes.
      {
        url: `${SITE_URL}/aides/eco-ptz-vs-credit-personnel`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // Sprint AI Wave K 2026-05-03 — comparator MaPrimeRénov’ vs Coup de pouce.
      // Dissipe la confusion (cumul, pas alternative). Volume 300-500 req/mois.
      {
        url: `${SITE_URL}/aides/maprimerenov-vs-coup-de-pouce`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // Sprint AI Wave L 2026-05-03 — comparator aides PAC par type
      // (air-eau / air-air / géothermique / hybride). Volume "aide pompe à
      // chaleur 2026" 3-5K req/mois + variantes type-spécifiques.
      {
        url: `${SITE_URL}/aides/pompe-a-chaleur-aides-comparatif`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint AI Wave L 2026-05-03 — hub racine cluster aides par région
      // (parent canonique des 13 régions × aides régionales + cross-link
      // /cee/[op]/region/[region] + /aides/[dept]). Priority 0.75 = parent.
      {
        url: `${SITE_URL}/aides/par-region`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint 3 territorial 2026-05-04 — pages cluster aides par région.
      // /aides/[region]/renovation × 13 régions métropolitaines couvertes par
      // REGIONAL_DATA (ile-de-france, auvergne-rhone-alpes, provence-alpes,
      // occitanie, nouvelle-aquitaine, hauts-de-france, grand-est,
      // pays-de-la-loire, bretagne, normandie, bourgogne-franche-comte,
      // centre-val-de-loire, corse). Priority 0.7 = enfant direct du hub
      // /aides/par-region (priority 0.75). Outre-mer exclu (CEE GUSE distinct).
      ...CEE_REGIONAL_SLUGS.map((regionSlug) => ({
        url: `${SITE_URL}/aides/${regionSlug}/renovation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      // Sprint O 2026-05-03 — hub time-bound calendrier aides 2026.
      // Volume estimé 1.5-3K req/mois (pic novembre-mars), zéro concurrence
      // française sur "calendrier aides rénovation 2026" (audit 2026-05-03).
      {
        url: `${SITE_URL}/aides/calendrier-2026`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint P 2026-05-03 — comparator pédagogique Anah vs MaPrimeRénov’.
      // Dissipe la confusion historique (MPR EST géré par l'Anah depuis 2020).
      // Volume "anah ou maprimerenov" 1-2K exact + 3-5K variantes /mois.
      {
        url: `${SITE_URL}/aides/anah-vs-maprimerenov`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint AI Wave Q 2026-05-03 — comparator /aides/aide-isolation-vs-credit-impot.
      // Capte la confusion historique « crédit d'impôt isolation » (CITE supprimé fin 2020)
      // en redirigeant l'intent vers les 4 dispositifs cumulables qui le remplacent
      // (MaPrimeRénov', CEE, TVA 5,5 %, éco-PTZ). Volume 800-1.5K req/mois.
      {
        url: `${SITE_URL}/aides/aide-isolation-vs-credit-impot`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // Sprint S' Phase 1 — 2026-05-03 — Hub Rénovation Énergétique → Travaux → PAC.
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "pompe a chaleur prix"        → 1 607 vol, KD 2, CPC $1,10
      //   - "prix pompe a chaleur air eau" → 2 263 vol, KD 1, CPC $1,20
      // Easy wins KD ≤ 2, intent commercial fort. Famille cumulée ~4 500 vol/mois.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/pompe-a-chaleur`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Sprint S' Phase 2 — 2026-05-03 — Hub Rénovation Énergétique → Passoires thermiques.
      // KW pivot Ahrefs API live (snapshot 2026-05-03) :
      //   - "passoire thermique" → 2 959 vol, KD 1, CPC $0,08
      //   - Famille cumulée (passoire energetique/location/vente/loi/2025) ~3 500 vol/mois
      // Easy win KD 1, intent informationnel pur. Audit du 19/04 surévaluait à 8K vol KD 30.
      {
        url: `${SITE_URL}/renovation-energetique/passoires-thermiques`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Sprint S' Phase 3 — 2026-05-03 — Hub Rénovation Énergétique → Diagnostic.
      // KW pivot Ahrefs API live (snapshot 2026-05-03) :
      //   - "audit energetique"      → 1 831 vol, KD 38, CPC $0,90
      //   - Variants "audit energetique maison" 840, "audit thermique" 108, "audit prix" 100
      //   - Famille cumulée pivot ~3 200 vol/mois. Section H2 #audit-energetique-obligatoire
      //     capte la longue traîne (80 vol KD 22).
      {
        url: `${SITE_URL}/renovation-energetique/diagnostic/audit-energetique`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Sprint S — 2026-05-03 — Labels RGE Qualibat + QualiPAC.
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "qualibat" → 9 344 vol, KD 2, CPC $0,02 ⭐⭐⭐ MASSIVE EASY WIN
      //   - "qualipac" → 2 619 vol, KD 3, CPC $1,60 ⭐⭐ + intent acheteur PAC RGE
      //   - Famille cumulée pivots ~12 000 vol/mois.
      {
        url: `${SITE_URL}/rge/labels/qualibat`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/rge/labels/qualipac`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Sprint U — 2026-05-03 — Labels Qualit'EnR (Qualifelec + QualiSol + QualiBois).
      // KW pivots Ahrefs API live (snapshot 2026-05-03), tous KD 0 :
      //   - "qualifelec" → 3 379 vol, KD 0, CPC $0,50 (électriciens IRVE / SPV)
      //   - "qualisol"   → 908 vol, KD 0, CPC $9,00 (solaire thermique CESI/SSC)
      //   - "qualibois"  → 575 vol, KD 0, CPC $5,00 (poêle granulés / chaudière biomasse)
      //   - Famille cumulée +4 862 vol/mois.
      {
        url: `${SITE_URL}/rge/labels/qualifelec`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/rge/labels/qualisol`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/rge/labels/qualibois`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Sprint V — 2026-05-04 — Cluster isolation (hub + 3 sub-pages).
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "isolation thermique" → 5 747 vol, KD 11 (hub)
      //   - "isolation combles"   → 4 080 vol, KD 5 + variants 'isolation combles perdus' 2 121 KD 2
      //   - "isolation exterieure" → 678 vol, KD 4 + 'isolation par exterieur' 533 KD 2 + 'ite isolation' 502 KD 6
      //   - "isolation interieure" → 248 vol, KD 2 + 'isolation murs' 233 KD 1 + 'iti isolation' 150 KD 1
      //   - Famille cumulée Sprint V ~19 200 vol/mois adressables.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/combles`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/exterieure-ite`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/interieure`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Levier 5 ROI — 2026-05-06 — cluster `isolation toiture` cumulé ~13 670 vol/mo KD avg 1.0
      // (sarking 3 300, sous-toiture 1 800, rampants 1 000, etc.). Pivot KW "isolation toiture"
      // 5 100 vol KD 2 — quasi-libre côté V1. Ahrefs API live snapshot 2026-05-06.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/toiture`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      // Levier 6 ROI — 2026-05-06 — cluster `isolation phonique` cumulé ~13 800 vol/mo KD avg 3
      // (pivot 8 300 vol KD 7, mur 3 500 KD 0, mur mitoyen 800 KD 0, sol 700 KD 0, fenêtre 250
      // KD 15). Acoustique HORS aides énergétique. Ahrefs snapshot local 2026-05-04.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/phonique`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Levier 7 ROI — 2026-05-06 — cluster `isolation plancher bas` cumulé ~5 760 vol/mo KD avg 1.5
      // (pivot "isolation plancher bas" 1 000 KD 2, "isolation sol" 1 900, "isolation vide
      // sanitaire" 1 000, "isolation sous-sol" 900, etc.). Éligible CEE BAR-EN-103.
      // Ahrefs snapshot local 2026-05-04.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/sol`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      // Levier A — 2026-05-06 — 3 sub-pages plancher bas dédiées (densifient le hub /sol).
      // Ahrefs snapshot local 2026-05-04 country=fr.
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/sol/vide-sanitaire`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/sol/garage`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/isolation/sol/cave-plafond`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // Vague A — 2026-05-04 — Cluster aides (hub + MPR pivot + 3 sub MPR + CEE + éco-PTZ + Coup de pouce).
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "aides renovation energetique" 200 KD 63 (hub) + cumul famille
      //   - "ma prime renov" 56 980 KD 67 / "maprimerenov" 27 985 KD 64 (MPR pivot)
      //   - "maprimerenov montant" 20 KD 76 + longue traîne (montants)
      //   - "qui peut beneficier maprimerenov" longue traîne (eligibilite)
      //   - "mon accompagnateur renov" 236 KD 14 ⭐ (parcours-accompagne)
      //   - "cee" 20 831 KD 54 / "certificat economie energie" 1 000 KD 47
      //   - "eco ptz" 5 289 KD 49 / "eco pret a taux zero" 295 KD 47
      //   - "prime coup de pouce" 951 KD 47 / "coup de pouce chauffage" 1 061 KD 33 ⭐
      //   - Famille cumulée Vague A ~115 000 vol/mois adressables.
      {
        url: `${SITE_URL}/renovation-energetique/aides`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/maprimerenov-2026`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/maprimerenov-2026/montants`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/maprimerenov-2026/eligibilite`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/cee-certificats-economie-energie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/eco-ptz-pret-zero`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/aides/prime-coup-de-pouce`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        // Levier B 2026-05-06 — hub Prime CEE / Prime énergie / Prime EDF (~22K vol/mo cumulé).
        // KW pivots Ahrefs (snapshot 2026-05-04) :
        //   - "prime cee" 8 500 vol KD 8 (Effy rank #23 — striking distance)
        //   - "prime edf" 7 500 vol KD 9
        //   - "prime cee edf" 6 300 vol KD 8
        //   - "prime energie" 1 800 vol KD 12
        url: `${SITE_URL}/renovation-energetique/aides/prime-energie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      // Vague B — 2026-05-04 — Travaux compléments (hub + 2 PAC + cluster chauffage 4 + fenêtres + VMC).
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "renovation energetique" hub /travaux/
      //   - "pompe a chaleur air air" 6 404 KD 8 ⭐⭐⭐ (air-air-prix)
      //   - "geothermie" 5 556 KD 12 ⭐⭐⭐ (geothermie)
      //   - "chauffage" 17 157 KD 10 ⭐⭐⭐ (hub chauffage)
      //   - "chaudiere a condensation" 794 KD 1 ⭐⭐ (chaudiere-condensation)
      //   - "poele a granules" 380 KD 16 (poele-granules)
      //   - "chauffe eau thermodynamique" 28 512 KD 3 ⭐⭐⭐⭐ MEGA (CET)
      //   - "double vitrage" 4 636 KD 1 / "fenetre double vitrage" 1 937 KD 4 ⭐⭐
      //   - "vmc double flux" 13 374 KD 2 ⭐⭐⭐⭐ MEGA (VMC)
      //   - Famille cumulée Vague B ~80 000 vol/mois adressables.
      {
        url: `${SITE_URL}/renovation-energetique/travaux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/pompe-a-chaleur/air-air-prix`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/pompe-a-chaleur/geothermie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        // Levier C 2026-05-06 — sous-page entretien PAC (~1 700 vol/mo cumulé).
        // KW pivots Ahrefs gap CSV (snapshot 2026-04) :
        //   - "prix entretien pompe a chaleur"        500 vol KD 1 (Travaux #9)
        //   - "tarif entretien PAC air-eau"           400 vol KD 0
        //   - "entretien pompe a chaleur autour moi"  400 vol KD 0
        //   - "contrat entretien PAC"                 ~250 vol estimé
        url: `${SITE_URL}/renovation-energetique/travaux/pompe-a-chaleur/entretien`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage/chaudiere-condensation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage/poele-granules`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.75,
      },
      // Levier 4 ROI (2026-05-06) — sub-page niche cluster Poêle granulés.
      // KW pivot "poele a granules sans electricite" 90 vol KD 0 — easy win extrême.
      // Contenu YMYL : 4 solutions (gravitaire / hybride / onduleur / bûches).
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage/poele-granules/sans-electricite`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage/chauffe-eau-thermodynamique`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      // Levier 3 ROI (2026-05-06) — chaudière biomasse Qualibois.
      // Cluster bois ~4 250 vol/mo cumulé KD avg 1.5 (Ahrefs API live).
      // Pivot "chaudiere a bois" 1 200 KD 1 + "chaudiere biomasse" 900 KD 1.
      // Supply DB live : 4 171 Qualibois actifs (snapshot 2026-05-06).
      {
        url: `${SITE_URL}/renovation-energetique/travaux/chauffage/chaudiere-bois`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/fenetres-double-vitrage`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/vmc-double-flux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      // Vague 1 cluster VMC (2026-05-04) — Bloc 1 Ahrefs : 215 KW, vol 127 800/mo, KD moyen 0.7.
      // Hub VMC + 3 sub-pages (simple flux 15K vol KD 2, hygro 14K KD 1, installation 1.2K KD 0).
      // Cf. docs/STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED-2026-05-04.md
      {
        url: `${SITE_URL}/renovation-energetique/travaux/vmc`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.92,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/vmc/simple-flux`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/vmc/hygroreglable`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/renovation-energetique/travaux/vmc/installation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      // Vague 2 V2 fused (2026-05-06) — Hub Solaire PV pillar, cible "panneau solaire prix" 6 300 KD 25.
      // Source : STRATEGIE-RENOVATION-ENERGETIQUE-V2-FUSED — orphelin solaire-pv (3 985 QualiPV supply).
      {
        url: `${SITE_URL}/renovation-energetique/travaux/solaire`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.92,
      },
      {
        // Levier E 2026-05-06 — sub-page nettoyage panneau solaire (~4 700 vol/mo cumulé).
        // KW pivots Ahrefs Bloc 1 v3 (snapshot 2026-05-04) :
        //   - "nettoyage panneau solaire"   3 300 vol KD 3 ⭐⭐⭐
        //   - "comment nettoyer panneau s." ~600 vol estimé KD 1
        //   - "prix nettoyage panneau s."   ~400 vol estimé KD 2
        //   - "nettoyage panneau photovolt" ~250 vol estimé
        //   - "nettoyer panneau solaire drone" ~150 vol estimé (niche)
        url: `${SITE_URL}/renovation-energetique/travaux/solaire/nettoyage`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Vague F (40/40) — 2026-05-04 — Hub menuiseries extérieures (clôture audit STRATEGIE).
      // KW pivots Ahrefs API live (snapshot 2026-05-04) :
      //   - "menuiserie exterieure" 200 KD 0 + "porte fenetre prix" 200 KD 2
      //   - "remplacement menuiserie" 150 + "menuiserie alu prix" 100 + "porte entree prix" 80 KD 2
      //   - "menuiserie pvc prix" 70 KD 5 + "menuiserie bois prix" 20 KD 0
      //   - Famille cumulée pivot ~820 vol/mois (KD moyen 1-2)
      //   - Anti-cannibalisation : /fenetres-double-vitrage/ = focus vitrage seul, ce hub = matériaux + types + portes
      {
        url: `${SITE_URL}/renovation-energetique/travaux/menuiseries`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.85,
      },
      {
        // Levier D 2026-05-06 — sous-page fenêtre de toit / Velux (~5 700 vol/mo cumulé).
        // KW pivots Ahrefs gap CSV (snapshot 2026-04) :
        //   - "prix velux"  1 700 vol KD 1 (Travaux #8)
        //   - "velux prix"  1 600 vol KD 2 (Travaux #9)
        //   - "pose velux"  1 200 vol KD 1
        //   - "velux pvc"     600 vol KD 1
        //   - "fenetre de toit" ~600 vol estimé
        url: `${SITE_URL}/renovation-energetique/travaux/menuiseries/fenetre-de-toit`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Vague C — 2026-05-04 — Cluster diagnostic (hub + DPE + thermographie).
      // KW pivots Ahrefs API live (snapshot 2026-05-03) :
      //   - "diagnostic energetique" 855 KD 53 (hub)
      //   - "dpe" 93 963 KD 55 + "dpe location" 6 798 KD 2 ⭐⭐⭐⭐ + "dpe immobilier" 1 585 KD 40
      //   - "thermographie" 1 037 KD 0 ⭐⭐ + "thermographie infrarouge" 360 KD 0
      //   - /audit-energetique/ déjà présent (Sprint S' Phase 3)
      //   - Famille cumulée Vague C ~107 000 vol/mois adressables.
      //   - Drift slug `audit-energetique-obligatoire` → 301 vers `audit-energetique` (next.config.js)
      {
        url: `${SITE_URL}/renovation-energetique/diagnostic`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/renovation-energetique/diagnostic/dpe`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.95,
      },
      {
        url: `${SITE_URL}/renovation-energetique/diagnostic/thermographie`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Vague D — 2026-05-04 — Sub-pages Passoires thermiques.
      // KW pivot Ahrefs API live (snapshot 2026-05-04) :
      //   - /interdiction-location-g-f/ : "dpe interdiction location" 350 KD 3 + "interdiction location dpe f" 300 KD 0
      //     + "passoire thermique location" 250 KD 6 + "interdiction location dpe g" 150 KD 1
      //     + "interdiction location passoire thermique" 100 KD 0 — famille cumulée ~1 150 vol/mois (KD 0-6 easy win)
      //   - /calendrier-2025-2028-2034/ : "loi climat resilience" 150 KD 18 + "passoire thermique 2025" 20
      //     + "dpe 2025 location" 50 — famille ~370 vol/mois (page support timeline)
      {
        url: `${SITE_URL}/renovation-energetique/passoires-thermiques/interdiction-location-g-f`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.95,
      },
      {
        url: `${SITE_URL}/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // /simulateur-prime-cee → 301 → /simulateur-aides-renovation (next.config.js).
      // Seul le slug canonical est listé pour économiser le crawl budget.
      {
        url: `${SITE_URL}/simulateur-aides-renovation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // Sprint 4 — Action 17 : Newsletter dédiée segment 'aides-renovation'.
      // Source `aides-renovation` tracée en DB (newsletter_subscribers.source).
      {
        url: `${SITE_URL}/newsletter/aides-renovation`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      // Sprint 4 — Action 15 : Calculateur géo-localisé top 100 villes.
      // Variantes locales du simulateur racine. dynamicParams=true accepte
      // l'ISR au-delà des 100 prerendered.
      ...[...villes]
        .sort((a, b) => {
          const popA = parseInt(a.population.replace(/\s/g, ''), 10) || 0
          const popB = parseInt(b.population.replace(/\s/g, ''), 10) || 0
          return popB - popA
        })
        .slice(0, 100)
        .map((v) => ({
          url: `${SITE_URL}/simulateur-aides-renovation/${v.slug}`,
          lastModified: STATIC_DATE,
          changeFrequency: 'monthly' as const,
          priority: 0.65,
        })),
      // Sprint 4 — Action 16 : Carte artisans RGE par région métropolitaine.
      // 13 régions (outre-mer exclu, dispositif CEE GUSE distinct).
      ...CEE_REGIONAL_SLUGS.map((regionSlug) => ({
        url: `${SITE_URL}/carte-artisans-rge/${regionSlug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
      // Sprint 4 — Action 18 : Page partenariat B2B Mon Accompagnateur Rénov'.
      // Cible outreach réseau MAR ANAH (~800 agréés). Pas de KW grand public,
      // intent professionnel pure (lead-gen partenariat).
      {
        url: `${SITE_URL}/partenaires/mon-accompagnateur-renov`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.55,
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
      // /presse rendu indexable 2026-04-30 — RP outreach pré-SIRET
      {
        url: `${SITE_URL}/presse`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly',
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
      // Hub /diagnostic — Action #8 sub-step 8.3 (DPE + audit + classes A→G).
      {
        url: `${SITE_URL}/diagnostic`,
        lastModified: '2026-05-03',
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      // Hub /travaux — Action #8 sub-step 8.4 (entreprise rénovation, métiers, refaire toiture).
      {
        url: `${SITE_URL}/travaux`,
        lastModified: '2026-05-03',
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      // Sprint 0.4 — Open data backbone (CC-BY 4.0 → backlinks DR 92 data.gouv.fr).
      {
        url: `${SITE_URL}/open-data`,
        lastModified: '2026-04-29',
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/datasets`,
        lastModified: '2026-05-03',
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/datasets/rge`,
        lastModified: '2026-04-29',
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/datasets/cee-regional-aids`,
        lastModified: '2026-05-03',
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
      'isolation-ite-iti-rge-aides-2026',
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

    // Sprint 3 vague 4 (2026-05-04) — long-tail Bloc 3 (matching-terms 7 seeds
    // critiques, 532 KW source CSV). Pre-render cap 50 + ISR pour le reste.
    // Sitemap expose les top 50 KW (vol≥200 → robots index). Filtre vol>=200
    // miroite la condition `robots.index = kw.volume >= 200` dans
    // generateMetadata pour ne pas exposer de pages noindex.
    const longTailKw = getTopLongTailKeywords(50).filter((k) => k.volume >= 200)
    const longTailPages: MetadataRoute.Sitemap = longTailKw.map((k) => ({
      url: `${SITE_URL}/guides/long-tail/${k.slug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.45,
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

    // "Autour de moi" — 8 high-volume services RGE-éligibles avec UX
    // géolocalisation navigateur, lié aux 30 top villes FR. Pilier 3.C
    // de la stratégie CEO. Pivot full RGE 2026-05-03 : retiré serrurier
    // et carreleur (commodity hors RGE).
    const AROUND_ME_SERVICES = [
      'plombier',
      'electricien',
      'chauffagiste',
      'peintre-en-batiment',
      'menuisier',
      'macon',
      'couvreur',
      'pompe-a-chaleur',
    ] as const
    const aroundMePages: MetadataRoute.Sitemap = AROUND_ME_SERVICES.map((slug) => ({
      url: `${SITE_URL}/services/${slug}/autour-de-moi`,
      lastModified: byService.get(slug) || STATIC_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Pivot full RGE 2026-05-03 (revert partiel) : on émet /urgence/{slug}
    // uniquement pour les trades qu'un artisan RGE peut prendre (plombier,
    // chauffagiste, electricien, couvreur, climaticien). Les autres restent
    // noindex via metadata page-level (cf. URGENCE_RGE_COMPATIBLE_SLUGS).
    const urgencePages: MetadataRoute.Sitemap = Object.keys(tradeContent)
      .filter((slug) => isUrgenceRgeCompatible(slug))
      .map((slug) => ({
        url: `${SITE_URL}/urgence/${slug}`,
        lastModified: byService.get(slug) || STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))

    const tarifsPages: MetadataRoute.Sitemap = Object.keys(tradeContent)
      .filter((slug) => !isRemovedByRgePivot(slug))
      .map((slug) => ({
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
      ...longTailPages,
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

    const { byDeptServiceSlug, qualifiedCombos, deptServiceFallbackCombos } = await getLastmodData()

    const allUrls: MetadataRoute.Sitemap = []
    for (const service of services) {
      // Phase A V2 #6 stratégie 140K — priority tiered (A=0.9, B=0.7, C=0.4).
      // Signal Google soft : Tier A recrawlé ×2, Tier C ×0.5 — sans rien couper.
      const priority = getServiceCityPriority(service.slug)
      for (const ville of mergedCities) {
        // Phase B (vague α nettoyage 2026-05-02, ON par défaut) : combos hors
        // allocation tiered exclus du sitemap (~68K → ~33K URLs).
        // Rollback urgence : `SA_DISABLE_SERVICES_TIERED=1`.
        if (!isServiceVilleIndexable(service.slug, ville.slug)) continue
        // lastmod from latest provider activity in dept×service.
        // If no data → omitted (honest).
        const deptKey = `${normalizeName(ville.departement)}::${service.slug}`
        const lastmod = byDeptServiceSlug.get(deptKey)
        // Sprint A #6 PhB (2026-05-03) — drift sitemap↔noindex aligné. La page
        // applique `robots:noindex` quand `providerCount === 0 && !hasFallbackDept`
        // (cf. services/[s]/[location]/page.tsx). Le sitemap doit appliquer la
        // même règle pour ne pas exposer d'URL noindex à Google (gaspille budget
        // crawl). Seuils alignés avec la page :
        //   - `qualifiedCombos.has(...)` = ≥1 provider local (specialty + city match)
        //   - `deptServiceFallbackCombos.has(...)` = ≥3 providers dept (cf. DEPT_FALLBACK_INDEX_THRESHOLD)
        // Fail-open : si une des deux sources est `null` (DB blip), on inclut
        // l'URL — identique au comportement page (providerCount default = 1).
        if (qualifiedCombos !== null && deptServiceFallbackCombos !== null) {
          const hasLocalProviders = qualifiedCombos.has(`${service.slug}::${ville.slug}`)
          const hasDeptFallback = deptServiceFallbackCombos.has(deptKey)
          if (!hasLocalProviders && !hasDeptFallback) continue
        }
        allUrls.push({
          url: `${SITE_URL}/services/${service.slug}/${ville.slug}`,
          lastModified: lastmod,
          changeFrequency: 'monthly',
          priority,
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
  // Pivot full RGE 2026-05-03 : filter out 4 commodity slugs.
  if (id === 'devis-services') {
    return Object.keys(tradeContent)
      .filter((slug) => !isRemovedByRgePivot(slug))
      .map((slug) => ({
        url: `${SITE_URL}/devis/${slug}`,
        lastModified: STATIC_DATE,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
  }

  // ── Devis service×city pages — REMOVED 2026-04-29 (V1 #2 stratégie 140K) ──
  // 104 282 URLs /devis/[s]/[v] redirigées 301 → /services/[s]/[v] via
  // next.config.js redirects(). Intention 100 % dupliquée (similarité 50.9 %),
  // CTA devis déjà sur /services. PageRank transmis à la cible canonique.

  // ── Urgence service×city pages — all combos, priority boost for qualified ─
  if (id.startsWith('urgence-service-cities-')) {
    // Stratégie 140K V2 #4 (2026-04-29) : sitemap réduit aux combos whitelistés
    // (4 services urgence × 25 villes top démographie = 100 URLs). Le reste
    // est redirigé 301 vers /services/[s]/[v] au niveau page (cf.
    // src/lib/seo/urgence-whitelist.ts).
    //
    // Pivot full RGE 2026-05-03 (revert partiel) : double gate avec
    // `isUrgenceRgeCompatible` — n'émet que les services qu'un artisan RGE
    // peut prendre (plombier, chauffagiste, electricien, couvreur, climaticien).
    //
    // On itère sur la whitelist directement plutôt que de parcourir tous les
    // combos puis filtrer — économise des cycles à chaque build sitemap.
    const { URGENCE_INDEXED_SERVICES, URGENCE_INDEXED_CITIES } =
      await import('@/lib/seo/urgence-whitelist')
    const { byDeptServiceSlug } = await getLastmodData()

    // Convert villeSlug → ville object pour récupérer le département (lastmod).
    const villeBySlug = new Map(villes.map((v) => [v.slug, v]))

    const result: MetadataRoute.Sitemap = []
    const services = Array.from(URGENCE_INDEXED_SERVICES).filter(isUrgenceRgeCompatible)
    const cities = Array.from(URGENCE_INDEXED_CITIES)
    for (const svc of services) {
      for (const villeSlug of cities) {
        const v = villeBySlug.get(villeSlug)
        if (!v) continue // Slug introuvable dans france.ts → skip silencieux
        const deptKey = `${normalizeName(v.departement)}::${svc}`
        result.push({
          url: `${SITE_URL}/urgence/${svc}/${villeSlug}`,
          lastModified: byDeptServiceSlug.get(deptKey),
          changeFrequency: 'weekly', // urgence = freshness signal renforcé
          priority: 0.7,
        })
      }
    }

    // Le batchIndex reste accepté pour compatibilité sitemap-index, mais
    // toutes les URLs tiennent dans un seul shard (≤100). Les batches >0
    // retournent un sitemap vide (Next 14 accepte, Google ignore).
    const batchIndex = parseInt(id.replace('urgence-service-cities-', ''), 10)
    return batchIndex === 0 ? result : []
  }

  // ── Tarifs service×city pages — REMOVED 2026-04-29 (V1 #3 stratégie 140K) ──
  // 104 282 URLs /tarifs/[s]/[v] redirigées 301 → /services/[s]/[v]#tarifs
  // via next.config.js redirects(). PriceTableHTML + StructuredPricingTable
  // injectés dans /services/[s]/[location]/_components/SeoContent.tsx pour
  // préserver les Featured Snippets Google sur le contenu prix.

  // ── Tarifs task×city pages — DELETED 2026-04-29 (stratégie 140K vague 1) ──
  // 184 500 URLs supprimées via DELETE 410. Voir evaluateGonePath()
  // dans src/lib/seo/gone-paths.ts + docs/strategy-140k-2026-04-29.md.
  // Le route file /tarifs/[s]/[v]/[travail]/page.tsx a été retiré du repo.

  // ── Tarifs task×city WHITELIST GSC G3 ─────────────────────────────────
  // Shard supprimé 2026-04-30 : les 100 URLs whitelistées sont 301-redirigées
  // par le middleware vers /services/[s]/[v]#tarifs. On n'inclut pas de
  // redirect dans le sitemap (signal contradictoire à Google).

  // ── Avis service hub pages ──────────────────────────────────────────
  if (id === 'avis-services') {
    const { reviewByService } = await getLastmodData()
    // Pivot full RGE 2026-05-03 : filter out 4 commodity slugs.
    const tradeSlugs = Object.keys(tradeContent).filter((slug) => !isRemovedByRgePivot(slug))
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
      // Vague ε nettoyage 2026-05-02 : on n'émet que les hubs /avis/[s] qui
      // ont au moins 1 avis (reviewByService.has = ≥1 avis publié pour ce
      // service). Sans avis, la page hub n'a rien à afficher → thin content
      // donc noindex en sitemap pour économiser le budget crawl.
      // Fail-open si reviewByService est vide (DB blip).
      ...tradeSlugs
        .filter((slug) => reviewByService.size === 0 || reviewByService.has(slug))
        .map((slug) => ({
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
  // ── Avis service×city pages — REMOVED 2026-04-29 (V1 #5 stratégie 140K) ──
  // 23 500 URLs /avis/[s]/[v] retirées du sitemap (les pages restent
  // accessibles mais noindex tant que <3 avis). Auto re-add via futur shard
  // `avis-qualified-cities-*` filtré DB quand le flywheel d'invitations
  // (cron /api/cron/send-review-invitations) produit ≥3 avis sur le combo.

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

  // ── Problemes × city pages (V2 #7 stratégie 140K) ─────────────
  // Whitelist tiered : haute=200, moyenne=100, basse=50 villes / problème.
  // ≈ 7 000 URLs total → 1 seul shard (problemes-cities-0). Hors whitelist :
  // 301 → /services/[primaryService]/[ville] (cf. problemes-whitelist.ts).
  if (id.startsWith('problemes-cities-')) {
    const batchIndex = parseInt(id.replace('problemes-cities-', ''))
    const problemSlugs = getProblemSlugs()
    const combos = getIndexableProblemeCombos(problemSlugs)
    const result: MetadataRoute.Sitemap = combos.map(({ problemSlug, villeSlug }) => ({
      url: `${SITE_URL}/problemes/${problemSlug}/${villeSlug}`,
      changeFrequency: 'monthly',
      priority: 0.4,
    }))
    return batchIndex === 0 ? result : []
  }

  // ── Aides × département (V3 #3 stratégie 140K) ──────────────────────
  // Vague 2 #11 nettoyage 2026-05-02 : whitelist top 30 dépts × 5 aides
  // transactionnelles = 150 URLs (-87 % vs 1 111 avant). Templates dept-aide
  // sans data locale = thin content. Le reste reste accessible mais drop sitemap.
  // MaPrimeRénov par dept émis dans le shard 'static' (legacy, hors scope).
  if (id === 'aides-dept') {
    const { AIDES_INDEXED_DEPTS, AIDES_INDEXED_SLUGS } =
      await import('@/lib/seo/aides-dept-whitelist')
    const result: MetadataRoute.Sitemap = []
    for (const aideSlug of Array.from(AIDES_INDEXED_SLUGS)) {
      for (const deptSlug of Array.from(AIDES_INDEXED_DEPTS)) {
        result.push({
          url: `${SITE_URL}/aides/${deptSlug}/${aideSlug}`,
          lastModified: '2026-05-02',
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }
    return result
  }

  // Sprint AI Wave H 2026-05-03 — Hub /aides/[dept] (30 URLs).
  // Priorité 0.75 supérieure aux pages dept × aide (0.7) car cette page est
  // le PARENT canonical du cluster /aides/[dept]/* (PageRank flow descendant).
  if (id === 'aides-dept-hub') {
    const { getAllAidesDeptHubSlugs } = await import('@/lib/aides/dept-hub-data')
    return getAllAidesDeptHubSlugs().map((deptSlug) => ({
      url: `${SITE_URL}/aides/${deptSlug}`,
      lastModified: STATIC_DATE,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  }

  // ── Communes hub (V3 #1 stratégie 140K) ─────────────────────────────
  if (id === 'communes') {
    return [
      {
        url: `${SITE_URL}/communes`,
        lastModified: STATIC_DATE,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ]
  }

  // ── Communes long-tail pages (V3 #1 stratégie 140K) ─────────────────
  // 35 999 communes INSEE actives / STATIC_BATCH 8 000 = 5 shards.
  // Slugs fetchés depuis Supabase au build/ISR (`getAllCommuneSlugs`),
  // graceful fallback sur shard vide si DB indisponible.
  // Les communes dont le slug = ville statique seront 301 par la page handler
  // — on les inclut quand même au sitemap pour signaler le canonical à Google.
  if (id.startsWith('communes-cities-')) {
    const batchIndex = parseInt(id.replace('communes-cities-', ''), 10)
    const BATCH = STATIC_BATCH
    const slugs = await getAllCommuneSlugs()
    const start = batchIndex * BATCH
    const slice = slugs.slice(start, start + BATCH)
    return slice.map((slug) => ({
      url: `${SITE_URL}/communes/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  }

  // ── Dept × service pages ────────────────────────────────────────────
  if (id.startsWith('dept-services-')) {
    const { byDeptService } = await getLastmodData()
    const batchIndex = parseInt(id.replace('dept-services-', ''))
    // Pivot full RGE 2026-05-03 : filter out 4 commodity slugs.
    const tradeSlugs = getTradesSlugs().filter((slug) => !isRemovedByRgePivot(slug))
    const allUrls: MetadataRoute.Sitemap = []
    for (const dept of departements) {
      for (const service of tradeSlugs) {
        // Vague δ nettoyage 2026-05-02 : on n'émet que les combos avec ≥1
        // provider (lastmod défini = ≥1 provider sur ce dept×service).
        // Sans provider, la page est thin par construction (juste template +
        // commune stats). byDeptService = empty Map sur DB blip → fail-open.
        const key = `${normalizeName(dept.name)}::${service}`
        const lastmod = byDeptService.get(key)
        if (byDeptService.size > 0 && !lastmod) continue
        allUrls.push({
          url: `${SITE_URL}/departements/${dept.slug}/${service}`,
          lastModified: lastmod,
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
    // Pivot full RGE 2026-05-03 : filter out 4 commodity slugs.
    const barometreMetiers: MetadataRoute.Sitemap = getTradesSlugs()
      .filter((slug) => !isRemovedByRgePivot(slug))
      .map((slug) => ({
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
    // Pivot full RGE 2026-05-03 : filter out 4 commodity slugs.
    const tradeSlugs = getTradesSlugs().filter((slug) => !isRemovedByRgePivot(slug))
    return regions.flatMap((region) =>
      tradeSlugs
        .map((service) => {
          const key = `${normalizeName(region.name)}::${service}`
          return { service, key, lastmod: byRegionService.get(key) }
        })
        // Vague δ' nettoyage 2026-05-02 : skip combo region×service sans
        // provider (lastmod undefined). Fail-open si Map vide (DB blip).
        .filter(({ lastmod }) => byRegionService.size === 0 || lastmod !== undefined)
        .map(({ service, lastmod }) => ({
          url: `${SITE_URL}/regions/${region.slug}/${service}`,
          lastModified: lastmod,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        }))
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
  // 19 URLs — une par métier énergétique couvert par la mention RGE
  // (14 historiques + 5 élargissement 2026-05-02 : borne-recharge,
  //  chauffe-eau-thermodynamique, audit-energetique, ventilation, fenetres).
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
  // 19 services énergétiques × 500 villes = 9 500 URLs max
  // (14 historiques + 5 élargissement 2026-05-02).
  //
  // 2026-04-30 historique : fail-open systématique car fetcher trop strict
  // (143 URLs émises sur 7000 attendues). Cause racine : mapping
  // `SERVICE_TO_SPECIALTIES` trop fin — un artisan `specialty='chauffagiste'`
  // avec qualif RGE QualiPAC n'était pas matché vers /rge/pompe-a-chaleur.
  //
  // 2026-05-03 (Action #3 Sprint B sub-step 2) : fetcher refactoré (utilise
  // `getRgeServicesFromQualifications` + multi-format dept lookup). Probe live
  // : 1 790 city combos (18.8%) + 1 794 dept combos (93.5%). On réactive le
  // filtrage avec règle "city OR dept" — la page applique exactement cette
  // logique : `isNoindex = countStrict === 0 && !hasDeptFallback` (rge/[s]/[v]
  // page.tsx:162). Le seuil dept est ≥1 (pas ≥3 comme /services/[s]/[v]) car
  // RGE est rare-supply (50K artisans sur 970K).
  //
  // Fail-open : si fetcher retourne null (DB blip), on inclut tout — identique
  // au comportement page (countStrict.ok === false → fail-open).
  if (id === 'rge-service-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CITY_COUNT_TIER2)
    const { rgeLastmodServiceCity, rgeQualifiedServiceCity, rgeQualifiedServiceDept } =
      await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    // Narrow once to non-null Sets so we can use them directly in the loop
    // without `!` non-null assertions (eslint @typescript-eslint/no-non-null-assertion).
    const cityCombos = rgeQualifiedServiceCity
    const deptCombos = rgeQualifiedServiceDept
    const filterActive = cityCombos !== null && deptCombos !== null
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const ville of phase1Cities) {
        const key = `${svc}::${ville.slug}`
        if (filterActive && cityCombos !== null && deptCombos !== null) {
          const hasLocal = cityCombos.has(key)
          // Fallback dept : on convertit le nom dept FR en slug (normalizeName
          // produit le même format que dept.slug, ex: "Bas-Rhin" → "bas-rhin").
          const deptSlug = normalizeName(ville.departement)
          const hasDept = deptCombos.has(`${svc}::${deptSlug}`)
          if (!hasLocal && !hasDept) continue
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
  // 19 services énergétiques × 101 départements = 1 919 URLs max
  //
  // 2026-04-30 historique : fail-open total (1 URL sur 1 414 attendues —
  // mismatch entre code DB '69' et lookup 'rhone').
  //
  // 2026-05-03 (Action #3 Sprint B sub-step 2) : fetcher refactoré avec
  // lookup multi-format (code/nom/slug → slug). Probe live : 1 794/1 919
  // combos (93.5% coverage). Réactivation safe.
  // Fail-open si fetcher null (DB blip).
  if (id === 'rge-service-dept') {
    const { rgeLastmodServiceDept, rgeQualifiedServiceDept } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    const deptCombos = rgeQualifiedServiceDept
    for (const svc of RGE_ALLOWED_SERVICES) {
      for (const dept of departements) {
        const deptKey = normalizeName(dept.name)
        const mapKey = `${svc}::${deptKey}`
        if (deptCombos !== null && !deptCombos.has(mapKey)) continue
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
  // V3 #2 stratégie 140K (2026-04-29) : top 1 000 villes.
  // 22 opérations × 1 000 villes = 22 000 max.
  // 2026-04-30 — fail-open systématique. Audit baseline a révélé 869 URLs
  // sur 22 000 attendues, même cause racine que rge-service-city/dept :
  // mapping specialty trop fin pour identifier les artisans CEE-éligibles
  // depuis `providers.specialty` seul. La page route filtre déjà côté
  // render via `getCeeProvidersByOperationAndCity` (count=0 ⇒ noindex meta).
  if (id === 'cee-operation-city') {
    const phase1Cities = villes.slice(0, SITEMAP_CEE_CITY_COUNT)
    const { ceeLastmodOperationCity, ceeQualifiedOperationCity } = await getLastmodData()
    const result: MetadataRoute.Sitemap = []
    for (const code of CEE_OPERATION_CODES) {
      for (const ville of phase1Cities) {
        const key = `${code}::${ville.slug}`
        // Vague β nettoyage 2026-05-02 : on n'émet que les combos avec ≥1
        // artisan RGE éligible localement. ceeQualifiedOperationCity = null
        // ⇒ DB blip ⇒ fail-open (on garde tout, lastmod-queries log l'erreur).
        // Audit prod 2026-05-02 : 42% des combos ont ≥1 RGE qualifié → -58%
        // d'URLs émises (~22K → ~9K) sans toucher aux pages utiles.
        if (ceeQualifiedOperationCity && !ceeQualifiedOperationCity.has(key)) continue
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

  // ── CEE operation × région (/cee/[op]/region/[region]) ─────────────
  // Sprint AI Wave D Ahrefs 2026-05-03 — cluster ~14 régions × 19 ops.
  // Pages avec contenu différencié (zone climatique RT2012 + aides régionales
  // sourcées). Render fait noindex fail-open si 0 provider régional, mais on
  // déclare TOUTES les URLs au sitemap (Google découvre + apprend qui indexer).
  if (id === 'cee-operation-region') {
    const result: MetadataRoute.Sitemap = []
    for (const code of CEE_OPERATION_CODES) {
      for (const regionSlug of CEE_REGIONAL_SLUGS) {
        result.push({
          url: `${SITE_URL}/cee/${code}/region/${regionSlug}`,
          lastModified: STATIC_DATE,
          changeFrequency: 'monthly',
          priority: 0.55,
        })
      }
    }
    return result
  }

  // Provider sitemaps are served via /api/sitemap-providers (dynamic API route).
  // Requests to /sitemap/providers-*.xml are rewritten by next.config.js.

  return []
}
