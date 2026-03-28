/**
 * LocalInsightsBlock — Bloc d'insights locaux spécifiques à une ville+service.
 *
 * Utilise les données INSEE (commune-data) et les données de quartier pour générer
 * du contenu réellement différenciant par ville : demande locale, positionnement tarifaire,
 * impact du type de logement, quartiers les plus demandés.
 *
 * Server Component — pas de 'use client'.
 */

import { MapPin } from 'lucide-react'
import type { CommuneData } from '@/lib/data/commune-data'
import { formatNumber } from '@/lib/data/commune-data'
import { getQuartierProfilesByVille } from '@/lib/data/quartier-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocalInsightsBlockProps {
  communeData: CommuneData | null
  serviceSlug: string
  serviceName: string
  villeName: string
  villeSlug: string
  providerCount?: number
  regionalMultiplier?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Classify demand level from population + density */
function getDemandLevel(
  population: number,
  density: number | null,
): { label: string; color: string; description: string } {
  const d = density ?? (population / 50) // rough fallback
  if (population > 200000 || d > 3000) {
    return {
      label: 'Forte',
      color: 'text-green-700 bg-green-100',
      description: 'forte',
    }
  }
  if (population > 30000 || d > 500) {
    return {
      label: 'Modérée',
      color: 'text-amber-700 bg-amber-100',
      description: 'modérée',
    }
  }
  return {
    label: 'Faible',
    color: 'text-red-700 bg-red-100',
    description: 'faible',
  }
}

/** Infer housing split from density */
function getHousingInsight(
  partMaisonsPct: number | null,
  density: number | null,
  serviceName: string,
): string | null {
  if (partMaisonsPct != null) {
    if (partMaisonsPct >= 70) {
      return `Avec ${partMaisonsPct}\u00A0% de maisons individuelles, les interventions de ${serviceName.toLowerCase()} concernent majoritairement des logements individuels (toiture, jardin, fa\u00E7ade, acc\u00E8s direct).`
    }
    if (partMaisonsPct >= 40) {
      return `Le parc immobilier est mixte (${partMaisonsPct}\u00A0% de maisons, ${100 - partMaisonsPct}\u00A0% d'appartements), impliquant une diversit\u00E9 d'interventions de ${serviceName.toLowerCase()} : copropri\u00E9t\u00E9s et maisons individuelles.`
    }
    return `Avec ${100 - partMaisonsPct}\u00A0% d'appartements, les interventions de ${serviceName.toLowerCase()} se font souvent en copropri\u00E9t\u00E9, avec des contraintes d'acc\u00E8s et de r\u00E8glement int\u00E9rieur.`
  }

  // Fallback: infer from density
  if (density == null) return null
  if (density > 2000) {
    return `La forte densit\u00E9 urbaine (${formatNumber(Math.round(density))}\u00A0hab/km\u00B2) sugg\u00E8re une pr\u00E9dominance d'appartements. Les interventions de ${serviceName.toLowerCase()} s'effectuent souvent en immeuble.`
  }
  if (density < 200) {
    return `La faible densit\u00E9 (${formatNumber(Math.round(density))}\u00A0hab/km\u00B2) indique un habitat principalement individuel. Les travaux de ${serviceName.toLowerCase()} concernent surtout des maisons.`
  }
  return null
}

/** Get regional price positioning text */
function getPricePositioning(multiplier: number, regionName: string | null): string | null {
  if (multiplier === 1) return null
  const pct = Math.abs(Math.round((multiplier - 1) * 100))
  const direction = multiplier > 1 ? 'au-dessus' : 'en-dessous'
  const regionLabel = regionName ?? 'cette r\u00E9gion'
  return `Les tarifs \u00E0 ${regionLabel} sont ${pct}\u00A0% ${direction} de la moyenne nationale`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LocalInsightsBlock({
  communeData,
  serviceSlug,
  serviceName,
  villeName,
  villeSlug,
  providerCount,
  regionalMultiplier = 1,
}: LocalInsightsBlockProps) {
  // Need at least population to render anything meaningful
  if (!communeData || !communeData.population) return null

  const c = communeData
  const demand = getDemandLevel(c.population, c.densite_population)
  const housingInsight = getHousingInsight(c.part_maisons_pct, c.densite_population, serviceName)
  const pricePositioning = getPricePositioning(regionalMultiplier, c.region_name)

  // Quartier data — best-effort, never crash
  let topQuartiers: string[] = []
  try {
    const quartiers = getQuartierProfilesByVille(villeSlug)
    if (quartiers.length > 0) {
      // Sort by estimated population (proxy for demand) and take top 4
      topQuartiers = quartiers
        .sort((a, b) => b.populationEstimee - a.populationEstimee)
        .slice(0, 4)
        .map(q => q.name)
    }
  } catch {
    // quartier-data may not have entries for this ville
  }

  // Check if we have enough data for at least 2 insights
  const insightCount = [
    true, // demand is always available if we have population
    !!housingInsight,
    !!pricePositioning,
    topQuartiers.length > 0,
    !!c.nb_entreprises_artisanales,
  ].filter(Boolean).length

  if (insightCount < 2) return null

  // Suppress unused var warning
  void serviceSlug

  return (
    <section className="py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-sand-300 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 bg-sand-50 border-b border-sand-200">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-charcoal-900 text-lg">
                {serviceName} {'à'} {villeName} : contexte local
              </h3>
              <p className="text-xs text-charcoal-500">
                Donn{'é'}es INSEE et march{'é'} local
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="px-6 py-5 space-y-4">
            {/* 1. Demand level */}
            <div className="flex items-start gap-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${demand.color} flex-shrink-0 mt-0.5`}>
                Demande {demand.label.toLowerCase()}
              </span>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Avec une population de {formatNumber(c.population)}{'\u00A0'}habitants
                {c.densite_population != null && (
                  <> et une densit{'é'} de {formatNumber(Math.round(c.densite_population))}{'\u00A0'}hab/km{'²'}</>
                )}
                , {villeName} pr{'é'}sente une demande <strong>{demand.description}</strong> en {serviceName.toLowerCase()}.
                {providerCount != null && providerCount > 0 && (
                  <> Actuellement, {providerCount} professionnel{providerCount > 1 ? 's' : ''} r{'é'}f{'é'}renc{'é'}{providerCount > 1 ? 's' : ''} couvrent cette zone.</>
                )}
              </p>
            </div>

            {/* 2. Price positioning */}
            {pricePositioning && (
              <div className="flex items-start gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${
                  regionalMultiplier > 1 ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'
                }`}>
                  {regionalMultiplier > 1 ? 'Prix sup.' : 'Prix inf.'}
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {pricePositioning}.
                  {c.revenu_median && (
                    <> Le revenu m{'é'}dian local ({formatNumber(c.revenu_median)}{'\u00A0'}{'€'}/an) {
                      c.revenu_median > 25000
                        ? 'soutient une demande r\u00E9guli\u00E8re de prestations de qualit\u00E9'
                        : 'favorise l\u2019acc\u00E8s aux aides publiques (MaPrimeR\u00E9nov\u2019, CEE)'
                    }.</>
                  )}
                </p>
              </div>
            )}

            {/* 3. Housing type impact */}
            {housingInsight && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100 flex-shrink-0 mt-0.5">
                  Logement
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {housingInsight}
                </p>
              </div>
            )}

            {/* 4. Local artisan market */}
            {c.nb_entreprises_artisanales && c.nb_entreprises_artisanales > 0 && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-100 flex-shrink-0 mt-0.5">
                  March{'é'}
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {formatNumber(c.nb_entreprises_artisanales)} entreprises artisanales sont r{'é'}f{'é'}renc{'é'}es {'à'} {villeName}
                  {c.nb_artisans_btp ? `, dont ${formatNumber(c.nb_artisans_btp)} dans le BTP` : ''}.
                  {c.nb_entreprises_artisanales > 500
                    ? ' La concurrence soutenue maintient des tarifs comp\u00E9titifs.'
                    : c.nb_entreprises_artisanales > 100
                      ? ' Le march\u00E9 offre un choix raisonnable de professionnels.'
                      : ' Le nombre limit\u00E9 de professionnels peut impacter les d\u00E9lais et les tarifs.'}
                </p>
              </div>
            )}

            {/* 5. Top quartiers */}
            {topQuartiers.length > 0 && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-teal-700 bg-teal-100 flex-shrink-0 mt-0.5">
                  Quartiers
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  Zones les plus demand{'é'}es {'à'} {villeName}{'\u00A0'}: <strong>{topQuartiers.join(', ')}</strong>.
                  {' '}La demande en {serviceName.toLowerCase()} y est plus {'é'}lev{'é'}e en raison de la densit{'é'} de population et du parc immobilier.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
