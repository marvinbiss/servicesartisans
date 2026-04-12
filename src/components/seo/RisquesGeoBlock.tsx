/**
 * RisquesGeoBlock — Bloc de risques géologiques/naturels contextualisés service+ville.
 *
 * Affiche les risques pertinents (argile, sismique, radon, catnat) avec un message
 * liant chaque risque au service de la page pSEO.
 *
 * Server Component — pas de 'use client'.
 */

import { AlertTriangle, Shield, Activity, Radio } from 'lucide-react'
import type { CommuneData } from '@/lib/data/commune-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RisquesGeoBlockProps {
  communeData: CommuneData | null
  serviceName: string
  villeName: string
}

interface RiskItem {
  icon: React.ReactNode
  label: string
  level: string
  levelColor: string
  description: string
}

// ---------------------------------------------------------------------------
// Helpers — contextualize risk × service
// ---------------------------------------------------------------------------

function getArgileAdvice(serviceName: string): string {
  const s = serviceName.toLowerCase()
  if (s.includes('plomb'))
    return 'Les mouvements de terrain liés à l\u2019argile peuvent provoquer des ruptures de canalisations et des fuites souterraines.'
  if (s.includes('ma\u00E7on') || s.includes('macon'))
    return 'Le retrait-gonflement des argiles fragilise les fondations. Des fondations profondes et des joints de dilatation sont indispensables.'
  if (s.includes('carrel'))
    return 'Les mouvements de sol provoquent des fissures de carrelage. Un ragréage souple et des joints de dilatation sont recommandés.'
  if (s.includes('chauffag') || s.includes('pompe'))
    return 'Les mouvements de terrain peuvent affecter les réseaux enterrés de chauffage et les pompes à chaleur géothermiques.'
  if (s.includes('couv') || s.includes('charpent'))
    return 'Les mouvements de terrain déforment la structure et provoquent des désordres en toiture.'
  return `Les mouvements de terrain liés à l\u2019argile impactent le bâti et justifient le recours à un ${s} qualifié.`
}

function getSismiqueAdvice(serviceName: string, zone: number): string {
  const s = serviceName.toLowerCase()
  const severity = zone >= 4 ? 'élevée' : 'modérée'
  if (s.includes('plomb'))
    return `En zone sismique ${severity}, les canalisations souples (PER, multicouche) sont recommandées pour absorber les vibrations.`
  if (s.includes('ma\u00E7on') || s.includes('macon'))
    return `La zone sismique ${severity} impose des règles parasismiques (chaînages, ferraillage renforcé) pour toute construction ou extension.`
  if (s.includes('\u00E9lectric'))
    return `En zone sismique ${severity}, les tableaux électriques doivent être fixés selon les normes parasismiques pour éviter les courts-circuits.`
  return `La sismicité ${severity} (zone ${zone}/5) implique des précautions spécifiques pour les travaux de ${s}.`
}

function getRadonAdvice(serviceName: string, level: number): string {
  const s = serviceName.toLowerCase()
  const severity = level >= 3 ? 'élevé' : 'modéré'
  if (s.includes('plomb') || s.includes('ventil') || s.includes('chauffag'))
    return `Le potentiel radon ${severity} nécessite une ventilation performante (VMC, extracteurs) pour évacuer ce gaz radioactif naturel.`
  if (s.includes('ma\u00E7on') || s.includes('macon'))
    return `Le potentiel radon ${severity} impose une membrane anti-radon sous dalle et des systèmes de dépressurisation du sol.`
  return `Le potentiel radon ${severity} (catégorie ${level}/3) justifie des mesures d\u2019étanchéité et de ventilation lors des travaux de ${s}.`
}

function getCatnatAdvice(serviceName: string, count: number): string {
  return `Avec ${count} arrêtés de catastrophe naturelle recensés, ${serviceName.toLowerCase()} à cet endroit doit intégrer des matériaux et techniques résistants aux aléas récurrents.`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RisquesGeoBlock({
  communeData,
  serviceName,
  villeName,
}: RisquesGeoBlockProps) {
  if (!communeData) return null

  const c = communeData
  const hasArgile = c.risque_argile === 'fort'
  const hasSismique = (c.zone_sismique ?? 0) >= 3
  const hasRadon = (c.risque_radon ?? 0) >= 2
  const hasCatnat = (c.nb_catnat ?? 0) > 10

  // Show only if at least one risk condition is met
  if (!hasArgile && !hasSismique && !hasRadon && !hasCatnat) return null

  const risks: RiskItem[] = []

  if (hasArgile) {
    risks.push({
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: 'Retrait-gonflement des argiles',
      level: 'Fort',
      levelColor: 'text-red-700 bg-red-100',
      description: getArgileAdvice(serviceName),
    })
  }

  if (hasSismique) {
    const zone = c.zone_sismique ?? 3
    risks.push({
      icon: <Activity className="w-5 h-5 text-orange-600" />,
      label: `Zone sismique ${zone}/5`,
      level: zone >= 4 ? 'Élevée' : 'Modérée',
      levelColor: zone >= 4 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      description: getSismiqueAdvice(serviceName, zone),
    })
  }

  if (hasRadon) {
    const level = c.risque_radon ?? 2
    risks.push({
      icon: <Radio className="w-5 h-5 text-purple-600" />,
      label: `Potentiel radon catégorie ${level}/3`,
      level: level >= 3 ? 'Élevé' : 'Modéré',
      levelColor: level >= 3 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      description: getRadonAdvice(serviceName, level),
    })
  }

  if (hasCatnat) {
    risks.push({
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      label: `${c.nb_catnat} arrêtés CatNat`,
      level: (c.nb_catnat ?? 0) > 20 ? 'Très fréquent' : 'Fréquent',
      levelColor:
        (c.nb_catnat ?? 0) > 20 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      description: getCatnatAdvice(serviceName, c.nb_catnat ?? 0),
    })
  }

  // Max 4 items
  const displayedRisks = risks.slice(0, 4)

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
        Risques naturels à {villeName} : impact sur les travaux de {serviceName.toLowerCase()}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {displayedRisks.map((risk) => (
          <div
            key={risk.label}
            className="flex gap-3 p-4 rounded-lg bg-sand-50 border border-sand-200"
          >
            <div className="flex-shrink-0 mt-0.5">{risk.icon}</div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-charcoal-900">{risk.label}</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${risk.levelColor}`}
                >
                  {risk.level}
                </span>
              </div>
              <p className="text-sm text-charcoal-600 leading-relaxed">{risk.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
