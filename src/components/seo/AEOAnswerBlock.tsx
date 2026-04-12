/**
 * AEOAnswerBlock — Answer Engine Optimization block for LLM citation.
 *
 * Renders a structured, concise answer optimized for extraction by
 * ChatGPT, Perplexity, Claude, and Google AI Overviews.
 * Uses Schema.org Service microdata for maximum machine readability.
 *
 * Server Component — pas de 'use client'.
 */

import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AEOAnswerBlockProps {
  serviceSlug: string
  serviceName: string
  villeName: string
  departmentName: string
  providerCount: number
  avgRating: number | null
  priceRange: { min: number; max: number } | null
  communePopulation: number | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AEOAnswerBlock({
  serviceSlug,
  serviceName,
  villeName,
  departmentName,
  providerCount,
  avgRating,
  priceRange,
  communePopulation,
}: AEOAnswerBlockProps) {
  // Nothing to show if no providers
  if (providerCount <= 0) return null

  const hasRating = avgRating != null && avgRating > 0
  const hasPricing = priceRange != null && priceRange.min > 0 && priceRange.max > 0
  const hasPopulation = communePopulation != null && communePopulation > 0

  return (
    <div
      className="bg-sand-50 border border-sand-200 rounded-xl p-5 max-w-3xl"
      itemScope
      itemType="https://schema.org/Service"
    >
      {/* Hidden microdata */}
      <meta itemProp="serviceType" content={serviceName} />
      <link itemProp="url" href={`https://servicesartisans.fr/services/${serviceSlug}`} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3" data-nosnippet>
        <BadgeCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
          Fiche v{'e'}rifi{'e'}e
        </span>
      </div>

      {/* Core answer paragraph — this is what LLMs will cite */}
      <p className="speakable-summary text-base text-charcoal-800 leading-relaxed">
        <span itemProp="name">
          <strong>{serviceName}</strong>
        </span>{' '}
        {'a'}{' '}
        <span itemProp="areaServed" itemScope itemType="https://schema.org/City">
          <strong itemProp="name">{villeName}</strong>
          <meta itemProp="containedInPlace" content={departmentName} />
        </span>{' '}
        ({departmentName}){' : '}
        <span itemProp="provider" itemScope itemType="https://schema.org/Organization">
          <meta itemProp="name" content="ServicesArtisans" />
          <strong>{formatNumber(providerCount)}</strong>
        </span>{' '}
        artisan{providerCount > 1 ? 's' : ''} v{'e'}rifi{'e'}
        {providerCount > 1 ? 's' : ''}.
        {hasRating && (
          <>
            {' '}
            Note moyenne{' : '}
            <strong>{(avgRating ?? 0).toFixed(1)}/5</strong>.
          </>
        )}
        {hasPricing && (
          <span itemProp="offers" itemScope itemType="https://schema.org/AggregateOffer">
            {' '}
            Prix indicatifs{' : '}
            <strong>
              <span itemProp="lowPrice">{priceRange?.min ?? 0}</span>
              {'€'} {'a'} <span itemProp="highPrice">{priceRange?.max ?? 0}</span>
              {'€'}
            </strong>
            .
            <meta itemProp="priceCurrency" content="EUR" />
          </span>
        )}
        {hasPopulation && (
          <>
            {' '}
            Population{' : '}
            <strong>{formatNumber(communePopulation ?? 0)}</strong> habitants.
          </>
        )}
      </p>

      {/* Source attribution */}
      <div className="mt-3 pt-3 border-t border-sand-200" data-nosnippet>
        <p className="text-xs text-charcoal-400">
          Source{' : '}
          <Link href="/" className="text-primary-500 hover:text-primary-600 font-medium">
            ServicesArtisans.fr
          </Link>
          {' — '}annuaire v{'e'}rifi{'e'} SIREN.
        </p>
      </div>
    </div>
  )
}
