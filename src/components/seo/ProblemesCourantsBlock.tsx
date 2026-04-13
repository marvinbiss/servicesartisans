/**
 * ProblemesCourantsBlock — Affiche les 3 problèmes les plus courants pour un service donné.
 *
 * Filtrage par relatedServices / primaryService, tri par pertinence + urgence,
 * pondération climatique optionnelle. Server Component.
 */

import { Wrench, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import allProblems from '@/lib/data/problems'
import type { Problem } from '@/lib/data/problems'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProblemesCourantsBlockProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  villeSlug?: string
  climatZone?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const URGENCY_ORDER: Record<string, number> = {
  haute: 0,
  moyenne: 1,
  basse: 2,
}

/** Boost climatique : certaines saisonnalités sont plus pertinentes selon la zone */
function getClimatBoost(
  seasonality: string | undefined,
  climatZone: string | null | undefined
): number {
  if (!seasonality || !climatZone) return 0
  const s = seasonality.toLowerCase()
  const z = climatZone.toLowerCase()
  if ((z === 'montagnard' || z === 'continental') && s === 'hiver') return -1
  if (z === 'mediterraneen' && s === 'ete') return -1
  return 0
}

function sortProblems(
  problems: Problem[],
  serviceSlug: string,
  climatZone: string | null | undefined
): Problem[] {
  return [...problems].sort((a, b) => {
    // Primary service match first
    const aPrimary = a.primaryService === serviceSlug ? 0 : 1
    const bPrimary = b.primaryService === serviceSlug ? 0 : 1
    if (aPrimary !== bPrimary) return aPrimary - bPrimary

    // Climate boost
    const aClim = getClimatBoost(a.seasonality, climatZone)
    const bClim = getClimatBoost(b.seasonality, climatZone)
    if (aClim !== bClim) return aClim - bClim

    // Urgency
    const aUrg = URGENCY_ORDER[a.urgencyLevel] ?? 1
    const bUrg = URGENCY_ORDER[b.urgencyLevel] ?? 1
    return aUrg - bUrg
  })
}

function formatCost(min: number, max: number): string {
  return `${min}\u00a0€ – ${max}\u00a0€`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProblemesCourantsBlock({
  serviceSlug,
  serviceName,
  villeName,
  villeSlug,
  climatZone,
}: ProblemesCourantsBlockProps) {
  const filtered = allProblems.filter(
    (p) => p.primaryService === serviceSlug || p.relatedServices.includes(serviceSlug)
  )

  if (filtered.length === 0) return null

  const sorted = sortProblems(filtered, serviceSlug, climatZone)
  const top3 = sorted.slice(0, 3)

  return (
    <section className="py-6">
      <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
        Problèmes courants en {serviceName.toLowerCase()} à {villeName}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((problem) => {
          const Icon = problem.urgencyLevel === 'haute' ? AlertTriangle : Wrench
          const symptoms = problem.symptoms.slice(0, 3)
          const action = problem.immediateActions[0]

          return (
            <div
              key={problem.slug}
              className="rounded-lg border border-sand-200 bg-white p-4 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start gap-2">
                <Icon className="h-5 w-5 text-primary-600 mt-0.5 shrink-0" />
                <span className="font-semibold text-charcoal-900 leading-snug">{problem.name}</span>
              </div>

              {/* Symptoms pills */}
              <div className="flex flex-wrap gap-1.5">
                {symptoms.map((s) => (
                  <span
                    key={s}
                    className="inline-block rounded-full bg-sand-100 px-2.5 py-0.5 text-xs text-charcoal-700"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Cost range */}
              <p className="text-sm text-charcoal-600">
                <span className="font-medium">Coût estimé :</span>{' '}
                {formatCost(problem.estimatedCost.min, problem.estimatedCost.max)}
              </p>

              {/* Immediate action tip */}
              {action && (
                <p className="text-xs text-charcoal-500 italic leading-relaxed">
                  Astuce : {action}
                </p>
              )}

              {/* Link */}
              <Link
                href={
                  villeSlug
                    ? `/problemes/${problem.slug}/${villeSlug}`
                    : `/problemes/${problem.slug}`
                }
                className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                En savoir plus <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </section>
  )
}
