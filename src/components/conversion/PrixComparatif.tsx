import { Star } from 'lucide-react'
import { safeJsonStringify } from '@/lib/seo/safe-json'

/**
 * PrixComparatif — tableau comparatif marques/configs intent achat.
 *
 * Reusable cross-cluster : PAC, VMC, Isolation, Ballon thermo, Solaire.
 * Pattern extrait de `pompe-a-chaleur/air-eau-prix/page.tsx` (cash cow Sprint 2).
 *
 * Semantic table + caption + thead + tbody. Responsive overflow. Highlight optionnel.
 * Schema.org Product/Offer optionnel via `withSchema` (intent commercial → SERP rich result).
 *
 * @kw-related   "comparatif marques", "prix [produit] marques", "meilleur [produit]"
 * @cluster      reno-funnel
 */

export type PrixComparatifRow = {
  brand: string
  model?: string
  priceRange: string
  cop?: number | string
  warranty?: string
  rating?: number
  highlight?: boolean
  notes?: string
}

type PrixComparatifProps = {
  title: string
  caption?: string
  rows: PrixComparatifRow[]
  withSchema?: boolean
  className?: string
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating * 2) / 2
  const full = Math.floor(rounded)
  const half = rounded - full === 0.5
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`Note : ${rating.toFixed(1)} sur 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half)
        return (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${filled ? 'fill-accent-500 text-accent-500' : 'text-sand-300'}`}
            aria-hidden="true"
          />
        )
      })}
      <span className="ml-1 text-xs text-sand-600">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function PrixComparatif({
  title,
  caption,
  rows,
  withSchema = false,
  className = '',
}: PrixComparatifProps) {
  if (!rows || rows.length === 0) return null

  const hasCop = rows.some((r) => r.cop !== undefined)
  const hasWarranty = rows.some((r) => r.warranty !== undefined)
  const hasRating = rows.some((r) => r.rating !== undefined)
  const hasNotes = rows.some((r) => r.notes !== undefined)

  const schema = withSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title,
        itemListElement: rows.map((row, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: row.model ? `${row.brand} ${row.model}` : row.brand,
            brand: { '@type': 'Brand', name: row.brand },
            ...(row.rating !== undefined && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: row.rating,
                bestRating: 5,
                worstRating: 0,
                ratingCount: 1,
              },
            }),
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              priceSpecification: { '@type': 'PriceSpecification', price: row.priceRange },
            },
          },
        })),
      }
    : null

  return (
    <section
      className={`not-prose bg-white border border-sand-200 rounded-xl my-8 overflow-x-auto ${className}`}
      aria-labelledby="prix-comparatif-heading"
    >
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonStringify(schema) }}
        />
      )}
      <table className="w-full text-sm">
        <caption className="text-left p-4 pb-2">
          <h2
            id="prix-comparatif-heading"
            className="font-heading text-lg md:text-xl font-bold text-charcoal-900 m-0"
          >
            {title}
          </h2>
          {caption && <p className="text-xs text-sand-600 mt-1">{caption}</p>}
        </caption>
        <thead className="bg-sand-50 text-sand-900 text-left">
          <tr>
            <th scope="col" className="p-3 border-b border-sand-200">
              Marque / modèle
            </th>
            <th scope="col" className="p-3 border-b border-sand-200">
              Prix indicatif
            </th>
            {hasCop && (
              <th scope="col" className="p-3 border-b border-sand-200 whitespace-nowrap">
                COP / Perf
              </th>
            )}
            {hasWarranty && (
              <th scope="col" className="p-3 border-b border-sand-200 whitespace-nowrap">
                Garantie
              </th>
            )}
            {hasRating && (
              <th scope="col" className="p-3 border-b border-sand-200 hidden md:table-cell">
                Note
              </th>
            )}
            {hasNotes && (
              <th scope="col" className="p-3 border-b border-sand-200 hidden md:table-cell">
                Point fort
              </th>
            )}
          </tr>
        </thead>
        <tbody className="align-top">
          {rows.map((row) => (
            <tr
              key={`${row.brand}-${row.model ?? ''}`}
              className={`border-b border-sand-100 last:border-0 ${
                row.highlight ? 'bg-accent-50/60' : ''
              }`}
            >
              <th scope="row" className="p-3 font-semibold text-left whitespace-nowrap">
                {row.brand}
                {row.model && (
                  <>
                    <br />
                    <span className="text-xs text-sand-500 font-normal">{row.model}</span>
                  </>
                )}
              </th>
              <td className="p-3 font-semibold text-primary-800 whitespace-nowrap">
                {row.priceRange}
              </td>
              {hasCop && <td className="p-3 whitespace-nowrap">{row.cop ?? '—'}</td>}
              {hasWarranty && <td className="p-3 whitespace-nowrap">{row.warranty ?? '—'}</td>}
              {hasRating && (
                <td className="p-3 hidden md:table-cell">
                  {row.rating !== undefined ? <Stars rating={row.rating} /> : '—'}
                </td>
              )}
              {hasNotes && (
                <td className="p-3 text-sand-600 hidden md:table-cell">{row.notes ?? '—'}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
