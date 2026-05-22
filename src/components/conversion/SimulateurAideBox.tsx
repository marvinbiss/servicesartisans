import Link from 'next/link'
import { ArrowRight, Calculator, Sparkles } from 'lucide-react'

/**
 * SimulateurAideBox — CTA box éligibilité MaPrimeRénov' + CEE + Éco-PTZ.
 *
 * Funnel commercial pages reno : capte intention "aides" pré-devis.
 * Linke vers `/simulateur-aides-renovation` avec service + code postal pré-remplis.
 *
 * E-E-A-T : montants estimatifs sourcés ANAH (MPR) + Légifrance (CEE) + Service-Public (Éco-PTZ).
 *
 * @kw-related   "aides renovation energetique", "maprimerenov simulateur", "calcul aides"
 * @cluster      reno-funnel
 */
type SimulateurAideBoxProps = {
  serviceKey: string
  postalCode?: string
  estimatedSaving?: number
  title?: string
  subtitle?: string
  className?: string
}

export default function SimulateurAideBox({
  serviceKey,
  postalCode,
  estimatedSaving,
  title = 'Estimez vos aides en 3 min',
  subtitle,
  className = '',
}: SimulateurAideBoxProps) {
  const params = new URLSearchParams()
  if (serviceKey) params.set('service', serviceKey)
  if (postalCode) params.set('cp', postalCode)
  const href = `/simulateur-aides-renovation${params.toString() ? `?${params.toString()}` : ''}`

  const defaultSubtitle = estimatedSaving
    ? `MaPrimeRénov' + CEE + Éco-PTZ — jusqu'à ${estimatedSaving.toLocaleString('fr-FR')} €`
    : `MaPrimeRénov' + CEE + Éco-PTZ — jusqu'à plusieurs milliers d'euros`

  return (
    <aside
      aria-labelledby="simulateur-aide-heading"
      className={`bg-accent-50 border border-accent-200 rounded-2xl p-6 md:p-8 my-8 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <Calculator className="w-6 h-6 text-accent-700" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-accent-600" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wide text-accent-700">
              Simulateur officiel
            </span>
          </div>

          <h2
            id="simulateur-aide-heading"
            className="font-heading text-xl md:text-2xl font-bold text-charcoal-900 m-0 mb-2"
          >
            {title}
          </h2>

          <p className="text-sm md:text-base text-charcoal-700 mb-5">
            {subtitle || defaultSubtitle}
          </p>

          <Link
            href={href}
            className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 focus-visible:bg-accent-700 text-white font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow-md transition-all text-sm md:text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-700"
          >
            Calculer mes aides
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <p className="text-xs text-charcoal-500 mt-3">
            Sources : ANAH (MaPrimeRénov&apos;) · Légifrance (CEE) · Service-Public.fr (Éco-PTZ).
          </p>
        </div>
      </div>
    </aside>
  )
}
