/**
 * CommuneContextBlock — Bloc de contexte unique par commune combinant
 * plusieurs data points en prose naturelle.
 *
 * Objectif : générer un paragraphe véritablement unique par ville,
 * suffisamment riche pour différencier la page aux yeux de Google.
 *
 * Chaque phrase est conditionnelle et contextuelle au service.
 *
 * Server Component — pas de 'use client'.
 */

import { Building2 } from 'lucide-react'
import type { CommuneData } from '@/lib/data/commune-data'
import { formatNumber, formatEuro, monthName } from '@/lib/data/commune-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CommuneContextBlockProps {
  communeData: CommuneData | null
  serviceName: string
  villeName: string
}

// ---------------------------------------------------------------------------
// Helpers — sentence generators
// ---------------------------------------------------------------------------

function getIdentitySentence(c: CommuneData): string {
  const parts: string[] = []
  const gentileStr = c.gentile ? ` Les habitants, appelés les ${c.gentile},` : ''

  parts.push(
    `${c.name} (${c.departement_code}${c.departement_name ? ', ' + c.departement_name : ''})`
  )

  if (c.region_name) {
    parts[0] += `, en ${c.region_name},`
  }

  parts[0] += ` compte ${formatNumber(c.population)} habitants`

  if (c.densite_population != null) {
    parts[0] += ` pour une densit\u00E9 de ${formatNumber(Math.round(c.densite_population))}\u00A0hab/km\u00B2`
  }

  if (c.superficie_km2 != null) {
    parts[0] += ` sur ${c.superficie_km2.toFixed(1).replace('.', ',')}\u00A0km\u00B2`
  }

  parts[0] += '.'

  if (gentileStr) {
    parts.push(`${gentileStr} b\u00E9n\u00E9ficient d\u2019un cadre de vie`)
    if (c.altitude_moyenne != null && c.altitude_moyenne > 500) {
      parts[parts.length - 1] += ` en altitude (${Math.round(c.altitude_moyenne)}\u00A0m)`
    }
    parts[parts.length - 1] += '.'
  }

  return parts.join(' ')
}

function getHousingStockSentence(c: CommuneData, serviceName: string): string | null {
  if (!c.nb_logements && c.part_maisons_pct == null) return null
  const s = serviceName.toLowerCase()
  const parts: string[] = []

  if (c.nb_logements) {
    parts.push(`Le parc immobilier comprend ${formatNumber(c.nb_logements)} logements`)
  }

  if (c.part_maisons_pct != null) {
    const majMaison = c.part_maisons_pct >= 60
    if (parts.length > 0) {
      parts[0] += `, compos\u00E9 \u00E0 ${c.part_maisons_pct}\u00A0% de maisons individuelles`
      if (majMaison) {
        parts[0] += `. Cette pr\u00E9dominance de maisons implique des besoins sp\u00E9cifiques en ${s}\u00A0: toitures, fa\u00E7ades, jardins et acc\u00E8s individuels`
      } else {
        parts[0] += `. La proportion \u00E9lev\u00E9e d\u2019appartements (${100 - c.part_maisons_pct}\u00A0%) implique des interventions de ${s} en copropri\u00E9t\u00E9, avec leurs contraintes d\u2019acc\u00E8s et de r\u00E8glement`
      }
    } else {
      parts.push(
        majMaison
          ? `Avec ${c.part_maisons_pct}\u00A0% de maisons individuelles, les travaux de ${s} portent majoritairement sur l\u2019habitat individuel`
          : `Le parc immobilier est domin\u00E9 par les appartements (${100 - c.part_maisons_pct}\u00A0%), orientant les prestations de ${s} vers les copropri\u00E9t\u00E9s`
      )
    }
  }

  if (parts.length === 0) return null
  return parts.join('. ') + '.'
}

function getClimatSentence(c: CommuneData): string | null {
  const parts: string[] = []

  if (c.climat_zone) {
    const labels: Record<string, string> = {
      oceanique: 'oc\u00E9anique (doux et humide)',
      continental: 'continental (hivers froids, \u00E9t\u00E9s chauds)',
      mediterraneen: 'm\u00E9diterran\u00E9en (doux en hiver, sec en \u00E9t\u00E9)',
      montagnard: 'montagnard (hivers rigoureux, \u00E9t\u00E9s courts)',
      'semi-oceanique': 'semi-oc\u00E9anique (temp\u00E9r\u00E9)',
    }
    parts.push(`Le climat est ${labels[c.climat_zone] ?? c.climat_zone}`)
  }

  if (c.temperature_moyenne_hiver != null && c.temperature_moyenne_ete != null) {
    parts.push(
      `avec des temp\u00E9ratures moyennes de ${Math.round(c.temperature_moyenne_hiver)}\u00A0\u00B0C en hiver et ${Math.round(c.temperature_moyenne_ete)}\u00A0\u00B0C en \u00E9t\u00E9`
    )
  }

  if (c.jours_gel_annuels != null && c.jours_gel_annuels > 0) {
    parts.push(`${c.jours_gel_annuels} jours de gel par an`)
  }

  if (c.precipitation_annuelle != null) {
    parts.push(`${Math.round(c.precipitation_annuelle)}\u00A0mm de pr\u00E9cipitations annuelles`)
  }

  if (c.mois_travaux_ext_debut != null && c.mois_travaux_ext_fin != null) {
    const debut = monthName(c.mois_travaux_ext_debut)
    const fin = monthName(c.mois_travaux_ext_fin)
    if (debut && fin) {
      parts.push(
        `la p\u00E9riode id\u00E9ale pour les travaux ext\u00E9rieurs s\u2019\u00E9tend de ${debut} \u00E0 ${fin}`
      )
    }
  }

  if (parts.length === 0) return null

  // Join with commas then period
  return parts[0] + (parts.length > 1 ? ', ' + parts.slice(1).join(', ') : '') + '.'
}

function getRiskSummarySentence(c: CommuneData): string | null {
  const risks: string[] = []

  if (c.risque_argile === 'fort') risks.push('un retrait-gonflement des argiles marqu\u00E9')
  if (c.risque_inondation) risks.push('un risque d\u2019inondation identifi\u00E9')
  if ((c.zone_sismique ?? 0) >= 3) risks.push(`une sismicit\u00E9 de zone ${c.zone_sismique}/5`)
  if ((c.risque_radon ?? 0) >= 2) risks.push('une exposition au radon')

  if (risks.length === 0) return null

  const riskStr =
    risks.length === 1 ? risks[0] : risks.slice(0, -1).join(', ') + ' et ' + risks[risks.length - 1]

  const catnatSuffix =
    (c.nb_catnat ?? 0) > 5
      ? ` (${c.nb_catnat} arr\u00EAt\u00E9s de catastrophe naturelle recens\u00E9s)`
      : ''

  return `Sur le plan des risques naturels, la commune pr\u00E9sente ${riskStr}${catnatSuffix}.`
}

function getDPESummarySentence(c: CommuneData, serviceName: string): string | null {
  if (!c.pct_passoires_dpe || c.pct_passoires_dpe <= 0) return null
  const s = serviceName.toLowerCase()

  let sentence = `${c.pct_passoires_dpe}\u00A0% des logements sont class\u00E9s passoires \u00E9nerg\u00E9tiques (DPE F ou G)`

  if (c.nb_maprimerenov_annuel && c.nb_maprimerenov_annuel > 0) {
    sentence += `, et ${formatNumber(c.nb_maprimerenov_annuel)} dossiers MaPrimeR\u00E9nov\u2019 sont d\u00E9pos\u00E9s chaque ann\u00E9e`
  }

  sentence += `, ce qui alimente une demande soutenue en ${s}.`
  return sentence
}

function getEconomicSentence(c: CommuneData): string | null {
  const parts: string[] = []

  if (c.revenu_median != null) {
    parts.push(`un revenu m\u00E9dian de ${formatEuro(c.revenu_median)}/an`)
  }

  if (c.prix_m2_moyen != null) {
    parts.push(`un prix immobilier moyen de ${formatEuro(c.prix_m2_moyen)}/m\u00B2`)
  }

  if (c.nb_transactions_annuelles != null && c.nb_transactions_annuelles > 20) {
    parts.push(`${formatNumber(c.nb_transactions_annuelles)} transactions immobili\u00E8res par an`)
  }

  if (parts.length === 0) return null
  return `Le contexte \u00E9conomique local se caract\u00E9rise par ${parts.join(', ')}.`
}

function getArtisanMarketSentence(c: CommuneData, serviceName: string): string | null {
  if (!c.nb_entreprises_artisanales && !c.nb_artisans_rge) return null
  const s = serviceName.toLowerCase()
  const parts: string[] = []

  if (c.nb_entreprises_artisanales) {
    parts.push(`${formatNumber(c.nb_entreprises_artisanales)} entreprises artisanales`)
    if (c.nb_artisans_btp) {
      parts[0] += ` dont ${formatNumber(c.nb_artisans_btp)} dans le BTP`
    }
  }

  if (c.nb_artisans_rge) {
    parts.push(`${formatNumber(c.nb_artisans_rge)} certifi\u00E9es RGE`)
  }

  if (parts.length === 0) return null

  return `Le tissu artisanal local compte ${parts.join(', ')}, ce qui d\u00E9termine la concurrence et les d\u00E9lais pour les travaux de ${s}.`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CommuneContextBlock({
  communeData,
  serviceName,
  villeName,
}: CommuneContextBlockProps) {
  if (!communeData || !communeData.population) return null

  const c = communeData

  // Build sentences — each is independently null-safe
  const identity = getIdentitySentence(c)
  const housing = getHousingStockSentence(c, serviceName)
  const climat = getClimatSentence(c)
  const risks = getRiskSummarySentence(c)
  const dpe = getDPESummarySentence(c, serviceName)
  const economic = getEconomicSentence(c)
  const artisanMarket = getArtisanMarketSentence(c, serviceName)

  // Collect non-null sentences
  const sentences = [identity, housing, economic, climat, risks, dpe, artisanMarket].filter(
    (s): s is string => s != null
  )

  // Need at least 3 sentences for the block to be worthwhile
  if (sentences.length < 3) return null

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary-600" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-900">
          {serviceName} {'à'} {villeName} : portrait de la commune
        </h3>
      </div>

      <div className="prose prose-sm max-w-none text-charcoal-700 leading-relaxed">
        <p>{sentences.join(' ')}</p>
      </div>

      {/* Description from DB if available — often contains unique local info */}
      {c.description && (
        <p className="text-sm text-charcoal-600 leading-relaxed mt-3 italic">{c.description}</p>
      )}
    </section>
  )
}
