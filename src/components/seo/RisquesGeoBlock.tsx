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
    return 'Les mouvements de terrain liés à l’argile peuvent provoquer des ruptures de canalisations et des fuites souterraines.'
  if (s.includes('maçon') || s.includes('macon'))
    return 'Le retrait-gonflement des argiles fragilise les fondations. Des fondations profondes et des joints de dilatation sont indispensables.'
  if (s.includes('carrel'))
    return 'Les mouvements de sol provoquent des fissures de carrelage. Un ragréage souple et des joints de dilatation sont recommandés.'
  if (s.includes('chauffag') || s.includes('pompe'))
    return 'Les mouvements de terrain peuvent affecter les réseaux enterrés de chauffage et les pompes à chaleur géothermiques.'
  if (s.includes('couv') || s.includes('charpent'))
    return 'Les mouvements de terrain déforment la structure et provoquent des désordres en toiture.'
  return `Les mouvements de terrain liés à l’argile impactent le bâti et justifient le recours à un ${s} qualifié.`
}

function getSismiqueAdvice(serviceName: string, zone: number): string {
  const s = serviceName.toLowerCase()
  const severity = zone >= 4 ? 'élevée' : 'modérée'
  if (s.includes('plomb'))
    return `En zone sismique ${severity}, les canalisations souples (PER, multicouche) sont recommandées pour absorber les vibrations.`
  if (s.includes('maçon') || s.includes('macon'))
    return `La zone sismique ${severity} impose des règles parasismiques (chaînages, ferraillage renforcé) pour toute construction ou extension.`
  if (s.includes('électric'))
    return `En zone sismique ${severity}, les tableaux électriques doivent être fixés selon les normes parasismiques pour éviter les courts-circuits.`
  return `La sismicité ${severity} (zone ${zone}/5) implique des précautions spécifiques pour les travaux de ${s}.`
}

function getRadonAdvice(serviceName: string, level: number): string {
  const s = serviceName.toLowerCase()
  const severity = level >= 3 ? 'élevé' : 'modéré'
  if (s.includes('plomb') || s.includes('ventil') || s.includes('chauffag'))
    return `Le potentiel radon ${severity} nécessite une ventilation performante (VMC, extracteurs) pour évacuer ce gaz radioactif naturel.`
  if (s.includes('maçon') || s.includes('macon'))
    return `Le potentiel radon ${severity} impose une membrane anti-radon sous dalle et des systèmes de dépressurisation du sol.`
  return `Le potentiel radon ${severity} (catégorie ${level}/3) justifie des mesures d’étanchéité et de ventilation lors des travaux de ${s}.`
}

function getCatnatAdvice(serviceName: string, count: number): string {
  return `Avec ${count} arrêtés de catastrophe naturelle recensés, ${serviceName.toLowerCase()} à cet endroit doit intégrer des matériaux et techniques résistants aux aléas récurrents.`
}

function getInondationAdvice(serviceName: string): string {
  const s = serviceName.toLowerCase()
  if (s.includes('plomb'))
    return 'Les inondations endommagent les réseaux d’assainissement et d’eau potable. Un clapet anti-retour et des canalisations étanches sont indispensables en zone inondable.'
  if (s.includes('électric'))
    return 'En zone inondable, le tableau électrique doit être installé en hauteur et les circuits enterrés protégés par des gaines étanches IP68.'
  if (s.includes('maçon') || s.includes('macon'))
    return 'Les fondations en zone inondable nécessitent un cuvelage étanche et des matériaux résistants à l’immersion prolongée (parpaings hydrofugés, enduits spéciaux).'
  if (s.includes('chauffag') || s.includes('pompe'))
    return 'En zone inondable, la chaudière et la pompe à chaleur doivent être surélevées. Les réseaux de chauffage au sol nécessitent une isolation étanche spécifique.'
  if (s.includes('peintr'))
    return 'Après une inondation, les murs doivent sécher complètement (3 à 6 mois) avant toute remise en peinture. Des peintures anti-humidité sont recommandées en zone inondable.'
  return `Le risque d’inondation impose des précautions spécifiques pour les travaux de ${s} : matériaux résistants à l’eau, installations surélevées et systèmes de protection.`
}

/** Generate a contextual prose paragraph combining multiple risks and their impact on the service */
function getRiskSynthesis(
  communeData: CommuneData,
  serviceName: string,
  villeName: string
): string | null {
  const s = serviceName.toLowerCase()
  const parts: string[] = []

  if (communeData.risque_argile === 'fort') {
    parts.push('un sol argileux à fort retrait-gonflement')
  } else if (communeData.risque_argile === 'moyen') {
    parts.push('un sol argileux à risque modéré')
  }

  if (communeData.risque_inondation) {
    parts.push('une exposition au risque d’inondation')
  }

  if ((communeData.zone_sismique ?? 0) >= 3) {
    parts.push(`une sismicité de zone ${communeData.zone_sismique}/5`)
  }

  if ((communeData.risque_radon ?? 0) >= 2) {
    const radonLevel = communeData.risque_radon === 3 ? 'élevée' : 'modérée'
    parts.push(`une concentration en radon ${radonLevel}`)
  }

  if (parts.length === 0) return null

  const riskList =
    parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' et ' + parts[parts.length - 1]

  const catnatSuffix =
    (communeData.nb_catnat ?? 0) > 5
      ? ` La commune a fait l’objet de ${communeData.nb_catnat} arrêtés de catastrophe naturelle, ce qui confirme l’importance de faire appel à un professionnel expérimenté.`
      : ''

  return `${villeName} présente ${riskList}. Ces caractéristiques géologiques influencent directement les interventions de ${s} : le choix des matériaux, les techniques de pose et les normes à respecter doivent être adaptés au contexte local.${catnatSuffix}`
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
  const hasArgile = c.risque_argile === 'fort' || c.risque_argile === 'moyen'
  const hasInondation = !!c.risque_inondation
  const hasSismique = (c.zone_sismique ?? 0) >= 3
  const hasRadon = (c.risque_radon ?? 0) >= 2
  const hasCatnat = (c.nb_catnat ?? 0) > 10

  // Show only if at least one risk condition is met
  if (!hasArgile && !hasInondation && !hasSismique && !hasRadon && !hasCatnat) return null

  const risks: RiskItem[] = []

  if (hasArgile) {
    const isArgileFort = c.risque_argile === 'fort'
    risks.push({
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: 'Retrait-gonflement des argiles',
      level: isArgileFort ? 'Fort' : 'Moyen',
      levelColor: isArgileFort ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      description: getArgileAdvice(serviceName),
    })
  }

  if (hasInondation) {
    risks.push({
      icon: <Shield className="w-5 h-5 text-charcoal-600" />,
      label: 'Zone inondable',
      level: 'Exposé',
      levelColor: 'text-charcoal-700 bg-sand-200',
      description: getInondationAdvice(serviceName),
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
      icon: <Shield className="w-5 h-5 text-charcoal-600" />,
      label: `${c.nb_catnat} arrêtés CatNat`,
      level: (c.nb_catnat ?? 0) > 20 ? 'Très fréquent' : 'Fréquent',
      levelColor:
        (c.nb_catnat ?? 0) > 20 ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100',
      description: getCatnatAdvice(serviceName, c.nb_catnat ?? 0),
    })
  }

  // Max 5 items
  const displayedRisks = risks.slice(0, 5)

  // Generate a synthesis paragraph combining all risks
  const synthesis = getRiskSynthesis(c, serviceName, villeName)

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4">
        Risques naturels à {villeName} : impact sur les travaux de {serviceName.toLowerCase()}
      </h3>

      {/* Synthesis paragraph — unique per city */}
      {synthesis && <p className="text-sm text-charcoal-700 leading-relaxed mb-5">{synthesis}</p>}

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

      {/* Specific risks list from risques_principaux */}
      {c.risques_principaux && c.risques_principaux.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-sand-50 border border-sand-100">
          <p className="text-xs font-semibold text-charcoal-700 mb-1">
            Risques identifiés par Géorisques pour {villeName} :
          </p>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            {c.risques_principaux.join(' · ')}
          </p>
        </div>
      )}
    </section>
  )
}
