import Link from 'next/link'
import {
  BookOpen,
  Euro,
  FileText,
  Star,
  AlertTriangle,
  Wrench,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { getClusterLinksForPage, type ClusterLink } from '@/lib/seo/topical-clusters'
import { getServiceWeight } from '@/lib/constants/navigation'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TopicalClusterLinksProps {
  serviceSlug: string
  serviceName: string
  currentPath: string
  /** Max links to display */
  maxLinks?: number
}

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<ClusterLink['type'], typeof Euro> = {
  pillar: Wrench,
  tarifs: Euro,
  devis: FileText,
  avis: Star,
  urgence: AlertTriangle,
  blog: BookOpen,
  guide: BookOpen,
  probleme: AlertCircle,
  service: Wrench,
  barometre: BarChart3,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Affiche les liens du cluster thematique pour un service.
 * S'adapte au contexte de la page en cours (exclut la page actuelle).
 *
 * Utilise comme section "Pages associees" en bas de page.
 * Server component — pas de 'use client'.
 */
export default function TopicalClusterLinks({
  serviceSlug,
  serviceName,
  currentPath,
  maxLinks = 8,
}: TopicalClusterLinksProps) {
  const links = getClusterLinksForPage(serviceSlug, currentPath, maxLinks)

  if (links.length === 0) return null

  // Group by type category for better visual organization
  const intentLinks = links.filter((l) =>
    ['pillar', 'tarifs', 'devis', 'avis', 'urgence', 'barometre'].includes(l.type)
  )
  const contentLinks = links.filter((l) => ['blog', 'guide', 'probleme'].includes(l.type))
  const serviceLinks = links
    .filter((l) => l.type === 'service')
    .sort((a, b) => {
      // Extract slug from path like /services/{slug}
      const aSlug = a.path.split('/').pop() || ''
      const bSlug = b.path.split('/').pop() || ''
      return getServiceWeight(bSlug) - getServiceWeight(aSlug)
    })

  const modules: { title: string; links: ClusterLink[] }[] = []

  if (intentLinks.length > 0) {
    modules.push({
      title: `${serviceName} — toutes les rubriques`,
      links: intentLinks,
    })
  }
  if (contentLinks.length > 0) {
    modules.push({
      title: 'Guides et articles',
      links: contentLinks,
    })
  }
  if (serviceLinks.length > 0) {
    modules.push({
      title: 'Services complémentaires',
      links: serviceLinks,
    })
  }

  return (
    <nav
      aria-label={`Pages associées pour ${serviceName}`}
      className="py-10 border-t border-sand-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-semibold text-charcoal-400 uppercase tracking-wider mb-6">
          Explorer le dossier {serviceName.toLowerCase()}
        </h3>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div key={mod.title}>
              <h4 className="text-sm font-semibold text-charcoal-800 mb-3">{mod.title}</h4>
              <div className="flex flex-wrap gap-2">
                {mod.links.map((link) => {
                  const Icon = TYPE_ICONS[link.type]
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-charcoal-600 bg-sand-50 hover:bg-primary-50 hover:text-primary-600 rounded-full border border-sand-200 hover:border-primary-200 transition-colors"
                      prefetch={false}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
