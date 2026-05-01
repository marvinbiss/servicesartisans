/**
 * ComparatifsBlock — Affiche les 2 comparatifs les plus pertinents pour un service.
 *
 * Matching par recherche textuelle dans le slug et le title du comparatif
 * contre le serviceSlug / serviceName. Server Component.
 */

import { ArrowRight, Scale } from 'lucide-react'
import Link from 'next/link'
import { comparisons } from '@/lib/data/comparisons'
import type { Comparison, ComparisonOption } from '@/lib/data/comparisons'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComparatifsBlockProps {
  serviceSlug: string
  serviceName: string
}

// ---------------------------------------------------------------------------
// Service → category mapping
// ---------------------------------------------------------------------------

/** Maps service slugs to comparison categories for filtering */
const SERVICE_TO_CATEGORIES: Record<string, string[]> = {
  plombier: ['Chauffage / Énergie'],
  chauffagiste: ['Chauffage / Énergie', 'Isolation'],
  electricien: ['Chauffage / Énergie'],
  menuisier: ['Menuiserie'],
  peintre: ['Revêtements'],
  carreleur: ['Revêtements'],
  couvreur: ['Structure', 'Extérieur'],
  macon: ['Structure'],
  charpentier: ['Structure'],
  serrurier: ['Menuiserie'],
  paysagiste: ['Extérieur'],
  facades: ['Structure'],
  facades_ravalement: ['Structure'],
  isolation: ['Isolation', 'Chauffage / Énergie'],
  climatisation: ['Chauffage / Énergie'],
  'pompe-a-chaleur': ['Chauffage / Énergie'],
  vitrier: ['Menuiserie'],
  verandas: ['Extérieur', 'Menuiserie'],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreComparison(c: Comparison, serviceSlug: string, serviceName: string): number {
  let score = 0
  const slugLower = c.slug.toLowerCase()
  const titleLower = c.title.toLowerCase()
  const serviceSlugLower = serviceSlug.toLowerCase()
  const serviceNameLower = serviceName.toLowerCase()

  // Direct slug/title match with service slug keywords
  const slugWords = serviceSlugLower.split('-')
  for (const word of slugWords) {
    if (word.length > 2 && slugLower.includes(word)) score += 3
    if (word.length > 2 && titleLower.includes(word)) score += 2
  }

  // Service name in title
  if (titleLower.includes(serviceNameLower)) score += 5

  // Category match
  const categories = SERVICE_TO_CATEGORIES[serviceSlug]
  if (categories && categories.includes(c.category)) score += 2

  return score
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

function OptionRow({ option }: { option: ComparisonOption }) {
  const advantage = option.avantages[0] ?? '—'
  const inconvenient = option.inconvenients[0] ?? '—'

  return (
    <tr className="border-b border-sand-100 last:border-b-0">
      <td className="py-1.5 pr-3 text-sm font-medium text-charcoal-900 whitespace-nowrap">
        {option.name}
      </td>
      <td className="py-1.5 pr-3 text-xs text-charcoal-600">{option.prixMoyen}</td>
      <td className="py-1.5 pr-3 text-xs text-emerald-700">{truncate(advantage, 60)}</td>
      <td className="py-1.5 text-xs text-red-600">{truncate(inconvenient, 60)}</td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ComparatifsBlock({ serviceSlug, serviceName }: ComparatifsBlockProps) {
  // Score and filter comparisons
  const scored = comparisons
    .map((c) => ({ comparison: c, score: scoreComparison(c, serviceSlug, serviceName) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) return null

  const top2 = scored.slice(0, 2).map((item) => item.comparison)

  return (
    <section className="py-6">
      <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
        Comparatifs matériaux
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {top2.map((comp) => {
          const displayOptions = comp.options.slice(0, 3)

          return (
            <div
              key={comp.slug}
              className="rounded-lg border border-sand-200 bg-white p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start gap-2">
                <Scale className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                <span className="font-semibold text-charcoal-900 leading-snug text-sm">
                  {comp.title}
                </span>
              </div>

              {/* Verdict */}
              <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-2">
                {comp.verdict}
              </p>

              {/* Compact comparison table */}
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-sand-200">
                      <th className="pb-1.5 pr-3 text-xs font-medium text-charcoal-500">Option</th>
                      <th className="pb-1.5 pr-3 text-xs font-medium text-charcoal-500">Prix</th>
                      <th className="pb-1.5 pr-3 text-xs font-medium text-charcoal-500">
                        Avantage
                      </th>
                      <th className="pb-1.5 text-xs font-medium text-charcoal-500">Inconvénient</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOptions.map((opt) => (
                      <OptionRow key={opt.name} option={opt} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CTA link */}
              <Link
                href={`/comparatif/${comp.slug}`}
                className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                Voir le comparatif complet <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
