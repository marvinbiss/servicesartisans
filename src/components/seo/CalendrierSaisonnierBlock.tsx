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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCurrentMonthIndex(): number {
  return new Date().getMonth() // 0–11
}

function getClimatTip(climatZone: string | null): string | null {
  if (!climatZone) return null

  const tips: Record<string, Record<string, string>> = {
    oceanique: {
      default:
        'Le climat océanique offre des hivers doux mais humides. Privilégiez les travaux extérieurs entre avril et octobre.',
      hiver:
        'L\u2019humidité océanique hivernale complique le séchage des enduits et peintures extérieures. Planifiez les travaux intérieurs.',
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
        'Le climat méditerranéen permet des travaux extérieurs presque toute l\u2019année, avec une pause en plein été pour la chaleur.',
      hiver:
        'Les hivers doux méditerranéens permettent de poursuivre la plupart des travaux extérieurs.',
      ete: 'Attention aux températures élevées qui accélèrent le séchage du béton et des enduits. Travaillez tôt le matin.',
    },
    montagnard: {
      default:
        'Le climat montagnard réduit la fenêtre de travaux extérieurs à mai-septembre. Anticipez les délais.',
      hiver:
        'L\u2019enneigement et le gel prolongé limitent drastiquement les travaux. Préparez les chantiers pour le printemps.',
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
}: CalendrierSaisonnierBlockProps) {
  const monthIdx = getCurrentMonthIndex()
  const moisData = calendrierTravaux[monthIdx]
  if (!moisData) return null

  // Filter recommended works matching this service
  const matchingTravaux = moisData.travauxRecommandes.filter((t) => t.service === serviceSlug)

  // Even if no matching service-specific work, show the month info if we have climate context
  const climatTip = getClimatTip(climatZone)
  const hasContent = matchingTravaux.length > 0 || climatTip

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
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Travaux recommandés ce mois
          </p>
          <div className="space-y-2">
            {matchingTravaux.map((travail) => (
              <div
                key={travail.titre}
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-100"
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
