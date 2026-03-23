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
import { relatedServices } from '@/lib/constants/navigation'
import { allArticles } from '@/lib/data/blog/articles'
import { getNearbyVilleSlugs, getCommuneScore } from '@/lib/data/commune-data'
import { isMoneyPage, TOP_CITIES } from '@/lib/seo/top-pages'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeepPageLinksProps {
  currentService: string   // slug du service (ex: "plombier")
  currentVille?: string    // slug de la ville (ex: "paris") — optionnel pour le mode hub
  currentIntent?: 'services' | 'tarifs' | 'devis' | 'avis' | 'urgence'
  skipCrossIntent?: boolean // true when CrossIntentLinks is already rendered above
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Haversine distance in km between two lat/lng points */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
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
  ['plombier', ['prix-plombier-2025', 'comment-choisir-plombier', 'fuite-eau-urgence']],
  ['electricien', ['prix-electricien-2025', 'mise-aux-normes-electriques', 'renovation-electrique-guide']],
  ['serrurier', ['prix-serrurier-2025', 'changer-serrure-guide', 'porte-blindee-guide']],
  ['chauffagiste', ['prix-chauffagiste-2025', 'entretien-chaudiere-guide', 'pompe-chaleur-guide-complet']],
  ['peintre-en-batiment', ['prix-peintre-2025', 'peinture-interieure-guide', 'ravalement-facade-guide']],
  ['menuisier', ['prix-menuisier-2025', 'fenetre-bois-alu-pvc', 'renovation-menuiserie-guide']],
  ['carreleur', ['prix-carreleur-2025', 'carrelage-salle-de-bain-guide', 'pose-carrelage-guide']],
  ['couvreur', ['prix-couvreur-2025', 'renovation-toiture-guide', 'demoussage-toiture-guide']],
  ['macon', ['prix-macon-2025', 'extension-maison-guide', 'mur-porteur-guide']],
  ['jardinier', ['prix-jardinier-2025', 'entretien-jardin-guide', 'amenagement-exterieur-guide']],
  ['climaticien', ['prix-climatisation-2025', 'climatisation-reversible-guide', 'entretien-climatisation']],
  ['cuisiniste', ['prix-cuisine-equipee-2025', 'renovation-cuisine-guide', 'plan-travail-guide']],
  ['vitrier', ['prix-vitrier-2025', 'double-vitrage-guide', 'remplacement-vitre-guide']],
  ['pompe-a-chaleur', ['pompe-chaleur-guide-complet', 'prix-pompe-chaleur-2025', 'aides-renovation-energetique']],
  ['panneaux-solaires', ['panneaux-solaires-guide-complet', 'prix-panneaux-solaires-2025', 'autoconsommation-guide']],
  ['isolation-thermique', ['isolation-thermique-guide', 'prix-isolation-2025', 'aides-renovation-energetique']],
  ['renovation-energetique', ['aides-renovation-energetique', 'dpe-guide-complet', 'renovation-energetique-etapes']],
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
  const serviceData = services.find(s => s.slug === currentService)
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
        .map(c => {
          const v = getVilleBySlug(c.slug)
          if (!v) return null
          return { href: `/services/${currentService}/${v.slug}`, label: `${serviceName} à ${v.name}` }
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
      module1Links = sorted.slice(0, nearbyLimit).map(v => ({
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
  const allIntents: { intent: DeepPageLinksProps['currentIntent']; prefix: string; label: string }[] = [
    { intent: 'services', prefix: 'services', label: 'Services' },
    { intent: 'tarifs', prefix: 'tarifs', label: 'Tarifs' },
    { intent: 'devis', prefix: 'devis', label: 'Devis' },
    { intent: 'avis', prefix: 'avis', label: 'Avis' },
    { intent: 'urgence', prefix: 'urgence', label: 'Urgence' },
  ]
  const filteredIntents = isHubMode
    ? allIntents.filter(i => i.intent !== 'services' && i.intent !== currentIntent)
    : allIntents.filter(i => i.intent !== currentIntent)
  const module4Links = skipCrossIntent ? [] : dedup(
    isHubMode
      ? filteredIntents.map(i => ({
          href: `/${i.prefix}/${currentService}`,
          label: `${i.label} ${serviceName}`,
        }))
      : filteredIntents.map(i => ({
          href: i.intent === 'services'
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
      .filter(d => d.region === currentRegion && d.code !== currentDeptCode)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))

    const otherRegionDepts = departements
      .filter(d => d.region !== currentRegion && d.code !== currentDeptCode)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))

    const candidateDepts = [...sameRegionDepts, ...otherRegionDepts]
    for (const d of candidateDepts) {
      if (module8Links.length >= 3) break
      const link = {
        href: `/departements/${d.slug}/${currentService}`,
        label: `${serviceName} dans le ${d.name}`,
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
  const GRANDES_VILLES = TOP_CITIES.map(c => c.slug)

  const maxGrandesVilles = isHubMode ? 20 : 8
  const module1Slugs = new Set(module1Links.map(l => l.href.split('/').pop()!))
  const deptSlugs = new Set(
    dept && ville ? getVillesByDepartement(ville.departementCode).map(v => v.slug) : []
  )
  const filteredGrandesVilles = GRANDES_VILLES
    .filter(slug => slug !== currentVille && !module1Slugs.has(slug) && !deptSlugs.has(slug))

  // Sort grandes villes by commune score (provider count + artisan density + population)
  // Money pages get a boost (+10000) to ensure they appear first
  const grandesVillesScores = await Promise.all(
    filteredGrandesVilles.map(async slug => ({
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
    // Use semantically related services — prioritize money pages among them
    if (!isHubMode && currentVille) {
      otherServiceSlugs = [...related]
        .sort((a, b) => {
          const aIsMP = isMoneyPage(a, currentVille) ? 1 : 0
          const bIsMP = isMoneyPage(b, currentVille) ? 1 : 0
          return bIsMP - aIsMP
        })
        .slice(0, maxOtherServices)
    } else {
      otherServiceSlugs = related.slice(0, maxOtherServices)
    }
  } else {
    // Fallback: pick from all services if no related mapping exists
    const otherServicesAll = services.filter(s => s.slug !== currentService)
    otherServiceSlugs = (!isHubMode && currentVille
      ? [...otherServicesAll].sort((a, b) => {
          const aIsMP = isMoneyPage(a.slug, currentVille) ? 1 : 0
          const bIsMP = isMoneyPage(b.slug, currentVille) ? 1 : 0
          return bIsMP - aIsMP
        })
      : otherServicesAll
    ).slice(0, maxOtherServices).map(s => s.slug)
  }

  const module2Links = dedup(
    otherServiceSlugs
      .map(slug => {
        const s = services.find(svc => svc.slug === slug)
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
      label: `${serviceName} dans le ${dept.name}`,
    })

    // Other dept links go through normal dedup
    const deptCandidates: { href: string; label: string }[] = []
    deptCandidates.push({
      href: `/departements/${dept.slug}`,
      label: `Artisans dans le ${dept.name}`,
    })
    const deptCities = getVillesByDepartement(ville.departementCode)
      .filter(v => v.slug !== currentVille)
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
    const metroRegions = regions.filter(r =>
      !['guadeloupe', 'martinique', 'guyane', 'la-reunion', 'mayotte',
        'saint-barthelemy', 'saint-martin', 'polynesie-francaise', 'nouvelle-caledonie'].includes(r.slug)
    )
    for (const r of metroRegions.slice(0, 8)) {
      module5Links.push({
        href: `/regions/${r.slug}/${currentService}`,
        label: `${serviceName} en ${r.name}`,
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
          label: `${serviceName} en ${ville.region}`,
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
    modules.push({ title: isHubMode ? `Tarifs, devis et avis ${serviceName.toLowerCase()}` : 'Voir aussi', links: module4Links })
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
    modules.push({ title: `${serviceName} dans le ${dept.name}`, links: module3Links })
  }
  if (module5Links.length > 0) {
    modules.push({ title: isHubMode ? `${serviceName} par région` : 'Hub service et région', links: module5Links })
  }
  if (module6Links.length > 0) {
    modules.push({ title: 'Guides et articles', links: module6Links })
  }

  if (modules.length === 0) return null

  return (
    <aside className="py-10 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <section key={mod.title}>
              <h3 className="text-sm font-semibold text-stone-800 mb-3">
                {mod.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {mod.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm text-stone-600 bg-slate-100 hover:bg-clay-100 hover:text-clay-600 rounded-full transition-colors"
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
