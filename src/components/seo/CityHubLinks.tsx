import Link from 'next/link'
import {
  services,
  getVillesByDepartement,
  getDepartementByCode,
  getCityScore,
  type Ville,
} from '@/lib/data/france'
import { getAnchorText } from '@/lib/seo/anchor-variants'

// ---------------------------------------------------------------------------
// Services d'urgence et services populaires (slugs)
// ---------------------------------------------------------------------------

const URGENCE_SERVICES = ['plombier', 'serrurier', 'electricien'] as const
const DEVIS_TARIFS_SERVICES = ['plombier', 'electricien', 'chauffagiste', 'serrurier'] as const
const AVIS_SERVICES = ['plombier', 'electricien', 'serrurier'] as const

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CityHubLinksProps {
  ville: Ville
  villeSlug: string
  topServiceSlugs: string[]
  regionSlug: string | undefined
  deptSlug: string | undefined
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CityHubLinks({
  ville,
  villeSlug,
  topServiceSlugs,
  regionSlug,
  deptSlug,
}: CityHubLinksProps) {
  const dept = getDepartementByCode(ville.departementCode)

  // ── Module 1 : Services populaires dans cette ville (8-10 liens) ──
  const topServices = topServiceSlugs
    .slice(0, 6)
    .map(slug => services.find(s => s.slug === slug))
    .filter((s): s is (typeof services)[number] => s != null)

  // ── Module 2 : Villes proches du même département (6 liens) ──
  // Sort by city score (population + capital bonus) for better internal linking
  const nearbyDeptCities = dept
    ? getVillesByDepartement(ville.departementCode)
        .filter(v => v.slug !== villeSlug)
        .sort((a, b) => getCityScore(b) - getCityScore(a))
        .slice(0, 6)
    : []

  // ── Module 3 : Intent variants — devis & tarifs (8 liens) ──
  const devisTarifsLinks = DEVIS_TARIFS_SERVICES.flatMap(slug => {
    const s = services.find(sv => sv.slug === slug)
    if (!s) return []
    return [
      { href: `/devis/${slug}/${villeSlug}`, label: getAnchorText({ serviceSlug: slug, serviceName: s.name, villeName: ville.name, intent: 'devis', seed: 'city-hub' }) },
      { href: `/tarifs/${slug}/${villeSlug}`, label: getAnchorText({ serviceSlug: slug, serviceName: s.name, villeName: ville.name, intent: 'tarifs', seed: 'city-hub' }) },
    ]
  })

  // ── Module 4 : Urgence (3 liens) ──
  const urgenceLinks = URGENCE_SERVICES
    .map(slug => {
      const s = services.find(sv => sv.slug === slug)
      if (!s) return null
      return { href: `/urgence/${slug}/${villeSlug}`, label: getAnchorText({ serviceSlug: slug, serviceName: s.name, villeName: ville.name, intent: 'urgence', seed: 'city-hub' }) }
    })
    .filter((x): x is { href: string; label: string } => x != null)

  // ── Module 5 : Avis (3 liens) ──
  const avisLinks = AVIS_SERVICES
    .map(slug => {
      const s = services.find(sv => sv.slug === slug)
      if (!s) return null
      return { href: `/avis/${slug}/${villeSlug}`, label: getAnchorText({ serviceSlug: slug, serviceName: s.name, villeName: ville.name, intent: 'avis', seed: 'city-hub' }) }
    })
    .filter((x): x is { href: string; label: string } => x != null)

  // ── Module 6 : Département parent (4 liens) ──
  const deptLinks: { href: string; label: string }[] = []
  if (dept && deptSlug) {
    deptLinks.push({ href: `/departements/${deptSlug}`, label: `Artisans dans le ${dept.name}` })
    // Top 3 services dans le département
    topServiceSlugs.slice(0, 3).forEach(slug => {
      const s = services.find(sv => sv.slug === slug)
      if (s) {
        deptLinks.push({
          href: `/departements/${deptSlug}/${slug}`,
          label: `${s.name} dans le ${dept.name}`,
        })
      }
    })
  }

  // ── Module 7 : Région parent (2 liens) ──
  const regionLinks: { href: string; label: string }[] = []
  if (regionSlug) {
    regionLinks.push({ href: `/regions/${regionSlug}`, label: `Artisans en ${ville.region}` })
    const topSlug = topServiceSlugs[0]
    const topS = topSlug ? services.find(s => s.slug === topSlug) : null
    if (topS) {
      regionLinks.push({
        href: `/regions/${regionSlug}/${topSlug}`,
        label: `${topS.name} en ${ville.region}`,
      })
    }
  }

  // ── Build modules ──
  const modules: { title: string; links: { href: string; label: string }[] }[] = []

  if (topServices.length > 0) {
    modules.push({
      title: `Services populaires à ${ville.name}`,
      links: topServices.map(s => ({
        href: `/services/${s.slug}/${villeSlug}`,
        label: getAnchorText({ serviceSlug: s.slug, serviceName: s.name, villeName: ville.name, intent: 'services', seed: 'city-hub-top' }),
      })),
    })
  }

  if (nearbyDeptCities.length > 0) {
    modules.push({
      title: `Villes proches dans le ${ville.departement}`,
      links: nearbyDeptCities.map(v => ({
        href: `/villes/${v.slug}`,
        label: `Artisans à ${v.name}`,
      })),
    })
  }

  if (devisTarifsLinks.length > 0) {
    modules.push({
      title: `Devis et tarifs à ${ville.name}`,
      links: devisTarifsLinks,
    })
  }

  if (urgenceLinks.length > 0) {
    modules.push({
      title: `Urgence à ${ville.name}`,
      links: urgenceLinks,
    })
  }

  if (avisLinks.length > 0) {
    modules.push({
      title: `Avis artisans à ${ville.name}`,
      links: avisLinks,
    })
  }

  if (deptLinks.length > 0) {
    modules.push({
      title: `${ville.departement} (${ville.departementCode})`,
      links: deptLinks,
    })
  }

  if (regionLinks.length > 0) {
    modules.push({
      title: ville.region,
      links: regionLinks,
    })
  }

  // Navigation structurelle
  modules.push({
    title: 'Naviguer',
    links: [
      { href: '/services', label: `${services.length} métiers d'artisanat` },
      { href: '/villes', label: 'Toutes les villes' },
      { href: '/departements', label: 'Tous les départements' },
      { href: '/regions', label: 'Toutes les régions' },
      { href: '/devis', label: 'Demander un devis' },
    ],
  })

  return (
    <section className="py-16 bg-white border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-bold text-charcoal-900 mb-8 tracking-tight">
          Voir aussi
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod) => (
            <div key={mod.title}>
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                {mod.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {mod.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 text-sm text-charcoal-600 bg-sand-50 hover:bg-primary-50 hover:text-primary-500 rounded-full border border-sand-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
