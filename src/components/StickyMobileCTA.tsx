'use client'

/**
 * @deprecated Use `@/components/conversion/StickyMobileCTA` directly.
 * This file is kept for backward compatibility with existing page imports.
 */
import StickyMobileCTANew from '@/components/conversion/StickyMobileCTA'

interface StickyMobileCTAProps {
  serviceSlug?: string
  cityName?: string
  citySlug?: string
  ctaText?: string
  href?: string
  providerCount?: number
}

export default function StickyMobileCTA({
  serviceSlug,
  cityName,
  citySlug,
  ctaText,
  providerCount,
}: StickyMobileCTAProps) {
  return (
    <StickyMobileCTANew
      serviceSlug={serviceSlug}
      cityName={cityName}
      citySlug={citySlug}
      ctaText={ctaText}
      providerCount={providerCount}
    />
  )
}
