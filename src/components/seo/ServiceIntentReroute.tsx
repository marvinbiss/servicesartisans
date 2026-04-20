import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getCrossIntentTarget } from '@/lib/seo/service-intents'

interface ServiceIntentRerouteProps {
  /** Current page service slug (e.g. "plombier") */
  serviceSlug: string
  /** Current page ville slug (e.g. "paris") */
  villeSlug: string
  /** Ville name for the CTA label (e.g. "Paris") */
  villeName: string
  /**
   * Resolver from slug → display name. Passed by caller (page.tsx has
   * staticServicesList in scope) so the component stays data-agnostic.
   */
  resolveServiceName: (slug: string) => string | null
}

/**
 * ServiceIntentReroute — bloc contextuel de maillage cross-intent en fin de
 * page service×ville. Affiche 1 lien <a href> standard vers un service
 * sibling d'intent DIFFÉRENT (ex. plombier URGENCE → chauffagiste RÉNO).
 *
 * But : capter le volume de l'intent adjacent sans polluer le registre
 * éditorial de la page courante. Conforme à la règle Google 2026 people-first
 * (1 intent par URL, maillage contextuel en fin de page).
 *
 * Rien affiché si aucun reroute n'est défini pour ce service.
 */
export default function ServiceIntentReroute({
  serviceSlug,
  villeSlug,
  villeName,
  resolveServiceName,
}: ServiceIntentRerouteProps) {
  const reroute = getCrossIntentTarget(serviceSlug)
  if (!reroute) return null

  const targetServiceName = resolveServiceName(reroute.targetSlug)
  if (!targetServiceName) return null

  const targetHref = `/services/${reroute.targetSlug}/${villeSlug}`
  const accent =
    reroute.targetIntent === 'renovation'
      ? 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900'
      : reroute.targetIntent === 'urgence'
        ? 'from-red-50 to-orange-50 border-red-200 text-red-900'
        : 'from-sand-50 to-white border-sand-300 text-charcoal-900'

  const linkAccent =
    reroute.targetIntent === 'renovation'
      ? 'text-emerald-700 hover:text-emerald-900'
      : reroute.targetIntent === 'urgence'
        ? 'text-red-700 hover:text-red-900'
        : 'text-primary-600 hover:text-primary-800'

  return (
    <section
      aria-labelledby="intent-reroute-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8"
    >
      <div className={`rounded-2xl border bg-gradient-to-br ${accent} p-5 md:p-6`}>
        <h2
          id="intent-reroute-heading"
          className="font-heading text-base md:text-lg font-bold mb-1.5"
        >
          {reroute.ctaLabel}
        </h2>
        <p className="text-sm opacity-80 mb-3">{reroute.ctaSubline}</p>
        <Link
          href={targetHref}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 ${linkAccent}`}
        >
          Voir les {targetServiceName.toLowerCase()}s à {villeName}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
