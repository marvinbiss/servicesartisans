import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import type { Aide } from '@/lib/aides/aides-catalog'

type Props = {
  /** Titre de section. Défaut : « Aides cumulables ». */
  title?: string
  /** Liste filtrée d'aides à afficher. Vide → composant ne render rien. */
  aides: Aide[]
}

export default function RelatedAides({ title = 'Aides cumulables', aides }: Props) {
  if (aides.length === 0) return null

  return (
    <section
      className="bg-white py-12 border-t border-charcoal-100"
      aria-labelledby="related-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2
          id="related-heading"
          className="font-heading text-2xl md:text-3xl font-extrabold text-charcoal-900 mb-6"
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aides.map((a) => (
            <Link
              key={a.slug}
              href={`/aides/${a.slug}`}
              className="group block rounded-xl border border-charcoal-100 bg-white p-5 hover:border-emerald-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-heading font-bold text-charcoal-900 group-hover:text-emerald-700 transition">
                  {a.name}
                </h3>
                <ArrowUpRight
                  className="w-4 h-4 text-charcoal-400 group-hover:text-emerald-700 transition flex-shrink-0"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed">{a.tagline}</p>
              <span className="mt-3 inline-block text-xs font-medium text-emerald-700">
                {a.category}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
