import Link from 'next/link'
import {
  BookOpen,
  ArrowRight,
  MapPin,
  Euro,
  Calendar,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  GitCompare,
} from 'lucide-react'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import { getDeptPreposition } from '@/lib/geo-strings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MaillageInterneProps {
  serviceSlug: string
  serviceName: string
  villeSlug: string
  villeName: string
  departementSlug?: string
  departementName?: string
  regionName?: string
  currentIntent: 'services' | 'devis' | 'tarifs' | 'urgence' | 'avis'
  hasCEE?: boolean
  problemSlugs?: string[]
  comparisonSlugs?: string[]
}

// ---------------------------------------------------------------------------
// Internal link definition
// ---------------------------------------------------------------------------

interface InternalLink {
  href: string
  label: string
  icon: typeof BookOpen
}

interface LinkGroup {
  title: string
  links: InternalLink[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRGEEligible(serviceSlug: string): boolean {
  return (RGE_ALLOWED_SERVICES as readonly string[]).includes(serviceSlug)
}

// ---------------------------------------------------------------------------
// Link generation per category
// ---------------------------------------------------------------------------

function buildGuidesUtiles(props: MaillageInterneProps): InternalLink[] {
  const links: InternalLink[] = []

  // Problem pages (all intents)
  if (props.problemSlugs && props.problemSlugs.length > 0) {
    const max = 3
    for (let i = 0; i < Math.min(props.problemSlugs.length, max); i++) {
      links.push({
        href: `/problemes/${props.problemSlugs[i]}`,
        label: `Guide : ${props.problemSlugs[i].replace(/-/g, ' ')}`,
        icon: HelpCircle,
      })
    }
  }

  // Calendrier travaux (all intents)
  links.push({
    href: '/calendrier-travaux',
    label: 'Calendrier des travaux saisonniers',
    icon: Calendar,
  })

  // Glossaire (all intents)
  links.push({
    href: '/glossaire',
    label: 'Glossaire du bâtiment',
    icon: BookOpen,
  })

  return links
}

function buildComparerOptions(props: MaillageInterneProps): InternalLink[] {
  const links: InternalLink[] = []

  // Comparison pages if provided
  if (props.comparisonSlugs && props.comparisonSlugs.length > 0) {
    const max = 2
    for (let i = 0; i < Math.min(props.comparisonSlugs.length, max); i++) {
      links.push({
        href: `/comparaison/${props.comparisonSlugs[i]}`,
        label: `Comparatif : ${props.comparisonSlugs[i].replace(/-/g, ' ')}`,
        icon: GitCompare,
      })
    }
  }

  // Baromètre (tarifs intent primarily, but useful for all)
  if (props.currentIntent === 'tarifs' || props.currentIntent === 'devis') {
    links.push({
      href: '/barometre',
      label: `Baromètre des prix ${props.serviceName.toLowerCase()}`,
      icon: BarChart3,
    })
  }

  return links
}

function buildVotreVille(props: MaillageInterneProps): InternalLink[] {
  const links: InternalLink[] = []

  // City page
  links.push({
    href: `/villes/${props.villeSlug}`,
    label: `Tous les artisans à ${props.villeName}`,
    icon: MapPin,
  })

  // Department page
  if (props.departementSlug && props.departementName) {
    links.push({
      href: `/departements/${props.departementSlug}`,
      label: `Artisans ${getDeptPreposition(props.departementName)}`,
      icon: MapPin,
    })
  }

  return links
}

function buildAidesFinancieres(props: MaillageInterneProps): InternalLink[] {
  const links: InternalLink[] = []
  const rgeEligible = isRGEEligible(props.serviceSlug)

  // Sprint 2 Phase C 2026-05-04 — câblage réciproque /services/[s]/[v] →
  // /rge/[s]/[v]. Avant : seul devis/tarifs/urgence pointaient vers RGE,
  // l'intent `services` (default des 50K URLs /services/[s]/[v]) ne linkait
  // jamais. Conséquence : les 50K URLs /rge/[s]/[v] (cluster RGE) recevaient
  // PageRank uniquement via le hub /rge/[service] (top 50 villes max), les
  // 49 950 autres restaient "dead-end". Ajouter le lien sur intent services
  // crée une paire 1:1 entre les deux clusters et booste massivement le
  // PageRank flow vers les pages profondes RGE.
  if (
    rgeEligible &&
    (props.currentIntent === 'devis' ||
      props.currentIntent === 'tarifs' ||
      props.currentIntent === 'services')
  ) {
    links.push({
      href: `/rge/${props.serviceSlug}/${props.villeSlug}`,
      label: `Artisans RGE ${props.serviceName.toLowerCase()} à ${props.villeName}`,
      icon: ShieldCheck,
    })
  }

  // CEE links (tarifs intent primarily)
  if (props.hasCEE && props.currentIntent === 'tarifs') {
    links.push({
      href: '/comparatif-primes-cee-2026',
      label: 'Comparatif des primes CEE 2026',
      icon: Euro,
    })
    links.push({
      href: '/simulateur-aides-renovation',
      label: 'Simulateur de prime CEE',
      icon: Euro,
    })
  }

  // CEE for devis intent too (lighter)
  if (props.hasCEE && props.currentIntent === 'devis') {
    links.push({
      href: '/simulateur-aides-renovation',
      label: 'Estimer votre prime CEE',
      icon: Euro,
    })
  }

  // RGE hub for urgence if RGE-eligible (find certified pros fast)
  if (rgeEligible && props.currentIntent === 'urgence') {
    links.push({
      href: `/rge/${props.serviceSlug}/${props.villeSlug}`,
      label: `Artisans RGE certifiés à ${props.villeName}`,
      icon: ShieldCheck,
    })
  }

  return links
}

// ---------------------------------------------------------------------------
// Assemble groups, cap at 8-10 links total
// ---------------------------------------------------------------------------

function buildGroups(props: MaillageInterneProps): LinkGroup[] {
  const groups: LinkGroup[] = []
  const usedHrefs = new Set<string>()
  let totalLinks = 0
  const MAX_LINKS = 10

  function addGroup(title: string, candidates: InternalLink[]) {
    if (totalLinks >= MAX_LINKS) return
    const deduped: InternalLink[] = []
    for (const link of candidates) {
      if (totalLinks + deduped.length >= MAX_LINKS) break
      if (!usedHrefs.has(link.href)) {
        usedHrefs.add(link.href)
        deduped.push(link)
      }
    }
    if (deduped.length > 0) {
      groups.push({ title, links: deduped })
      totalLinks += deduped.length
    }
  }

  // Order groups by relevance to intent
  if (props.currentIntent === 'tarifs' || props.currentIntent === 'devis') {
    addGroup('Aides financières', buildAidesFinancieres(props))
    addGroup('Comparer les options', buildComparerOptions(props))
    addGroup('Guides utiles', buildGuidesUtiles(props))
    addGroup('Votre ville', buildVotreVille(props))
  } else if (props.currentIntent === 'urgence') {
    addGroup('Guides utiles', buildGuidesUtiles(props))
    addGroup('Votre ville', buildVotreVille(props))
    addGroup('Aides financières', buildAidesFinancieres(props))
    addGroup('Comparer les options', buildComparerOptions(props))
  } else {
    // services, avis
    addGroup('Guides utiles', buildGuidesUtiles(props))
    addGroup('Votre ville', buildVotreVille(props))
    addGroup('Comparer les options', buildComparerOptions(props))
    addGroup('Aides financières', buildAidesFinancieres(props))
  }

  return groups
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MaillageInterneBlock(props: MaillageInterneProps) {
  const groups = buildGroups(props)

  if (groups.length === 0) return null

  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h3 className="text-base font-semibold text-charcoal-800 mb-4">Ressources utiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-2">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                    >
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 ml-auto opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
