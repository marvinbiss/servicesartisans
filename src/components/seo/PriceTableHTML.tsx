/**
 * PriceTableHTML — Tableau HTML semantique des tarifs pour capturer les Featured Snippets Google.
 *
 * Rend un vrai <table> avec <caption>, <thead>, <tbody>, <tfoot>.
 * Parse les commonTasks (format "Label : prix" ou "Label: prix") et applique
 * un multiplicateur regional optionnel aux prix numeriques.
 *
 * Server Component — pas de 'use client'.
 *
 * Note 2026-04-29 : ne lie plus vers /tarifs/[s]/[v]/[task] (bloc supprimé en
 * 410 — stratégie 140K vague 1). Le nom de la tâche est en texte simple.
 */

import Link from 'next/link'

interface PriceTableHTMLProps {
  tasks: string[] // commonTasks du trade
  serviceName: string // ex: "Plombier"
  serviceSlug?: string // slug du service pour les liens (ex: "plombier")
  location?: string // ex: "Paris" (optionnel)
  locationSlug?: string // slug de la ville pour les liens (ex: "paris")
  multiplier?: number // multiplicateur regional (defaut 1)
  unit?: string // ex: "€/h"
}

/**
 * Parse une tache au format "Nom prestation : 80 a 250 € ..." ou "Nom prestation: prix"
 * Retourne { name, price } ou le prix est ajuste si un multiplicateur est fourni.
 */
function parseTaskLocal(task: string, multiplier: number): { name: string; price: string } {
  // Support both "Label : prix" and "Label: prix"
  const colonIndex = task.indexOf(':')
  if (colonIndex === -1) {
    return { name: task.trim(), price: 'Sur devis' }
  }

  const name = task.slice(0, colonIndex).trim()
  let priceStr = task.slice(colonIndex + 1).trim()

  if (multiplier !== 1) {
    // Replace all numbers in the price string with multiplied values
    priceStr = priceStr.replace(/(\d[\d\s]*)/g, (match) => {
      const num = parseInt(match.replace(/\s/g, ''), 10)
      if (isNaN(num)) return match
      const adjusted = Math.round(num * multiplier)
      return adjusted.toLocaleString('fr-FR')
    })
  }

  return { name, price: priceStr || 'Sur devis' }
}

export default function PriceTableHTML({
  tasks,
  serviceName,
  serviceSlug,
  location,
  locationSlug,
  multiplier = 1,
  unit,
}: PriceTableHTMLProps) {
  if (!tasks || tasks.length === 0) return null

  const captionText = location
    ? `Tarifs ${serviceName.toLowerCase()} ${location} — 2026`
    : `Tarifs ${serviceName.toLowerCase()} en France — 2026`

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-300 shadow-sm">
      <table className="w-full text-left">
        <caption className="px-5 py-3 text-left text-base font-semibold text-charcoal-900 bg-white border-b border-sand-200">
          {captionText}
          {unit && <span className="ml-2 text-sm font-normal text-charcoal-500">({unit})</span>}
        </caption>
        <thead>
          <tr className="bg-sand-50 border-b border-sand-300">
            <th scope="col" className="px-5 py-3.5 text-sm font-semibold text-charcoal-700">
              Prestation
            </th>
            <th
              scope="col"
              className="px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-right"
            >
              Prix indicatif
            </th>
            <th
              scope="col"
              className="hidden sm:table-cell px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-center w-28"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, i) => {
            const { name, price } = parseTaskLocal(task, multiplier)
            // /tarifs/[s]/[v]/[task] supprimé 2026-04-29 (DELETE 410). On affiche
            // le nom de la tâche en texte simple ; l'utilisateur trouve les
            // détails via la page parente /tarifs/[s]/[v] qui contient déjà le
            // tableau complet (cette colonne est purement informative).
            return (
              <tr
                key={i}
                className={`hover:bg-primary-50/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sand-50/50'}`}
              >
                <td className="px-5 py-4 text-sm border-t border-sand-200">
                  <span className="text-charcoal-800">{name}</span>
                </td>
                <td className="px-5 py-4 text-charcoal-900 text-sm font-medium border-t border-sand-200 text-right whitespace-nowrap">
                  {price}
                </td>
                <td className="hidden sm:table-cell px-3 py-4 border-t border-sand-200 text-center">
                  {serviceSlug ? (
                    <Link
                      href={
                        locationSlug
                          ? `/devis/${serviceSlug}/${locationSlug}`
                          : `/devis/${serviceSlug}`
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Devis gratuit
                    </Link>
                  ) : (
                    <Link
                      href="/devis"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Devis gratuit
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-sand-50/80 border-t border-sand-300">
            <td colSpan={3} className="px-5 py-3 text-xs text-charcoal-500 italic">
              Prix indicatifs, peuvent varier selon la complexité des travaux, la région et le
              professionnel.
              {location && multiplier !== 1 && (
                <span className="ml-1">
                  Tarifs ajustés pour {location} ({multiplier > 1 ? '+' : ''}
                  {Math.round((multiplier - 1) * 100)}&nbsp;% vs moyenne nationale).
                </span>
              )}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
