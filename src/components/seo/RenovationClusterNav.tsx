'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  RENO_SECTIONS,
  RENO_PILLAR,
  RENO_CROSS_LINKS,
  findRenoSection,
  type ClusterPage,
} from '@/lib/data/renovation-cluster-map'

/**
 * Maillage dense du cluster "rénovation énergétique" — signal d'autorité
 * topique. Rendu une seule fois dans le layout reno, il s'adapte à la page
 * courante via usePathname (résolu au SSR → liens présents dans le HTML,
 * crawlables) : sœurs de la rubrique + piliers des autres rubriques + hubs
 * croisés. Chaque page reno émet ainsi ~20-30 liens internes pertinents.
 */
export default function RenovationClusterNav() {
  const pathname = usePathname() || ''
  const section = findRenoSection(pathname)
  const isCurrent = (p: string) => p === pathname

  const chip =
    'inline-block px-3 py-1.5 text-sm bg-white border border-sand-200 rounded-full text-charcoal-700 hover:border-primary-300 hover:text-primary-600 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-400 focus-visible:outline-none'

  const ChipList = ({ items }: { items: ClusterPage[] }) => (
    <ul className="flex flex-wrap gap-2" role="list">
      {items
        .filter((p) => !isCurrent(p.path))
        .map((p) => (
          <li key={p.path}>
            <Link href={p.path} className={chip}>
              {p.label}
            </Link>
          </li>
        ))}
    </ul>
  )

  // Cross-section : piliers des autres rubriques (+ pilier principal),
  // en excluant la rubrique courante déjà détaillée au-dessus.
  const crossSectionPillars: ClusterPage[] = [
    RENO_PILLAR,
    ...RENO_SECTIONS.filter((s) => s.slug !== section?.slug).map((s) => s.pillar),
  ]

  return (
    <nav
      aria-label="Cluster rénovation énergétique"
      className="bg-sand-50 border-t border-sand-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {section && (
          <div>
            <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
              Dans la rubrique {section.label}
            </h2>
            <ChipList items={[section.pillar, ...section.pages]} />
          </div>
        )}

        <div>
          <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
            Tous les travaux de rénovation énergétique
          </h2>
          <ChipList items={crossSectionPillars} />
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
            À consulter aussi
          </h2>
          <ChipList items={RENO_CROSS_LINKS} />
        </div>
      </div>
    </nav>
  )
}
