import Link from 'next/link'
import { ArrowRight, Calculator, Sparkles } from 'lucide-react'

import LastUpdated from '@/components/seo/LastUpdated'
import type { Aide } from '@/lib/aides/aides-catalog'

type Props = {
  aide: Aide
}

const CATEGORY_BADGE: Record<Aide['category'], string> = {
  'Subvention nationale': 'bg-accent-500/20 border-accent-400/30 text-accent-100',
  'Prime privée': 'bg-amber-500/20 border-amber-400/30 text-amber-100',
  Prêt: 'bg-sky-500/20 border-sky-400/30 text-sky-100',
  'Avantage fiscal': 'bg-primary-500/20 border-primary-400/30 text-primary-100',
}

export default function AideHero({ aide }: Props) {
  return (
    <section className="bg-gradient-to-br from-accent-700 via-accent-800 to-charcoal-900 text-white py-14 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div
          className={`inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-5 ${CATEGORY_BADGE[aide.category]}`}
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">{aide.category}</span>
        </div>
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-4">
          {aide.name}
        </h1>
        <p className="text-base md:text-lg text-accent-50/90 max-w-3xl leading-relaxed">
          {aide.tagline}
        </p>
        <LastUpdated
          label="Barèmes vérifiés le"
          date={aide.lastReviewed}
          className="mt-4 text-accent-100/90"
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/simulateur-aides-renovation"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-accent-800 font-semibold shadow-lg hover:bg-accent-50 transition"
          >
            <Calculator className="w-5 h-5" aria-hidden="true" />
            Simuler mes aides
          </Link>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-accent-300/60 text-white font-semibold hover:bg-accent-600/30 transition"
          >
            Devis gratuit RGE
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
