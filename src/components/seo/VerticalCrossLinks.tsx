import Link from 'next/link'
import { services } from '@/lib/data/france'
import { getAnchorText, type Intent } from '@/lib/seo/anchor-variants'

interface VerticalCrossLinksProps {
  currentService: string
  villeSlug: string
  villeName: string
  intent: 'tarifs' | 'devis' | 'avis'
}

const INTENT_LABELS: Record<string, string> = {
  tarifs: 'Autres tarifs',
  devis: 'Autres devis',
  avis: 'Autres avis',
}

export default function VerticalCrossLinks({
  currentService,
  villeSlug,
  villeName,
  intent,
}: VerticalCrossLinksProps) {
  const otherServices = services.filter((s) => s.slug !== currentService).slice(0, 4)

  if (otherServices.length === 0) return null

  return (
    <section className="py-8 border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm font-semibold text-sand-800 mb-3">
          {INTENT_LABELS[intent]} à {villeName}
        </h3>
        <div className="flex flex-wrap gap-2">
          {otherServices.map((s) => (
            <Link
              key={s.slug}
              // /tarifs|/devis/[s]/[v] purgés 2026-04-30 (gone-paths 301) —
              // seule /avis/[s]/[v] subsiste ; sinon cible directe /services.
              href={
                intent === 'avis'
                  ? `/avis/${s.slug}/${villeSlug}`
                  : `/services/${s.slug}/${villeSlug}`
              }
              className="px-3 py-1.5 text-sm text-sand-600 bg-sand-200 hover:bg-clay-100 hover:text-clay-600 rounded-full transition-colors"
            >
              {getAnchorText({
                serviceSlug: s.slug,
                serviceName: s.name,
                villeName,
                intent: intent as Intent,
                seed: `vertical-${currentService}`,
              })}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
