/**
 * SnippetBaitSummary — Tableau HTML semantique des prix par metier
 * pour capturer les Google Featured Snippets (Position 0).
 *
 * Rend un paragraphe de reponse directe + un <table> avec <thead>/<tbody>
 * contenant les prix moyens par corps de metier. Place en haut de page
 * pour maximiser les chances d'extraction par Google.
 *
 * Server Component — pas de 'use client'.
 */

import Link from 'next/link'

interface TradeRow {
  name: string
  slug: string
  min: number
  max: number
  unit: string
}

interface SnippetBaitSummaryProps {
  /** Liste des metiers avec fourchettes de prix */
  trades: TradeRow[]
  /** Annee de reference (defaut: 2026) */
  year?: number
}

export default function SnippetBaitSummary({ trades, year = 2026 }: SnippetBaitSummaryProps) {
  if (!trades || trades.length === 0) return null

  // Calcul fourchette globale
  const globalMin = Math.min(...trades.map((t) => t.min))
  const globalMax = Math.max(...trades.map((t) => t.max))

  return (
    <div className="snippet-answer max-w-4xl mx-auto" data-speakable="true">
      <p className="text-base text-charcoal-700 leading-relaxed mb-4">
        Le <strong>prix moyen d'un artisan en France</strong> se situe entre{' '}
        <strong>
          {globalMin} et {globalMax} {trades[0]?.unit || '€/h'}
        </strong>{' '}
        en {year}. Les tarifs varient selon le corps de métier, la région et la complexité des
        travaux. Voici le barème complet par métier :
      </p>

      <div className="overflow-x-auto rounded-xl border border-sand-300 shadow-sm">
        <table className="w-full text-left">
          <caption className="px-5 py-3 text-left text-base font-semibold text-charcoal-900 bg-white border-b border-sand-200">
            Tarifs artisans en France — {year}
          </caption>
          <thead>
            <tr className="bg-sand-50 border-b border-sand-300">
              <th scope="col" className="px-5 py-3.5 text-sm font-semibold text-charcoal-700">
                Métier
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-right"
              >
                Prix moyen
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-center w-28"
              >
                Détails
              </th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <tr
                key={trade.slug}
                className={`hover:bg-primary-50/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sand-50/50'}`}
              >
                <td className="px-5 py-3.5 text-sm border-t border-sand-200">
                  <Link
                    href={`/tarifs/${trade.slug}`}
                    className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                  >
                    {trade.name}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-charcoal-900 text-sm font-medium border-t border-sand-200 text-right whitespace-nowrap">
                  {trade.min} — {trade.max} {trade.unit}
                </td>
                <td className="hidden sm:table-cell px-3 py-3.5 border-t border-sand-200 text-center">
                  <Link
                    href={`/tarifs/${trade.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Voir tarifs
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-sand-50/80 border-t border-sand-300">
              <td colSpan={3} className="px-5 py-3 text-xs text-charcoal-500 italic">
                Prix indicatifs TTC en {year}, main-d'œuvre incluse. Peuvent varier selon la région
                et la complexité des travaux.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
