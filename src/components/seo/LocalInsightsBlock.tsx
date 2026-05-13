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
  density: number | null
): { label: string; color: string; description: string } {
  const d = density ?? population / 50 // rough fallback
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
  serviceName: string
): string | null {
  if (partMaisonsPct != null) {
    if (partMaisonsPct >= 70) {
      return `Avec ${partMaisonsPct}\u00A0% de maisons individuelles, les interventions de ${serviceName.toLowerCase()} concernent majoritairement des logements individuels (toiture, jardin, façade, accès direct).`
    }
    if (partMaisonsPct >= 40) {
      return `Le parc immobilier est mixte (${partMaisonsPct}\u00A0% de maisons, ${100 - partMaisonsPct}\u00A0% d'appartements), impliquant une diversité d'interventions de ${serviceName.toLowerCase()} : copropriétés et maisons individuelles.`
    }
    return `Avec ${100 - partMaisonsPct}\u00A0% d'appartements, les interventions de ${serviceName.toLowerCase()} se font souvent en copropriété, avec des contraintes d'accès et de règlement intérieur.`
  }

  // Fallback: infer from density
  if (density == null) return null
  if (density > 2000) {
    return `La forte densité urbaine (${formatNumber(Math.round(density))}\u00A0hab/km²) suggère une prédominance d'appartements. Les interventions de ${serviceName.toLowerCase()} s'effectuent souvent en immeuble.`
  }
  if (density < 200) {
    return `La faible densité (${formatNumber(Math.round(density))}\u00A0hab/km²) indique un habitat principalement individuel. Les travaux de ${serviceName.toLowerCase()} concernent surtout des maisons.`
  }
  return null
}

/** Get regional price positioning text */
function getPricePositioning(multiplier: number, regionName: string | null): string | null {
  if (multiplier === 1) return null
  const pct = Math.abs(Math.round((multiplier - 1) * 100))
  const direction = multiplier > 1 ? 'au-dessus' : 'en-dessous'
  const regionLabel = regionName ?? 'cette région'
  return `Les tarifs à ${regionLabel} sont ${pct}\u00A0% ${direction} de la moyenne nationale`
}

/** Revenue impact insight — budget capacity for services */
function getRevenueInsight(
  revenuMedian: number | null,
  serviceName: string,
  villeName: string
): string | null {
  if (revenuMedian == null) return null
  const s = serviceName.toLowerCase()

  if (revenuMedian <= 17009) {
    return `Le revenu médian de ${formatNumber(revenuMedian)}\u00A0\u20AC/an à ${villeName} classe la commune parmi les territoires éligibles aux aides maximales. Pour les travaux de ${s}, cela signifie un reste à charge réduit grâce à MaPrimeRénov’ Sérénité et aux CEE bonifiés.`
  }
  if (revenuMedian <= 21805) {
    return `Avec un revenu médian de ${formatNumber(revenuMedian)}\u00A0\u20AC/an, les habitants de ${villeName} accèdent aux aides renforcées pour les travaux de ${s} (MaPrimeRénov’ jaune/bleu + primes CEE majorées).`
  }
  if (revenuMedian >= 35000) {
    return `Le revenu médian élevé (${formatNumber(revenuMedian)}\u00A0\u20AC/an) indique une capacité d’investissement supérieure pour les travaux de ${s}, avec une préférence fréquente pour des prestations haut de gamme et des matériaux durables.`
  }
  return null
}

/** Real estate market dynamics insight */
function getImmobilierInsight(communeData: CommuneData, serviceName: string): string | null {
  const s = serviceName.toLowerCase()
  const parts: string[] = []

  if (communeData.nb_transactions_annuelles && communeData.nb_transactions_annuelles > 50) {
    parts.push(
      `${formatNumber(communeData.nb_transactions_annuelles)} transactions immobilières par an génèrent une demande régulière en travaux de ${s} (remise aux normes, aménagements après achat)`
    )
  }

  if (communeData.prix_m2_maison && communeData.prix_m2_appartement) {
    const ecart = Math.abs(communeData.prix_m2_maison - communeData.prix_m2_appartement)
    if (ecart > 500) {
      const plusCher =
        communeData.prix_m2_maison > communeData.prix_m2_appartement ? 'maisons' : 'appartements'
      parts.push(
        `les ${plusCher} affichent un prix au m² nettement supérieur, ce qui incite les propriétaires à investir dans l’entretien et la valorisation de leur bien`
      )
    }
  } else if (communeData.prix_m2_moyen && communeData.prix_m2_moyen > 3000) {
    parts.push(
      `avec un prix moyen de ${formatNumber(communeData.prix_m2_moyen)}\u00A0\u20AC/m², les propriétaires ont intérêt à maintenir la valeur de leur bien par des travaux de ${s} réguliers`
    )
  }

  if (parts.length === 0) return null
  return parts.join('. De plus, ') + '.'
}

/** RGE artisan coverage insight */
function getRGEInsight(
  communeData: CommuneData,
  serviceName: string,
  villeName: string
): string | null {
  if (!communeData.nb_artisans_rge || communeData.nb_artisans_rge <= 0) return null
  const s = serviceName.toLowerCase()

  const coverage =
    communeData.nb_artisans_btp && communeData.nb_artisans_btp > 0
      ? Math.round((communeData.nb_artisans_rge / communeData.nb_artisans_btp) * 100)
      : null

  let text = `${formatNumber(communeData.nb_artisans_rge)} artisans certifiés RGE exercent à ${villeName}`

  if (coverage != null) {
    text += `, soit ${coverage}\u00A0% des entreprises BTP de la commune`
    if (coverage < 20) {
      text += `. Ce ratio relativement faible allonge les délais pour les travaux de ${s} éligibles aux aides.`
    } else if (coverage > 50) {
      text += `. Cette forte proportion facilite l’accès aux aides publiques pour les travaux de ${s}.`
    } else {
      text += '.'
    }
  } else {
    text += `, ce qui garantit l’accès aux aides publiques pour les travaux de ${s}.`
  }

  return text
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
        .map((q) => q.name)
    }
  } catch {
    // quartier-data may not have entries for this ville
  }

  // Additional insights
  const revenueInsight = getRevenueInsight(c.revenu_median, serviceName, villeName)
  const immobilierInsight = getImmobilierInsight(c, serviceName)
  const rgeInsight = getRGEInsight(c, serviceName, villeName)

  // Check if we have enough data for at least 2 insights
  const insightCount = [
    true, // demand is always available if we have population
    !!housingInsight,
    !!pricePositioning,
    topQuartiers.length > 0,
    !!c.nb_entreprises_artisanales,
    !!revenueInsight,
    !!immobilierInsight,
    !!rgeInsight,
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
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${demand.color} flex-shrink-0 mt-0.5`}
              >
                Demande {demand.label.toLowerCase()}
              </span>
              <p className="text-sm text-charcoal-700 leading-relaxed">
                Avec une population de {formatNumber(c.population)}
                {'\u00A0'}habitants
                {c.densite_population != null && (
                  <>
                    {' '}
                    et une densit{'é'} de {formatNumber(Math.round(c.densite_population))}
                    {'\u00A0'}hab/km{'²'}
                  </>
                )}
                , {villeName} pr{'é'}sente une demande <strong>{demand.description}</strong> en{' '}
                {serviceName.toLowerCase()}.
                {providerCount != null && providerCount > 0 && (
                  <>
                    {' '}
                    Actuellement, {providerCount} professionnel{providerCount > 1 ? 's' : ''} r{'é'}
                    f{'é'}renc{'é'}
                    {providerCount > 1 ? 's' : ''} couvrent cette zone.
                  </>
                )}
              </p>
            </div>

            {/* 2. Price positioning */}
            {pricePositioning && (
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5 ${
                    regionalMultiplier > 1
                      ? 'text-red-700 bg-red-100'
                      : 'text-green-700 bg-green-100'
                  }`}
                >
                  {regionalMultiplier > 1 ? 'Prix sup.' : 'Prix inf.'}
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {pricePositioning}.
                  {c.revenu_median && (
                    <>
                      {' '}
                      Le revenu m{'é'}dian local ({formatNumber(c.revenu_median)}
                      {'\u00A0'}
                      {'€'}/an){' '}
                      {c.revenu_median > 25000
                        ? 'soutient une demande régulière de prestations de qualité'
                        : 'favorise l’accès aux aides publiques (MaPrimeRénov’, CEE)'}
                      .
                    </>
                  )}
                </p>
              </div>
            )}

            {/* 3. Housing type impact */}
            {housingInsight && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-primary-600 bg-primary-100 flex-shrink-0 mt-0.5">
                  Logement
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">{housingInsight}</p>
              </div>
            )}

            {/* 4. Local artisan market */}
            {c.nb_entreprises_artisanales && c.nb_entreprises_artisanales > 0 && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-purple-700 bg-purple-100 flex-shrink-0 mt-0.5">
                  March{'é'}
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">
                  {formatNumber(c.nb_entreprises_artisanales)} entreprises artisanales sont r{'é'}f
                  {'é'}renc{'é'}es {'à'} {villeName}
                  {c.nb_artisans_btp ? `, dont ${formatNumber(c.nb_artisans_btp)} dans le BTP` : ''}
                  .
                  {c.nb_entreprises_artisanales > 500
                    ? ' La concurrence soutenue maintient des tarifs compétitifs.'
                    : c.nb_entreprises_artisanales > 100
                      ? ' Le marché offre un choix raisonnable de professionnels.'
                      : ' Le nombre limité de professionnels peut impacter les délais et les tarifs.'}
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
                  Zones les plus demand{'é'}es {'à'} {villeName}
                  {'\u00A0'}: <strong>{topQuartiers.join(', ')}</strong>. La demande en{' '}
                  {serviceName.toLowerCase()} y est plus {'é'}lev{'é'}e en raison de la densit{'é'}{' '}
                  de population et du parc immobilier.
                </p>
              </div>
            )}

            {/* 6. Revenue / aids eligibility */}
            {revenueInsight && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-accent-700 bg-accent-100 flex-shrink-0 mt-0.5">
                  Budget
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">{revenueInsight}</p>
              </div>
            )}

            {/* 7. Immobilier / DVF dynamics */}
            {immobilierInsight && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-100 flex-shrink-0 mt-0.5">
                  Immobilier
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">{immobilierInsight}</p>
              </div>
            )}

            {/* 8. RGE artisan coverage */}
            {rgeInsight && (
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-100 flex-shrink-0 mt-0.5">
                  RGE
                </span>
                <p className="text-sm text-charcoal-700 leading-relaxed">{rgeInsight}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
