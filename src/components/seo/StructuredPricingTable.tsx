/**
 * StructuredPricingTable — Tableau de prix structuré avec JSON-LD Offer/PriceSpecification.
 *
 * Affiche les interventions courantes d'un service avec prix min/max, durée estimée,
 * et une ligne mise en avant pour la ville. Inclut le schema Offer pour Google Rich Results.
 *
 * Server Component — pas de 'use client'.
 */

import Link from 'next/link'
import { SITE_URL } from '@/lib/seo/config'
import { safeJsonStringify } from '@/lib/seo/safe-json'
import { buildDevisHref } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PricingRow {
  intervention: string
  prixMin: number
  prixMax: number
  duree: string
}

interface StructuredPricingTableProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  villeSlug: string
  tasks: string[]
  multiplier?: number
  unit?: string
}

// ---------------------------------------------------------------------------
// Parse tasks from trade-content format "Label : prix min à max €"
// ---------------------------------------------------------------------------

function parsePricingRows(tasks: string[], multiplier: number): PricingRow[] {
  return tasks.slice(0, 8).map((task) => {
    const colonIdx = task.indexOf(':')
    if (colonIdx === -1) {
      return { intervention: task.trim(), prixMin: 0, prixMax: 0, duree: 'Variable' }
    }

    const intervention = task.substring(0, colonIdx).trim()
    const priceStr = task.substring(colonIdx + 1).trim()

    // Extract all numbers from price string
    const numbers =
      priceStr.match(/\d[\d\s]*/g)?.map((n) => parseInt(n.replace(/\s/g, ''), 10)) || []

    let prixMin = 0
    let prixMax = 0
    if (numbers.length >= 2) {
      prixMin = Math.round(numbers[0] * multiplier)
      prixMax = Math.round(numbers[1] * multiplier)
    } else if (numbers.length === 1) {
      prixMin = Math.round(numbers[0] * multiplier * 0.9)
      prixMax = Math.round(numbers[0] * multiplier * 1.1)
    }

    // Estimate duration based on price range
    const avgPrice = (prixMin + prixMax) / 2
    let duree: string
    if (avgPrice <= 200) duree = '1 à 2h'
    else if (avgPrice <= 500) duree = '2 à 4h'
    else if (avgPrice <= 1500) duree = '½ à 1 journée'
    else if (avgPrice <= 3000) duree = '1 à 3 jours'
    else duree = '3 à 7 jours'

    return { intervention, prixMin, prixMax, duree }
  })
}

function formatPrice(n: number): string {
  return n.toLocaleString('fr-FR')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StructuredPricingTable({
  serviceSlug,
  serviceName,
  villeName,
  villeSlug,
  tasks,
  multiplier = 1,
  unit = '€',
}: StructuredPricingTableProps) {
  if (!tasks || tasks.length === 0) return null

  const rows = parsePricingRows(tasks, multiplier)
  if (rows.length === 0) return null

  const serviceNameLower = serviceName.toLowerCase()

  // Pick a "highlighted" row — typically the most common intervention (index 0 or 2)
  const highlightIdx = rows.length > 2 ? 2 : 0

  // JSON-LD: Offer with PriceSpecification per row
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${serviceName} à ${villeName}`,
    url: `${SITE_URL}/services/${serviceSlug}/${villeSlug}`,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: villeName,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Tarifs ${serviceNameLower} à ${villeName}`,
      itemListElement: rows.map((row, i) => ({
        '@type': 'OfferCatalog',
        name: row.intervention,
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: row.intervention,
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              priceCurrency: 'EUR',
              minPrice: row.prixMin,
              maxPrice: row.prixMax,
              unitText: unit,
            },
            position: i + 1,
          },
        ],
      })),
    },
  }

  return (
    <div className="mt-10">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(jsonLd) }}
      />

      <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2">
        Grille tarifaire {serviceNameLower} {'à'} {villeName}
      </h2>
      <p className="text-sm text-charcoal-500 mb-5">
        Tarifs indicatifs 2026 pour les interventions courantes de {serviceNameLower} {'à'}{' '}
        {villeName}. Prix ajust{'é'}s au march{'é'} local.
      </p>

      <div className="overflow-x-auto rounded-xl border border-sand-300 shadow-sm">
        <table className="w-full text-left">
          <caption className="sr-only">
            Grille des tarifs {serviceNameLower} {'à'} {villeName} en 2026
          </caption>
          <thead>
            <tr className="bg-sand-50 border-b border-sand-300">
              <th scope="col" className="px-5 py-3.5 text-sm font-semibold text-charcoal-700">
                Type d{"'"}intervention
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-right"
              >
                Prix min
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-right"
              >
                Prix max
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-5 py-3.5 text-sm font-semibold text-charcoal-700 text-center"
              >
                Dur{'é'}e estim{'é'}e
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isHighlight = i === highlightIdx
              return (
                <tr
                  key={i}
                  className={
                    isHighlight
                      ? 'bg-primary-50/70 border-l-4 border-l-primary-400'
                      : `hover:bg-primary-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sand-50/50'}`
                  }
                >
                  <td className="px-5 py-4 text-sm border-t border-sand-200">
                    {isHighlight ? (
                      <span className="text-charcoal-900 font-semibold">
                        {row.intervention}
                        <span className="block text-xs text-primary-600 font-medium mt-0.5">
                          Exemple {'à'} {villeName} :{' '}
                          {formatPrice(Math.round((row.prixMin + row.prixMax) / 2))}
                          {'\u00A0'}
                          {unit}
                        </span>
                      </span>
                    ) : (
                      <span className="text-charcoal-800">{row.intervention}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium border-t border-sand-200 text-right whitespace-nowrap text-charcoal-900">
                    {row.prixMin > 0 ? `${formatPrice(row.prixMin)}\u00A0${unit}` : 'Sur devis'}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium border-t border-sand-200 text-right whitespace-nowrap text-charcoal-900">
                    {row.prixMax > 0 ? `${formatPrice(row.prixMax)}\u00A0${unit}` : 'Sur devis'}
                  </td>
                  <td className="hidden sm:table-cell px-5 py-4 text-sm border-t border-sand-200 text-center text-charcoal-500">
                    {row.duree}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-sand-50/80 border-t border-sand-300">
              <td colSpan={4} className="px-5 py-3 text-xs text-charcoal-500 italic">
                Prix indicatifs TTC, main-d{"'"}œuvre incluse. Varient selon la complexit{'é'}, l
                {"'"}accessibilit{'é'} et les mat{'é'}riaux choisis.
                {multiplier !== 1 && (
                  <span className="ml-1">
                    Tarifs ajust{'é'}s pour {villeName} ({multiplier > 1 ? '+' : ''}
                    {Math.round((multiplier - 1) * 100)}
                    {'\u00A0'}% vs moyenne nationale).
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Link
          href={buildDevisHref(serviceSlug, villeName)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          Obtenir un devis pr{'é'}cis {'à'} {villeName}
        </Link>
        <p className="text-xs text-charcoal-400">
          Gratuit et sans engagement {'—'} r{'é'}ponse rapide
        </p>
      </div>
    </div>
  )
}
