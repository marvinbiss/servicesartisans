import Link from 'next/link'
import {
  services,
  getVilleBySlug,
  getNearbyCities,
  getVillesByDepartement,
  getDepartementByCode,
  getRegionSlugByName,
  regions,
  departements,
  getCityScore,
} from '@/lib/data/france'
import { relatedServices, getServiceWeight } from '@/lib/constants/navigation'
import { allArticles } from '@/lib/data/blog/articles'
import { getNearbyVilleSlugs, getCommuneScore } from '@/lib/data/commune-data'
import { isMoneyPage, TOP_CITIES } from '@/lib/seo/top-pages'
import { getProblemsByService } from '@/lib/data/problems'
import { getDeptPreposition, getRegionPreposition } from '@/lib/geo-strings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeepPageLinksProps {
  currentService: string // slug du service (ex: "plombier")
  currentVille?: string // slug de la ville (ex: "paris") — optionnel pour le mode hub
  currentIntent?: 'services' | 'tarifs' | 'devis' | 'avis' | 'urgence'
  skipCrossIntent?: boolean // true when CrossIntentLinks is already rendered above
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Haversine distance in km between two lat/lng points */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

/** Parse population string like '156 000' into a number */
function parsePopulation(pop: string): number {
  return parseInt(pop.replace(/\s/g, ''), 10) || 0
}

// ---------------------------------------------------------------------------
// Module 6 — Blog article mapping (hardcoded for top services)
// ---------------------------------------------------------------------------

const SERVICE_ARTICLE_MAP = new Map<string, string[]>([
  // ── 15 services historiques ──
  [
    'plombier',
    [
      'prix-plombier-2026-tarifs-horaires',
      'comment-choisir-son-plombier',
      'fuite-eau-que-faire-urgence',
    ],
  ],
  [
    'electricien',
    [
      'prix-electricien-2026-tarifs-travaux',
      'comment-choisir-electricien-guide',
      'electricite-normes-securite',
    ],
  ],
  [
    'serrurier',
    [
      'prix-serrurier-2026-tarifs-interventions',
      'comment-choisir-serrurier-conseils',
      'securiser-maison-cambriolage-solutions',
    ],
  ],
  [
    'chauffagiste',
    [
      'prix-chauffagiste-2026-installation-entretien',
      'comment-choisir-chauffagiste-guide',
      'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026',
    ],
  ],
  [
    'peintre-en-batiment',
    [
      'prix-peintre-batiment-2026-guide-complet',
      'peinture-interieure-conseils',
      'renover-facade-ravalement-guide',
    ],
  ],
  [
    'menuisier',
    [
      'prix-menuisier-2026-tarifs-travaux',
      'comment-choisir-menuisier-guide',
      'menuiseries-bois-pvc-alu-comparatif',
    ],
  ],
  [
    'carreleur',
    [
      'prix-carreleur-2026-pose-fourniture',
      'comment-choisir-carreleur-guide',
      'guide-carrelage-salle-de-bain',
    ],
  ],
  [
    'couvreur',
    [
      'prix-toiture-2026-refection-reparation-materiaux',
      'comment-choisir-couvreur-guide',
      'toiture-renovation-prix-2026',
    ],
  ],
  [
    'macon',
    [
      'prix-macon-2026-gros-oeuvre-renovation',
      'comment-choisir-macon-guide',
      'agrandir-maison-extension-guide',
    ],
  ],
  [
    'jardinier',
    [
      'prix-jardinier-paysagiste-2026',
      'comment-choisir-jardinier-paysagiste',
      'amenager-terrasse-exterieure-guide',
    ],
  ],
  [
    'vitrier',
    [
      'prix-vitrier-2026-remplacement-vitrage',
      'comment-choisir-vitrier-guide',
      'guide-fenetre-double-vitrage',
    ],
  ],
  [
    'climaticien',
    [
      'prix-climaticien-2026-installation-entretien',
      'comment-choisir-climaticien-guide',
      'climatisation-reversible-guide',
    ],
  ],
  [
    'cuisiniste',
    [
      'prix-cuisiniste-2026-pose-cuisine',
      'comment-choisir-cuisiniste-guide',
      'renover-cuisine-guide-complet-etapes',
    ],
  ],
  [
    'nettoyage',
    [
      'prix-nettoyage-professionnel-2026',
      'comment-choisir-entreprise-nettoyage',
      'entretien-annuel-maison-checklist-complete',
    ],
  ],
  // Pivot RGE 2026-05-01 : 16 entrées Tier C niche supprimées (solier,
  // terrassier, métallier, ferronnier, poseur-de-parquet, miroitier,
  // storiste, architecte-interieur, decorateur, domoticien, pisciniste,
  // antenniste, ascensoriste, geometre, desinsectisation, deratisation).
  [
    'charpentier',
    [
      'prix-toiture-2026-refection-reparation-materiaux',
      'toiture-renovation-prix-2026',
      'types-de-tuiles-guide',
    ],
  ],
  [
    'zingueur',
    [
      'comment-choisir-zingueur-guide',
      'prix-toiture-2026-refection-reparation-materiaux',
      'etancheite-toiture-terrasse-solutions',
    ],
  ],
  [
    'etancheiste',
    [
      'etancheite-toiture-terrasse-solutions',
      'humidite-moisissure-maison-solutions',
      'prix-toiture-2026-refection-reparation-materiaux',
    ],
  ],
  [
    'facadier',
    ['prix-ravalement-facade-2026', 'renover-facade-ravalement-guide', 'types-enduit-facade'],
  ],
  [
    'platrier',
    [
      'plaque-de-platre-ba13-guide',
      'prix-renovation-appartement-2026-budget',
      'renovation-maison-par-ou-commencer',
    ],
  ],
  [
    'salle-de-bain',
    [
      'renovation-salle-de-bain-budget-etapes',
      'tendances-salle-de-bain-2026',
      'prix-salle-de-bain-complete-2026',
    ],
  ],
  [
    'pompe-a-chaleur',
    [
      'prix-pompe-a-chaleur-2026',
      'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026',
      'cumul-aides-renovation-2026-tableau',
    ],
  ],
  [
    'panneaux-solaires',
    [
      'panneaux-solaires-rentabilite-2026',
      'prix-panneaux-solaires-2026',
      'installer-panneau-solaire-maison-2026',
    ],
  ],
  [
    'isolation-thermique',
    [
      'prix-isolation-thermique-2026-tarifs',
      'isolation-combles-materiaux-guide',
      'cumul-aides-renovation-2026-tableau',
    ],
  ],
  [
    'renovation-energetique',
    [
      'travaux-renovation-energetique-par-ou-commencer',
      'dpe-obligatoire-2026-guide',
      'eco-ptz-2026-conditions-montant',
    ],
  ],
  [
    'borne-recharge',
    [
      'prix-borne-recharge-domicile-2026',
      'electricite-normes-securite',
      'domotique-maison-connectee-guide-debutant',
    ],
  ],
  [
    'ramoneur',
    [
      'ramonage-obligatoire-avant-hiver',
      'entretien-chaudiere-annuel',
      'preparer-maison-hiver-checklist',
    ],
  ],
  [
    'paysagiste',
    [
      'prix-jardinier-paysagiste-2026',
      'amenager-jardin-paysagiste-guide',
      'amenagement-terrasse-exterieur-2026',
    ],
  ],
  [
    'alarme-securite',
    ['securite-alarme-maison-guide-2026', 'securiser-maison-cambriolage-solutions'],
  ],
  [
    'diagnostiqueur',
    [
      'comment-choisir-diagnostiqueur-guide',
      'dpe-obligatoire-2026-guide',
      'diagnostic-immobilier-obligatoire-liste',
    ],
  ],
  [
    'demenageur',
    [
      'comment-choisir-demenageur-guide',
      'preparer-maison-revente-travaux-rentables',
      'travaux-avant-vendre-maison-rentables',
    ],
  ],
])

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function DeepPageLinks({
  currentService,
  currentVille,
  currentIntent,
  skipCrossIntent = false,
}: DeepPageLinksProps) {
  const serviceData = services.find((s) => s.slug === currentService)
  if (!serviceData) return null

  const serviceName = serviceData.name
  const isHubMode = !currentVille
  const ville = currentVille ? getVilleBySlug(currentVille) : null

  // In city mode, ville must exist
  if (!isHubMode && !ville) return null

  const villeName = ville?.name || ''

  // Deduplication set — tracks all hrefs to prevent duplicate links across modules
  const usedHrefs = new Set<string>()

  function dedup(links: { href: string; label: string }[]): { href: string; label: string }[] {
    const result: { href: string; label: string }[] = []
    for (const link of links) {
      if (!usedHrefs.has(link.href)) {
        usedHrefs.add(link.href)
        result.push(link)
      }
    }
    return result
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 1: Villes proches — SAME SERVICE (city mode only) — SILO
  // City mode: 6 nearby cities (up from 4 — core topical silo links)
  // ═══════════════════════════════════════════════════════════════════════════
  let module1Links: { href: string; label: string }[] = []

  if (!isHubMode && currentVille) {
    const nearbyLimit = 6
    const gpsCities = await getNearbyVilleSlugs(currentVille, nearbyLimit)
    if (gpsCities && gpsCities.length > 0) {
      module1Links = gpsCities
        .map((c) => {
          const v = getVilleBySlug(c.slug)
          if (!v) return null
          return {
            href: `/services/${currentService}/${v.slug}`,
            label: `${serviceName} à ${v.name}`,
          }
        })
        .filter((x): x is { href: string; label: string } => x !== null)
    }

    // Fallback: department/region proximity (build time or no GPS data)
    // Sort by city score (population + capital bonus) for better internal linking
    // Money pages get a boost to ensure they appear more often
    if (module1Links.length === 0) {
      const nearbyCities = getNearbyCities(currentVille, nearbyLimit * 2, getCityScore)
      const sorted = nearbyCities.sort((a, b) => {
        const aIsMP = isMoneyPage(currentService, a.slug) ? 1 : 0
        const bIsMP = isMoneyPage(currentService, b.slug) ? 1 : 0
        if (aIsMP !== bIsMP) return bIsMP - aIsMP
        return getCityScore(b) - getCityScore(a)
      })
      module1Links = sorted.slice(0, nearbyLimit).map((v) => ({
        href: `/services/${currentService}/${v.slug}`,
        label: `${serviceName} à ${v.name}`,
      }))
    }
  }
  module1Links = dedup(module1Links)

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 4: Cross-intent — SAME SERVICE — SILO
  // Skipped if CrossIntentLinks is rendered above (skipCrossIntent=true)
  // City mode: all 5 intents minus current (up to 5 links for full silo coverage)
  // Hub mode: 4 non-services intents minus current
  // ═══════════════════════════════════════════════════════════════════════════
  const allIntents: {
    intent: DeepPageLinksProps['currentIntent']
    prefix: string
    label: string
  }[] = [
    { intent: 'services', prefix: 'services', label: 'Services' },
    { intent: 'tarifs', prefix: 'tarifs', label: 'Tarifs' },
    { intent: 'devis', prefix: 'devis', label: 'Devis' },
    { intent: 'avis', prefix: 'avis', label: 'Avis' },
    { intent: 'urgence', prefix: 'urgence', label: 'Urgence' },
  ]
  const filteredIntents = isHubMode
    ? allIntents.filter((i) => i.intent !== 'services' && i.intent !== currentIntent)
    : allIntents.filter((i) => i.intent !== currentIntent)
  const module4Links = skipCrossIntent
    ? []
    : dedup(
        isHubMode
          ? filteredIntents.map((i) => ({
              href: `/${i.prefix}/${currentService}`,
              label: `${i.label} ${serviceName}`,
            }))
          : filteredIntents.map((i) => ({
              href:
                i.intent === 'services'
                  ? `/services/${currentService}/${currentVille}`
                  : `/${i.prefix}/${currentService}/${currentVille}`,
              label: `${i.label} ${serviceName} à ${villeName}`,
            }))
      )

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 8 (NEW): Same service, other departments — SILO (city mode only)
  // Picks departments by proximity: same region first, then by population
  // ═══════════════════════════════════════════════════════════════════════════
  const dept = ville ? getDepartementByCode(ville.departementCode) : null
  const module8Links: { href: string; label: string }[] = []
  if (!isHubMode && ville) {
    const currentDeptCode = ville.departementCode
    const currentRegion = ville.region

    const sameRegionDepts = departements
      .filter((d) => d.region === currentRegion && d.code !== currentDeptCode)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))

    const otherRegionDepts = departements
      .filter((d) => d.region !== currentRegion && d.code !== currentDeptCode)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))

    const candidateDepts = [...sameRegionDepts, ...otherRegionDepts]
    for (const d of candidateDepts) {
      if (module8Links.length >= 3) break
      const link = {
        href: `/departements/${d.slug}/${currentService}`,
        label: `${serviceName} ${getDeptPreposition(d.name)}`,
      }
      if (!usedHrefs.has(link.href)) {
        usedHrefs.add(link.href)
        module8Links.push(link)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 7: Grandes villes de France — SAME SERVICE — SILO
  // Hub mode: all 20 TOP_CITIES (money pages); City mode: 8
  // Uses TOP_CITIES from top-pages.ts for consistency with money page strategy
  // ═══════════════════════════════════════════════════════════════════════════
  const GRANDES_VILLES = TOP_CITIES.map((c) => c.slug)

  const maxGrandesVilles = isHubMode ? 20 : 8
  const module1Slugs = new Set(module1Links.map((l) => l.href.split('/').pop() ?? ''))
  const deptSlugs = new Set(
    dept && ville ? getVillesByDepartement(ville.departementCode).map((v) => v.slug) : []
  )
  const filteredGrandesVilles = GRANDES_VILLES.filter(
    (slug) => slug !== currentVille && !module1Slugs.has(slug) && !deptSlugs.has(slug)
  )

  // Sort grandes villes by commune score (provider count + artisan density + population)
  // Money pages get a boost (+10000) to ensure they appear first
  const grandesVillesScores = await Promise.all(
    filteredGrandesVilles.map(async (slug) => ({
      slug,
      score: (await getCommuneScore(slug)) + (isMoneyPage(currentService, slug) ? 10000 : 0),
    }))
  )
  grandesVillesScores.sort((a, b) => b.score - a.score)

  const module7Links = dedup(
    grandesVillesScores
      .slice(0, maxGrandesVilles)
      .map(({ slug }) => {
        const v = getVilleBySlug(slug)
        return v
          ? { href: `/services/${currentService}/${slug}`, label: `${serviceName} à ${v.name}` }
          : null
      })
      .filter((x): x is { href: string; label: string } => x !== null)
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 2: Related services — CROSS-SILO (restricted to relatedServices)
  // City mode: cap at 3 (down from 4); Hub mode: cap at 5 (down from 8)
  // Uses relatedServices mapping first, falls back to all services only if empty
  // Money page boost preserved for fallback
  // ═══════════════════════════════════════════════════════════════════════════
  const related = relatedServices[currentService] || []
  const maxOtherServices = isHubMode ? 5 : 3

  let otherServiceSlugs: string[]
  if (related.length > 0) {
    // Use semantically related services — prioritize by weight then money pages
    if (!isHubMode && currentVille) {
      otherServiceSlugs = [...related]
        .sort((a, b) => {
          const wDiff = getServiceWeight(b) - getServiceWeight(a)
          if (wDiff !== 0) return wDiff
          const aIsMP = isMoneyPage(a, currentVille) ? 1 : 0
          const bIsMP = isMoneyPage(b, currentVille) ? 1 : 0
          return bIsMP - aIsMP
        })
        .slice(0, maxOtherServices)
    } else {
      otherServiceSlugs = [...related]
        .sort((a, b) => getServiceWeight(b) - getServiceWeight(a))
        .slice(0, maxOtherServices)
    }
  } else {
    // Fallback: pick from all services if no related mapping exists
    const otherServicesAll = services.filter((s) => s.slug !== currentService)
    otherServiceSlugs = [...otherServicesAll]
      .sort((a, b) => {
        const wDiff = getServiceWeight(b.slug) - getServiceWeight(a.slug)
        if (wDiff !== 0) return wDiff
        if (!isHubMode && currentVille) {
          const aIsMP = isMoneyPage(a.slug, currentVille) ? 1 : 0
          const bIsMP = isMoneyPage(b.slug, currentVille) ? 1 : 0
          return bIsMP - aIsMP
        }
        return 0
      })
      .slice(0, maxOtherServices)
      .map((s) => s.slug)
  }

  const module2Links = dedup(
    otherServiceSlugs
      .map((slug) => {
        const s = services.find((svc) => svc.slug === slug)
        if (!s) return null
        return isHubMode
          ? { href: `/services/${s.slug}`, label: `${s.name} en France` }
          : { href: `/services/${s.slug}/${currentVille}`, label: `${s.name} à ${villeName}` }
      })
      .filter((x): x is { href: string; label: string } => x !== null)
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 3: Dans le département — GEO (city mode only)
  // ═══════════════════════════════════════════════════════════════════════════
  const module3Links: { href: string; label: string }[] = []
  if (!isHubMode && dept && ville) {
    // CRITICAL: dept×service link is UNCONDITIONAL — forced without dedup
    const deptServiceHref = `/departements/${dept.slug}/${currentService}`
    usedHrefs.add(deptServiceHref)
    module3Links.push({
      href: deptServiceHref,
      label: `${serviceName} ${getDeptPreposition(dept.name)}`,
    })

    // Other dept links go through normal dedup
    const deptCandidates: { href: string; label: string }[] = []
    deptCandidates.push({
      href: `/departements/${dept.slug}`,
      label: `Artisans ${getDeptPreposition(dept.name)}`,
    })
    const deptCities = getVillesByDepartement(ville.departementCode)
      .filter((v) => v.slug !== currentVille)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
      .slice(0, 1)
    for (const c of deptCities) {
      deptCandidates.push({
        href: `/services/${currentService}/${c.slug}`,
        label: `${serviceName} à ${c.name}`,
      })
    }
    module3Links.push(...dedup(deptCandidates))
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 5: Hub service et région — GEO
  // ═══════════════════════════════════════════════════════════════════════════
  const module5Links: { href: string; label: string }[] = []
  if (isHubMode) {
    // In hub mode: link to service×region pages for all metro regions
    const metroRegions = regions.filter(
      (r) =>
        ![
          'guadeloupe',
          'martinique',
          'guyane',
          'la-reunion',
          'mayotte',
          'saint-barthelemy',
          'saint-martin',
          'polynesie-francaise',
          'nouvelle-caledonie',
        ].includes(r.slug)
    )
    for (const r of metroRegions.slice(0, 8)) {
      module5Links.push({
        href: `/regions/${r.slug}/${currentService}`,
        label: `${serviceName} ${getRegionPreposition(r.name)}`,
      })
    }
  } else {
    // City mode: hub service + region×service + city hub
    module5Links.push({
      href: `/services/${currentService}`,
      label: `${serviceName} en France`,
    })
    if (ville) {
      const regionSlug = getRegionSlugByName(ville.region)
      if (regionSlug) {
        module5Links.push({
          href: `/regions/${regionSlug}/${currentService}`,
          label: `${serviceName} ${getRegionPreposition(ville.region)}`,
        })
      }
    }
    // City hub link — geographic counterpart of the service hub
    if (currentVille) {
      const villeHubLink = { href: `/villes/${currentVille}`, label: `Artisans à ${villeName}` }
      if (!usedHrefs.has(villeHubLink.href)) {
        usedHrefs.add(villeHubLink.href)
        module5Links.push(villeHubLink)
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 6: Guides et articles — EDITORIAL
  // ═══════════════════════════════════════════════════════════════════════════
  const articleSlugs = SERVICE_ARTICLE_MAP.get(currentService) || []
  const module6Candidates: { href: string; label: string }[] = []
  const maxArticles = isHubMode ? 3 : 1
  for (const slug of articleSlugs) {
    if (module6Candidates.length >= maxArticles) break
    const article = allArticles[slug]
    if (article) {
      module6Candidates.push({
        href: `/blog/${slug}`,
        label: article.title,
      })
    }
  }
  const module6Links = dedup(module6Candidates)

  // ═══════════════════════════════════════════════════════════════════════════
  // MODULE 9: Problèmes courants — TOPICAL (same service problems)
  // Links to /problemes/[problem-slug]/[city] (city mode) or /problemes/[problem-slug] (hub mode)
  // Picks 2-3 most relevant problems for the current service
  // ═══════════════════════════════════════════════════════════════════════════
  const serviceProblems = getProblemsByService(currentService)
  const maxProblems = 3
  const module9Candidates: { href: string; label: string }[] = []

  // Prioritize problems where this service is the primaryService, then relatedServices
  const sortedProblems = [...serviceProblems].sort((a, b) => {
    const aIsPrimary = a.primaryService === currentService ? 1 : 0
    const bIsPrimary = b.primaryService === currentService ? 1 : 0
    if (aIsPrimary !== bIsPrimary) return bIsPrimary - aIsPrimary
    // Secondary sort: haute urgency first (more likely searched)
    const urgencyOrder = { haute: 3, moyenne: 2, basse: 1 }
    return (urgencyOrder[b.urgencyLevel] || 0) - (urgencyOrder[a.urgencyLevel] || 0)
  })

  for (const problem of sortedProblems) {
    if (module9Candidates.length >= maxProblems) break
    const href = isHubMode
      ? `/problemes/${problem.slug}`
      : `/problemes/${problem.slug}/${currentVille}`
    const label = isHubMode ? problem.name : `${problem.name} à ${villeName}`
    module9Candidates.push({ href, label })
  }
  const module9Links = dedup(module9Candidates)

  // ═══════════════════════════════════════════════════════════════════════════
  // Build modules array — ordered for topical silo priority
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Nearby cities (same service) — SILO
  // 2. Cross-intent same service — SILO
  // 3. Same service other departments — SILO (new)
  // 4. Great cities same service — SILO
  // 5. Related services (restricted) — CROSS-SILO
  // 6. Department links — GEO
  // 7. Hub + region — GEO
  // 8. Blog articles — EDITORIAL
  const modules: { title: string; links: { href: string; label: string }[] }[] = []

  if (module1Links.length > 0) {
    modules.push({ title: `${serviceName} à proximité de ${villeName}`, links: module1Links })
  }
  if (module4Links.length > 0) {
    modules.push({
      title: isHubMode ? `Tarifs, devis et avis ${serviceName.toLowerCase()}` : 'Voir aussi',
      links: module4Links,
    })
  }
  if (module8Links.length > 0) {
    modules.push({ title: `${serviceName} dans d'autres départements`, links: module8Links })
  }
  if (module7Links.length > 0) {
    modules.push({ title: `${serviceName} dans les grandes villes`, links: module7Links })
  }
  if (module2Links.length > 0) {
    modules.push({
      title: isHubMode ? 'Services artisans similaires' : `Autres artisans à ${villeName}`,
      links: module2Links,
    })
  }
  if (module3Links.length > 0 && dept) {
    modules.push({ title: `${serviceName} ${getDeptPreposition(dept.name)}`, links: module3Links })
  }
  if (module5Links.length > 0) {
    modules.push({
      title: isHubMode ? `${serviceName} par région` : 'Hub service et région',
      links: module5Links,
    })
  }
  if (module6Links.length > 0) {
    modules.push({ title: 'Guides et articles', links: module6Links })
  }
  if (module9Links.length > 0) {
    modules.push({
      title: isHubMode ? 'Problèmes courants' : `Problèmes courants à ${villeName}`,
      links: module9Links,
    })
  }

  if (modules.length === 0) return null

  return (
    <aside className="py-10 border-t border-charcoal-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <section key={mod.title}>
              <h3 className="text-sm font-semibold text-stone-800 mb-3">{mod.title}</h3>
              <div className="flex flex-wrap gap-2">
                {mod.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm text-stone-600 bg-sand-200 hover:bg-clay-100 hover:text-clay-600 rounded-full transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  )
}
