/**
 * CalendrierSaisonnierBlock — Bloc calendrier saisonnier contextuel service+ville+climat.
 *
 * Affiche les travaux recommandés et à éviter pour le mois en cours,
 * filtrés par service, avec un conseil climatique adapté à la zone.
 *
 * Server Component — pas de 'use client'.
 */

import { Calendar, CheckCircle, XCircle } from 'lucide-react'
import { calendrierTravaux } from '@/lib/data/calendrier-travaux'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendrierSaisonnierBlockProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  climatZone: string | null
  joursGelAnnuels?: number | null
  precipitationAnnuelle?: number | null
  temperatureMoyenneHiver?: number | null
  temperatureMoyenneEte?: number | null
  moisTravauxExtDebut?: number | null
  moisTravauxExtFin?: number | null
  altitudeMoyenne?: number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentMonthIndex(): number {
  return new Date().getMonth() // 0–11
}

const MONTH_NAMES_CAL = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

/** Generate city-specific weather context paragraph */
function getCityWeatherContext(
  villeName: string,
  serviceName: string,
  joursGel: number | null | undefined,
  precipitations: number | null | undefined,
  tempHiver: number | null | undefined,
  tempEte: number | null | undefined,
  moisDebut: number | null | undefined,
  moisFin: number | null | undefined,
  altitude: number | null | undefined
): string | null {
  const parts: string[] = []
  const s = serviceName.toLowerCase()

  if (joursGel != null && joursGel > 0) {
    if (joursGel > 60) {
      parts.push(
        `les températures descendent sous 0\u00A0\u00B0C en moyenne ${joursGel} jours par an, rendant les interventions extérieures de ${s} complexes en hiver`
      )
    } else if (joursGel > 20) {
      parts.push(
        `${joursGel} jours de gel par an nécessitent d’anticiper les travaux extérieurs de ${s} avant les premières gelées`
      )
    } else {
      parts.push(
        `avec seulement ${joursGel} jours de gel par an, les travaux de ${s} en extérieur restent possibles une grande partie de l’année`
      )
    }
  }

  if (precipitations != null && precipitations > 0) {
    if (precipitations > 1000) {
      parts.push(
        `la pluviométrie élevée (${Math.round(precipitations)}\u00A0mm/an) impose de protéger les chantiers et de privilégier les matériaux résistants à l’humidité`
      )
    } else if (precipitations < 600) {
      parts.push(
        `la faible pluviométrie (${Math.round(precipitations)}\u00A0mm/an) est favorable aux travaux extérieurs mais impose une vigilance sur la sécheresse des matériaux`
      )
    }
  }

  if (moisDebut != null && moisFin != null && moisDebut > 0 && moisFin > 0) {
    const debutLabel = MONTH_NAMES_CAL[moisDebut - 1] || ''
    const finLabel = MONTH_NAMES_CAL[moisFin - 1] || ''
    if (debutLabel && finLabel) {
      parts.push(
        `la fenêtre optimale pour les travaux extérieurs s’\u00E9tend de ${debutLabel} à ${finLabel}`
      )
    }
  }

  if (tempHiver != null && tempEte != null) {
    const amplitude = Math.round(tempEte - tempHiver)
    if (amplitude > 20) {
      parts.push(
        `l’amplitude thermique de ${amplitude}\u00A0\u00B0C entre hiver (${Math.round(tempHiver)}\u00A0\u00B0C) et été (${Math.round(tempEte)}\u00A0\u00B0C) sollicite fortement les matériaux et justifie un entretien régulier`
      )
    }
  }

  if (altitude != null && altitude > 800) {
    parts.push(
      `l’altitude de ${Math.round(altitude)}\u00A0m impose des contraintes spécifiques : pression atmosphérique réduite, UV intenses et accès parfois difficile en hiver`
    )
  }

  if (parts.length === 0) return null

  return `À ${villeName}, ${parts.join('. De plus, ')}.`
}

function getClimatTip(climatZone: string | null): string | null {
  if (!climatZone) return null

  const tips: Record<string, Record<string, string>> = {
    oceanique: {
      default:
        'Le climat océanique offre des hivers doux mais humides. Privilégiez les travaux extérieurs entre avril et octobre.',
      hiver:
        'L’humidité océanique hivernale complique le séchage des enduits et peintures extérieures. Planifiez les travaux intérieurs.',
      ete: 'Les étés tempérés du climat océanique sont idéaux pour les travaux extérieurs, avec peu de risque de canicule.',
    },
    continental: {
      default:
        'Le climat continental impose des hivers rigoureux. Les travaux extérieurs sont limités de novembre à mars.',
      hiver:
        'Les gelées fréquentes et la neige rendent les travaux extérieurs risqués. Concentrez-vous sur les rénovations intérieures.',
      ete: 'Les étés chauds du climat continental sont parfaits pour les gros chantiers, mais attention aux orages violents.',
    },
    mediterraneen: {
      default:
        'Le climat méditerranéen permet des travaux extérieurs presque toute l’année, avec une pause en plein été pour la chaleur.',
      hiver:
        'Les hivers doux méditerranéens permettent de poursuivre la plupart des travaux extérieurs.',
      ete: 'Attention aux températures élevées qui accélèrent le séchage du béton et des enduits. Travaillez tôt le matin.',
    },
    montagnard: {
      default:
        'Le climat montagnard réduit la fenêtre de travaux extérieurs à mai-septembre. Anticipez les délais.',
      hiver:
        'L’enneigement et le gel prolongé limitent drastiquement les travaux. Préparez les chantiers pour le printemps.',
      ete: 'La belle saison en montagne est courte mais intense. Concentrez les chantiers extérieurs entre juin et septembre.',
    },
    'semi-oceanique': {
      default:
        'Le climat semi-océanique offre un bon compromis pour les travaux, avec des hivers modérés et des étés agréables.',
      hiver:
        'Les hivers frais mais rarement glaciaux permettent certains travaux extérieurs protégés.',
      ete: 'Les conditions estivales sont optimales pour la plupart des travaux de rénovation.',
    },
  }

  const zoneData = tips[climatZone]
  if (!zoneData) return null

  const monthIdx = getCurrentMonthIndex()
  if (monthIdx >= 10 || monthIdx <= 2) return zoneData.hiver ?? zoneData.default
  if (monthIdx >= 5 && monthIdx <= 8) return zoneData.ete ?? zoneData.default
  return zoneData.default
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendrierSaisonnierBlock({
  serviceSlug,
  serviceName,
  villeName,
  climatZone,
  joursGelAnnuels,
  precipitationAnnuelle,
  temperatureMoyenneHiver,
  temperatureMoyenneEte,
  moisTravauxExtDebut,
  moisTravauxExtFin,
  altitudeMoyenne,
}: CalendrierSaisonnierBlockProps) {
  const monthIdx = getCurrentMonthIndex()
  const moisData = calendrierTravaux[monthIdx]
  if (!moisData) return null

  // Filter recommended works matching this service
  const matchingTravaux = moisData.travauxRecommandes.filter((t) => t.service === serviceSlug)

  // City-specific weather context
  const cityWeather = getCityWeatherContext(
    villeName,
    serviceName,
    joursGelAnnuels,
    precipitationAnnuelle,
    temperatureMoyenneHiver,
    temperatureMoyenneEte,
    moisTravauxExtDebut,
    moisTravauxExtFin,
    altitudeMoyenne
  )

  // Even if no matching service-specific work, show the month info if we have climate context
  const climatTip = getClimatTip(climatZone)
  const hasContent = matchingTravaux.length > 0 || climatTip || !!cityWeather

  if (!hasContent) return null

  return (
    <section className="py-6 bg-white rounded-xl border border-sand-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-bold text-charcoal-900">
            {serviceName} en {moisData.mois.toLowerCase()} à {villeName}
          </h3>
          <p className="text-xs text-charcoal-500">Calendrier saisonnier des travaux</p>
        </div>
      </div>

      {/* Recommended works for this service */}
      {matchingTravaux.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-charcoal-800 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-accent-500" />
            Travaux recommandés ce mois
          </p>
          <div className="space-y-2">
            {matchingTravaux.map((travail) => (
              <div
                key={travail.titre}
                className="p-3 rounded-lg bg-accent-50 border border-accent-100"
              >
                <p className="text-sm font-medium text-charcoal-900">{travail.titre}</p>
                <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                  {travail.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Works to avoid */}
      {moisData.travauxAEviter.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-charcoal-800 mb-2 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-500" />À éviter en {moisData.mois.toLowerCase()}
          </p>
          <ul className="space-y-1">
            {moisData.travauxAEviter.slice(0, 3).map((item) => (
              <li key={item} className="text-sm text-charcoal-600 flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* City-specific weather context */}
      {cityWeather && (
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 mb-3">
          <p className="text-sm text-charcoal-700 leading-relaxed">{cityWeather}</p>
        </div>
      )}

      {/* Climate-aware tip */}
      {climatTip && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Conseil climat{'\u00A0'}:</strong> {climatTip}
          </p>
        </div>
      )}

      {/* Monthly tip */}
      {moisData.conseilDuMois && (
        <p className="text-xs text-charcoal-500 mt-3 italic">Astuce : {moisData.conseilDuMois}</p>
      )}
    </section>
  )
}
