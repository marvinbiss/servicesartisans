/**
 * ContexteDPEBlock — Bloc passoires énergétiques DPE contextualisé ville+service.
 *
 * Affiche le % de passoires énergétiques et le nombre total de DPE,
 * avec un message liant la situation au service de la page.
 *
 * Server Component — pas de 'use client'.
 */

import { Thermometer, Home, TrendingUp, Zap } from 'lucide-react'
import type { CommuneData } from '@/lib/data/commune-data'
import { formatNumber } from '@/lib/data/commune-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContexteDPEBlockProps {
  communeData: CommuneData | null
  serviceName: string
  villeName: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDPESeverity(pct: number): { label: string; color: string } {
  if (pct >= 30) return { label: 'Critique', color: 'text-red-700 bg-red-100' }
  if (pct >= 15) return { label: 'Élevé', color: 'text-amber-700 bg-amber-100' }
  return { label: 'Modéré', color: 'text-green-700 bg-green-100' }
}

function getServiceDPEContext(serviceName: string, pct: number, villeName: string): string {
  const s = serviceName.toLowerCase()

  if (s.includes('isolation') || s.includes('plaquiste')) {
    return `Avec ${pct}\u00A0% de passoires énergétiques à ${villeName}, l'isolation thermique est une priorité absolue. Les travaux d'isolation permettent de gagner 2 à 3 classes DPE et de réduire la facture énergétique de 30 à 60\u00A0%.`
  }
  if (s.includes('chauffag') || s.includes('pompe')) {
    return `${pct}\u00A0% des logements à ${villeName} sont des passoires énergétiques. Le remplacement du système de chauffage par une solution performante (PAC, chaudière à condensation) est un levier majeur pour améliorer le DPE.`
  }
  if (s.includes('menuisier') || s.includes('fenêtr')) {
    return `${pct}\u00A0% de passoires énergétiques à ${villeName} signifient une forte demande de remplacement de menuiseries. Le passage au double ou triple vitrage améliore significativement le DPE.`
  }
  if (s.includes('couv') || s.includes('charpent')) {
    return `${pct}\u00A0% des logements de ${villeName} sont mal classés au DPE. L'isolation de la toiture (30\u00A0% des déperditions thermiques) est souvent la première intervention recommandée.`
  }
  if (s.includes('plomb')) {
    return `${pct}\u00A0% de passoires énergétiques à ${villeName} incluent souvent des systèmes d'eau chaude vétustes. Un plombier peut installer un chauffe-eau thermodynamique pour améliorer le DPE.`
  }
  if (s.includes('électric')) {
    return `${pct}\u00A0% de passoires énergétiques à ${villeName} nécessitent souvent une mise aux normes électrique lors de la rénovation globale. L'éclairage LED et la domotique contribuent aussi au DPE.`
  }

  return `${pct}\u00A0% des logements à ${villeName} sont des passoires énergétiques (DPE F ou G), ce qui rend les travaux de ${s} particulièrement pertinents dans le cadre de la rénovation énergétique.`
}

/** Generate renovation demand context based on DPE + housing stock + MaPrimeRénov */
function getRenovationDemandContext(
  communeData: CommuneData,
  serviceName: string,
  villeName: string
): string | null {
  const parts: string[] = []
  const s = serviceName.toLowerCase()

  // MaPrimeRénov context
  if (communeData.nb_maprimerenov_annuel && communeData.nb_maprimerenov_annuel > 0) {
    parts.push(
      `${formatNumber(communeData.nb_maprimerenov_annuel)} dossiers MaPrimeRénov’ sont déposés chaque année à ${villeName}, témoignant d’une dynamique active de rénovation énergétique`
    )
  }

  // Housing stock age inference from DPE severity
  const pct = communeData.pct_passoires_dpe ?? 0
  if (pct >= 25 && communeData.nb_logements) {
    const nbPassoires = Math.round((pct / 100) * communeData.nb_logements)
    parts.push(
      `environ ${formatNumber(nbPassoires)} logements nécessitent des travaux de rénovation, créant une demande soutenue en ${s}`
    )
  }

  // Housing type impact on DPE
  if (communeData.part_maisons_pct != null && pct > 0) {
    if (communeData.part_maisons_pct >= 60) {
      parts.push(
        `les maisons individuelles (${communeData.part_maisons_pct}\u00A0% du parc) sont souvent les plus énergivores en raison de leur surface de déperdition thermique plus importante`
      )
    } else if (communeData.part_maisons_pct < 40) {
      parts.push(
        `les immeubles collectifs (${100 - communeData.part_maisons_pct}\u00A0% du parc) concentrent les rénovations en copropriété, souvent plus complexes à organiser`
      )
    }
  }

  if (parts.length === 0) return null
  return parts.join('. De plus, ') + '.'
}

/** Generate recommendation based on DPE severity and service type */
function getDPERecommendation(
  serviceName: string,
  pct: number,
  revenuMedian: number | null
): string | null {
  const s = serviceName.toLowerCase()

  // High severity: recommend audit first
  if (pct >= 25) {
    const aidePart =
      revenuMedian != null && revenuMedian <= 21805
        ? ' Les ménages de cette commune peuvent prétendre aux aides maximales (MaPrimeRénov’ Sérénité + CEE bonifiés).'
        : revenuMedian != null && revenuMedian <= 30549
          ? ' Les aides MaPrimeRénov’ et CEE sont accessibles pour la majorité des foyers.'
          : ''
    if (
      s.includes('isolation') ||
      s.includes('chauffag') ||
      s.includes('pompe') ||
      s.includes('menuisier')
    ) {
      return `Recommandation\u00A0: avec un taux de passoires aussi élevé, un audit énergétique préalable permet de prioriser les travaux de ${s} les plus rentables.${aidePart}`
    }
    return `Avec ce taux de logements mal classés, les travaux de ${s} s’inscrivent souvent dans un projet de rénovation énergétique globale.${aidePart}`
  }

  return null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ContexteDPEBlock({
  communeData,
  serviceName,
  villeName,
}: ContexteDPEBlockProps) {
  if (!communeData) return null

  const pct = communeData.pct_passoires_dpe
  const total = communeData.nb_dpe_total

  // Show only if data exists and is meaningful
  if (!pct || pct <= 0 || !total || total <= 0) return null

  const severity = getDPESeverity(pct)
  const contextText = getServiceDPEContext(serviceName, pct, villeName)

  // Compute estimated number of passoires
  const nbPassoires = Math.round((pct / 100) * total)

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Thermometer className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal-900">
          Performance énergétique à {villeName}
        </h3>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-100 text-center">
          <p className="text-2xl font-bold text-charcoal-900">
            {pct}
            {'\u00A0'}%
          </p>
          <p className="text-xs text-charcoal-500 mt-0.5">Passoires énergétiques</p>
        </div>
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-100 text-center">
          <p className="text-2xl font-bold text-charcoal-900">{formatNumber(total)}</p>
          <p className="text-xs text-charcoal-500 mt-0.5">DPE réalisés</p>
        </div>
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-100 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-charcoal-900">~{formatNumber(nbPassoires)}</p>
          <p className="text-xs text-charcoal-500 mt-0.5">Logements F ou G estimés</p>
        </div>
      </div>

      {/* Severity badge + context */}
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${severity.color} flex-shrink-0 mt-0.5`}
        >
          <Home className="w-3 h-3 mr-1" />
          {severity.label}
        </span>
        <p className="text-sm text-charcoal-700 leading-relaxed">{contextText}</p>
      </div>

      {/* Renovation demand context — MaPrimeRénov + housing stock */}
      {(() => {
        const demandContext = getRenovationDemandContext(communeData, serviceName, villeName)
        if (!demandContext) return null
        return (
          <div className="flex items-start gap-3 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-charcoal-700 leading-relaxed">{demandContext}</p>
          </div>
        )
      })()}

      {/* DPE recommendation */}
      {(() => {
        const recommendation = getDPERecommendation(serviceName, pct, communeData.revenu_median)
        if (!recommendation) return null
        return (
          <div className="flex items-start gap-3 mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-relaxed">{recommendation}</p>
          </div>
        )
      })()}
    </section>
  )
}
