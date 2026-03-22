'use client'

/**
 * @deprecated Use `@/components/conversion/StickyMobileCTA` directly.
 * This file is kept for backward compatibility with existing page imports.
 */
import StickyMobileCTANew from '@/components/conversion/StickyMobileCTA'

interface StickyMobileCTAProps {
  serviceSlug?: string
  citySlug?: string
  ctaText?: string
  href?: string
  providerCount?: number
}

export default function StickyMobileCTA({
  serviceSlug,
  citySlug,
  ctaText,
  providerCount,
}: StickyMobileCTAProps) {
  return (
    <StickyMobileCTANew
      serviceSlug={serviceSlug}
      citySlug={citySlug}
      ctaText={ctaText}
      providerCount={providerCount}
    />
  )
}
