import { Clock, PhoneCall, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'

interface UrgencyBlockProps {
  serviceName: string
  villeName: string
  providerCount: number
  /**
   * Service-specific average intervention window. Comes from trade metadata
   * (`trade.averageResponseTime`) when available. Fallback : "sous 2h".
   */
  averageResponseTime?: string | null
  /**
   * Free-form warning label (e.g. "Urgences 24h/24 disponibles") surfaced from
   * trade.emergencyInfo. Optional — if null, we still show the 24h/24 badge.
   */
  emergencyInfo?: string | null
  /**
   * Callback request anchor on the page — the UrgencyBlock promotes it above
   * the fold for intent-urgence services. Defaults to `#callback-request`.
   */
  callbackAnchor?: string
}

/**
 * UrgencyBlock — rendu uniquement pour les services d'intent URGENCE
 * (plombier, serrurier, vitrier, etc.). Remplace visuellement le
 * MiniSimulateurInline (aides rénovation) qui était off-intent sur ces pages.
 *
 * Design : 4 signaux above-the-fold alignés sur le registre dépannage :
 *   1. Délai d'intervention moyen (trade.averageResponseTime)
 *   2. Compteur artisans disponibles (providerCount live)
 *   3. Badge 24h/24 (emergencyInfo)
 *   4. CTA "Être rappelé en <15 min" (ancre vers CallbackRequest)
 *
 * Zéro dépendance client — rendu 100% SSR pour que Googlebot voie le signal
 * urgence dès le HTML. Cohérent avec la règle people-first 2026 : une page
 * doit parler à 1 seul intent dans le above-the-fold.
 */
export default function UrgencyBlock({
  serviceName,
  villeName,
  providerCount,
  averageResponseTime,
  emergencyInfo,
  callbackAnchor = '#callback-request',
}: UrgencyBlockProps) {
  const interventionLabel = averageResponseTime?.trim() || 'Intervention sous 2h'
  const activeLabel =
    providerCount > 0
      ? `${providerCount} artisan${providerCount > 1 ? 's' : ''} disponible${providerCount > 1 ? 's' : ''}`
      : `Artisans RGE certifiés${villeName ? ` à ${villeName}` : ''}`
  const headerId = `urgency-${serviceName.toLowerCase().replace(/\s+/g, '-')}-${villeName.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <section aria-labelledby={headerId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id={headerId} className="font-heading text-lg md:text-xl font-bold text-red-900">
              {serviceName} en urgence à {villeName}
            </h2>
            <p className="text-sm text-red-800/80 mt-0.5">
              {emergencyInfo?.trim() || 'Intervention rapide 24h/24, dépannage et devis express.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-red-200">
            <Clock className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="text-2xs uppercase tracking-wide text-red-700 font-semibold">
                Délai moyen
              </div>
              <div className="text-sm font-medium text-charcoal-900">{interventionLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-red-200">
            <ShieldCheck className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="text-2xs uppercase tracking-wide text-red-700 font-semibold">
                Disponibilité
              </div>
              <div className="text-sm font-medium text-charcoal-900">{activeLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-red-200">
            <PhoneCall className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <div className="text-2xs uppercase tracking-wide text-red-700 font-semibold">
                Service
              </div>
              <div className="text-sm font-medium text-charcoal-900">24h/24 · 7j/7</div>
            </div>
          </div>
        </div>

        <Link
          href={callbackAnchor}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label={`Être rappelé en moins de 15 minutes pour un ${serviceName.toLowerCase()} à ${villeName}`}
        >
          <PhoneCall className="w-4 h-4" aria-hidden="true" />
          Être rappelé en &lt; 15 min
        </Link>
      </div>
    </section>
  )
}
