/**
 * PrimesCEEBlock — Bloc primes CEE éligibles pour un service donné.
 *
 * Affiche les opérations CEE dont services_slugs inclut le service de la page,
 * avec une estimation de la tranche de revenus du foyer basée sur le revenu médian
 * et la zone climatique.
 *
 * Server Component — pas de 'use client'.
 */

import { Zap, Euro, Leaf, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { CommuneData } from '@/lib/data/commune-data'
import { getCeeOperations, CEE_DOMAINE_LABELS } from '@/lib/cee/catalogue'
import type { CeeOperation } from '@/lib/cee/catalogue'
import { formatNumber } from '@/lib/data/commune-data'
import SimulateurCTA from '@/components/cee/SimulateurCTA'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PrimesCEEBlockProps = {
  serviceSlug: string
  serviceName: string
  villeName: string
  communeData: CommuneData | null
}

// ---------------------------------------------------------------------------
// Revenue bracket thresholds (hors Île-de-France, 1 personne — barème 2026)
// ---------------------------------------------------------------------------

type RevenuBracket = 'précaire' | 'modeste' | 'intermédiaire' | 'supérieur'

function getRevenuBracket(revenuMedian: number | null): RevenuBracket {
  if (revenuMedian == null) return 'intermédiaire' // safe default
  if (revenuMedian <= 17009) return 'précaire'
  if (revenuMedian <= 21805) return 'modeste'
  if (revenuMedian <= 30549) return 'intermédiaire'
  return 'supérieur'
}

const BRACKET_LABELS: Record<RevenuBracket, { label: string; color: string; primeLevel: string }> =
  {
    précaire: {
      label: 'Ménages très modestes',
      color: 'text-accent-700 bg-accent-100',
      primeLevel: 'maximale',
    },
    modeste: {
      label: 'Ménages modestes',
      color: 'text-green-700 bg-green-100',
      primeLevel: 'majorée',
    },
    intermédiaire: {
      label: 'Ménages intermédiaires',
      color: 'text-amber-700 bg-amber-100',
      primeLevel: 'standard',
    },
    supérieur: {
      label: 'Ménages supérieurs',
      color: 'text-charcoal-600 bg-sand-100',
      primeLevel: 'réduite',
    },
  }

function getClimatZoneLabel(zone: string | null): string {
  const labels: Record<string, string> = {
    oceanique: 'zone H2 (océanique)',
    continental: 'zone H1 (continental)',
    mediterraneen: 'zone H3 (méditerranéen)',
    montagnard: 'zone H1 (montagnard)',
    'semi-oceanique': 'zone H2 (semi-océanique)',
  }
  return zone ? (labels[zone] ?? zone) : 'non déterminée'
}

function getClimatMultiplier(zone: string | null): number {
  // H1 (continental/montagnard) = primes plus élevées, H3 (méditerranéen) = plus basses
  if (zone === 'continental' || zone === 'montagnard') return 1.15
  if (zone === 'mediterraneen') return 0.85
  return 1.0
}

/** Estimate annual energy savings based on bracket + climate zone + service type */
function getEstimatedSavings(
  bracket: RevenuBracket,
  climatZone: string | null,
  serviceName: string
): { economieAnnuelle: string; gainDPE: string } | null {
  const s = serviceName.toLowerCase()

  // Base savings by service type (annual €)
  let baseSaving = 0
  let dpeGain = ''

  if (s.includes('isolation')) {
    baseSaving = 800
    dpeGain = '2 à 3 classes DPE'
  } else if (s.includes('chauffag') || s.includes('pompe')) {
    baseSaving = 1200
    dpeGain = '1 à 2 classes DPE'
  } else if (s.includes('menuisier') || s.includes('fenêtr')) {
    baseSaving = 400
    dpeGain = '1 classe DPE'
  } else if (s.includes('couv') || s.includes('charpent')) {
    baseSaving = 600
    dpeGain = '1 à 2 classes DPE'
  } else if (s.includes('plomb')) {
    baseSaving = 350
    dpeGain = '0,5 à 1 classe DPE'
  } else {
    return null // No relevant savings estimate for this service
  }

  // Climate adjustment: colder zones = more savings potential
  const climatMult =
    climatZone === 'continental' || climatZone === 'montagnard'
      ? 1.3
      : climatZone === 'mediterraneen'
        ? 0.7
        : 1.0

  // Bracket adjustment: lower income = higher eligible aid ratio
  const bracketMult =
    bracket === 'précaire' ? 1.2 : bracket === 'modeste' ? 1.1 : bracket === 'supérieur' ? 0.8 : 1.0

  const finalSaving = Math.round(baseSaving * climatMult * bracketMult)

  return {
    economieAnnuelle: `${formatNumber(finalSaving)}\u00A0\u20AC/an`,
    gainDPE: dpeGain,
  }
}

/** Generate contextual savings text */
function getSavingsContext(
  bracket: RevenuBracket,
  climatZone: string | null,
  serviceName: string,
  villeName: string
): string | null {
  const savings = getEstimatedSavings(bracket, climatZone, serviceName)
  if (!savings) return null

  const s = serviceName.toLowerCase()
  const bracketLabel =
    bracket === 'précaire' || bracket === 'modeste'
      ? 'les foyers modestes peuvent bénéficier d’une prise en charge allant jusqu’\u00E0 90\u00A0% du coût des travaux'
      : bracket === 'intermédiaire'
        ? 'les foyers aux revenus intermédiaires bénéficient d’une aide couvrant 40 à 60\u00A0% du coût'
        : 'les foyers aux revenus supérieurs accèdent à une prime CEE de base'

  return `À ${villeName}, ${bracketLabel}. Les travaux de ${s} permettent une économie estimée à ${savings.economieAnnuelle} sur la facture énergétique, avec un gain potentiel de ${savings.gainDPE}.`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default async function PrimesCEEBlock({
  serviceSlug,
  serviceName,
  villeName,
  communeData,
}: PrimesCEEBlockProps) {
  // Fetch all CEE operations and filter by service
  const allOperations = await getCeeOperations()
  const eligibleOps = allOperations.filter((op: CeeOperation) =>
    op.services_slugs.includes(serviceSlug)
  )

  if (eligibleOps.length === 0) return null

  const bracket = getRevenuBracket(communeData?.revenu_median ?? null)
  const bracketInfo = BRACKET_LABELS[bracket]
  const climatZone = communeData?.climat_zone ?? null
  const climatLabel = getClimatZoneLabel(climatZone)
  const climatMultiplier = getClimatMultiplier(climatZone)

  // Display max 5 operations
  const displayedOps = eligibleOps.slice(0, 5)

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-accent-600" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-900">
          Primes CEE pour {serviceName.toLowerCase()} à {villeName}
        </h3>
      </div>

      {/* Revenue bracket + climate zone context */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bracketInfo.color}`}
        >
          {bracketInfo.label}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-charcoal-700 bg-sand-200">
          Climat {climatLabel}
        </span>
      </div>

      {communeData?.revenu_median && (
        <p className="text-sm text-charcoal-600 mb-4">
          Avec un revenu médian de {formatNumber(communeData.revenu_median)}
          {'\u00A0'}€/an à {villeName}, les foyers bénéficient d{"'"}une prime CEE{' '}
          <strong>{bracketInfo.primeLevel}</strong>.
          {climatMultiplier > 1 &&
            ' Le climat continental/montagnard de la zone majore les montants.'}
          {climatMultiplier < 1 &&
            ' Le climat méditerranéen de la zone réduit légèrement les montants.'}
        </p>
      )}

      {/* Estimated savings context */}
      {(() => {
        const savingsText = getSavingsContext(bracket, climatZone, serviceName, villeName)
        if (!savingsText) return null
        return (
          <div className="p-3 rounded-lg bg-accent-50 border border-accent-100 mb-4">
            <div className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-accent-800 leading-relaxed">{savingsText}</p>
            </div>
          </div>
        )
      })()}

      {/* Operations list */}
      <div className="space-y-3">
        {displayedOps.map((op: CeeOperation) => {
          const domaineLabel = CEE_DOMAINE_LABELS[op.domaine]?.label ?? op.domaine
          return (
            <div
              key={op.code}
              className="flex items-start gap-3 p-3 rounded-lg bg-sand-50 border border-sand-100"
            >
              <div className="flex-shrink-0 mt-1">
                {op.domaine === 'enveloppe' ? (
                  <Leaf className="w-4 h-4 text-accent-500" aria-hidden="true" />
                ) : (
                  <Euro className="w-4 h-4 text-primary-500" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-charcoal-900">{op.nom}</span>
                  <span className="text-xs text-charcoal-400">{op.code}</span>
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">{domaineLabel}</p>
                {op.description && (
                  <p className="text-sm text-charcoal-600 mt-1 line-clamp-2">{op.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {op.coup_de_pouce && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-amber-700 bg-amber-50">
                      Coup de pouce
                    </span>
                  )}
                  {op.precarite_eligible && bracket === 'précaire' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-accent-700 bg-accent-50">
                      Bonification précarité
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {eligibleOps.length > 5 && (
        <p className="text-sm text-charcoal-500 mt-3">
          Et {eligibleOps.length - 5} autre{eligibleOps.length - 5 > 1 ? 's' : ''} opération
          {eligibleOps.length - 5 > 1 ? 's' : ''} éligible{eligibleOps.length - 5 > 1 ? 's' : ''}.
        </p>
      )}

      {/* CTAs — devis dominant (BOFU intent) + simulateur secondaire + guide tertiaire */}
      <div className="mt-4 pt-4 border-t border-sand-200 space-y-3">
        <Link
          href={`/devis/${serviceSlug}`}
          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-primary-500 text-white font-semibold shadow-md hover:bg-primary-600 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 focus-visible:outline-none"
        >
          Devis gratuit {serviceName.toLowerCase()} à {villeName}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <SimulateurCTA variant="inline" serviceSlug={serviceSlug} city={villeName} />
          {displayedOps.slice(0, 3).map((op) => (
            <a
              key={op.code}
              href={`/cee/${op.code.toLowerCase()}/guide`}
              className="font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Guide {op.code}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
