import Link from 'next/link'
import {
  services,
  getVilleBySlug,
  getNearbyCities,
  getVillesByDepartement,
  getDepartementByCode,
  getRegionSlugByName,
  regions,
} from '@/lib/data/france'
import { allArticles } from '@/lib/data/blog/articles'
import { getNearbyVilleSlugs } from '@/lib/data/commune-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeepPageLinksProps {
  currentService: string   // slug du service (ex: "plombier")
  currentVille?: string    // slug de la ville (ex: "paris") — optionnel pour le mode hub
  currentIntent?: 'services' | 'tarifs' | 'devis' | 'avis' | 'urgence'
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
}: DeepPageLinksProps) {
  const serviceData = services.find(s => s.slug === currentService)
  if (!serviceData) return null

  const serviceName = serviceData.name
  const isHubMode = !currentVille
  const ville = currentVille ? getVilleBySlug(currentVille) : null

  // In city mode, ville must exist
  if (!isHubMode && !ville) return null

  const villeName = ville?.name || ''

  // ── Module 1: Villes proches (city mode only) ─────────────────────────
  let module1Links: { href: string; label: string }[] = []

  if (!isHubMode && currentVille) {
    // Try GPS-based proximity (works at runtime/ISR, not during build)
    // City mode: cap at 4 (reduced from 8 to stay under 50 total links)
    const nearbyLimit = 4
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
    if (module1Links.length === 0) {
      const nearbyCities = getNearbyCities(currentVille, nearbyLimit)
      module1Links = nearbyCities.map(v => ({
        href: `/services/${currentService}/${v.slug}`,
        label: `${serviceName} à ${v.name}`,
      }))
    }
  }

  // ── Module 2: Autres services ─────────────────────────────────────────
  // City mode: 4 services (reduced from 8); Hub mode: keep 8
  const maxOtherServices = isHubMode ? 8 : 4
  const otherServices = services
    .filter(s => s.slug !== currentService)
    .slice(0, maxOtherServices)
  const module2Links = isHubMode
    ? otherServices.map(s => ({
        href: `/services/${s.slug}`,
        label: `${s.name} en France`,
      }))
    : otherServices.map(s => ({
        href: `/services/${s.slug}/${currentVille}`,
        label: `${s.name} à ${villeName}`,
      }))

  // ── Module 3: Dans le département (city mode only) ────────────────────
  const dept = ville ? getDepartementByCode(ville.departementCode) : null
  const module3Links: { href: string; label: string }[] = []
  if (!isHubMode && dept && ville) {
    module3Links.push({
      href: `/departements/${dept.slug}`,
      label: `Artisans dans le ${dept.name}`,
    })
    module3Links.push({
      href: `/departements/${dept.slug}/${currentService}`,
      label: `${serviceName} dans le ${dept.name}`,
    })
    const deptCities = getVillesByDepartement(ville.departementCode)
      .filter(v => v.slug !== currentVille)
      .sort((a, b) => parsePopulation(b.population) - parsePopulation(a.population))
      .slice(0, 1)
    for (const c of deptCities) {
      module3Links.push({
        href: `/services/${currentService}/${c.slug}`,
        label: `${serviceName} à ${c.name}`,
      })
    }
  }

  // ── Module 4: Cross-intent ────────────────────────────────────────────
  const intents: { intent: DeepPageLinksProps['currentIntent']; prefix: string; label: string }[] = [
    { intent: 'tarifs', prefix: 'tarifs', label: 'Tarifs' },
    { intent: 'devis', prefix: 'devis', label: 'Devis' },
    { intent: 'avis', prefix: 'avis', label: 'Avis' },
    { intent: 'urgence', prefix: 'urgence', label: 'Urgence' },
  ]
  const module4Links = isHubMode
    ? intents
        .filter(i => i.intent !== currentIntent)
        .map(i => ({
          href: `/${i.prefix}/${currentService}`,
          label: `${i.label} ${serviceName}`,
        }))
    : intents
        .filter(i => i.intent !== currentIntent)
        .map(i => ({
          href: `/${i.prefix}/${currentService}/${currentVille}`,
          label: `${i.label} ${serviceName} à ${villeName}`,
        }))

  // ── Module 5: Hub service et région ───────────────────────────────────
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
    // City mode: 2 links (reduced from 3 — drop generic region link, keep hub + region×service)
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
  }

  // ── Module 6: Guides et articles ──────────────────────────────────────
  const articleSlugs = SERVICE_ARTICLE_MAP.get(currentService) || []
  const module6Links: { href: string; label: string }[] = []
  const maxArticles = isHubMode ? 3 : 1
  for (const slug of articleSlugs) {
    if (module6Links.length >= maxArticles) break
    const article = allArticles[slug]
    if (article) {
      module6Links.push({
        href: `/blog/${slug}`,
        label: article.title,
      })
    }
  }

  // ── Module 7: Grandes villes de France ───────────────────────────────
  const GRANDES_VILLES = [
    'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux',
    'nantes', 'strasbourg', 'lille', 'montpellier', 'nice',
    'rennes', 'toulon', 'grenoble', 'dijon', 'angers',
  ]

  const maxGrandesVilles = isHubMode ? 10 : 3
  const module1Slugs = new Set(module1Links.map(l => l.href.split('/').pop()!))
  const deptSlugs = new Set(
    dept && ville ? getVillesByDepartement(ville.departementCode).map(v => v.slug) : []
  )
  const module7Links = GRANDES_VILLES
    .filter(slug => slug !== currentVille && !module1Slugs.has(slug) && !deptSlugs.has(slug))
    .slice(0, maxGrandesVilles)
    .map(slug => {
      const v = getVilleBySlug(slug)
      return v
        ? { href: `/services/${currentService}/${slug}`, label: `${serviceName} à ${v.name}` }
        : null
    })
    .filter((x): x is { href: string; label: string } => x !== null)

  // ── Build modules array ───────────────────────────────────────────────
  const modules: { title: string; links: { href: string; label: string }[] }[] = []

  if (module1Links.length > 0) {
    modules.push({ title: `${serviceName} à proximité de ${villeName}`, links: module1Links })
  }
  if (module2Links.length > 0) {
    modules.push({
      title: isHubMode ? 'Autres services artisans' : `Autres artisans à ${villeName}`,
      links: module2Links,
    })
  }
  if (module3Links.length > 0 && dept) {
    modules.push({ title: `${serviceName} dans le ${dept.name}`, links: module3Links })
  }
  if (module4Links.length > 0) {
    modules.push({ title: isHubMode ? `Tarifs, devis et avis ${serviceName.toLowerCase()}` : 'Voir aussi', links: module4Links })
  }
  if (module5Links.length > 0) {
    modules.push({ title: isHubMode ? `${serviceName} par région` : 'Hub service et région', links: module5Links })
  }
  if (module6Links.length > 0) {
    modules.push({ title: 'Guides et articles', links: module6Links })
  }
  if (module7Links.length > 0) {
    modules.push({ title: `${serviceName} dans les grandes villes`, links: module7Links })
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
