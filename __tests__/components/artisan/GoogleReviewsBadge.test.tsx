// @vitest-environment jsdom
/**
 * Tests rendu GoogleReviewsBadge — 5 guards parallèles à
 * ArtisanSchema fallback aggregateRating. Si l'un diverge, ce test l'attrape.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { GoogleReviewsBadge } from '@/components/artisan/GoogleReviewsBadge'

describe('GoogleReviewsBadge — 5 guards de rendu', () => {
  it('retourne null quand placeId absent', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId={null}
        rating={4.5}
        userRatingsTotal={50}
        businessStatus="OPERATIONAL"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand businessStatus = CLOSED_TEMPORARILY', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={4.5}
        userRatingsTotal={50}
        businessStatus="CLOSED_TEMPORARILY"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand businessStatus = CLOSED_PERMANENTLY', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={4.5}
        userRatingsTotal={50}
        businessStatus="CLOSED_PERMANENTLY"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand rating < 1', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={0.5}
        userRatingsTotal={50}
        businessStatus="OPERATIONAL"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand rating > 5 (data corruption defense)', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={6.5}
        userRatingsTotal={50}
        businessStatus="OPERATIONAL"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('retourne null quand userRatingsTotal < 3', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={4.5}
        userRatingsTotal={2}
        businessStatus="OPERATIONAL"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('rend le lien avec href Google Maps + place_id encodé quand tous guards OK', () => {
    render(
      <GoogleReviewsBadge
        placeId="ChIJ_test_special&char"
        rating={4.5}
        userRatingsTotal={50}
        businessStatus="OPERATIONAL"
      />
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent('ChIJ_test_special&char')}`
    )
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
    expect(link.getAttribute('rel')).toContain('nofollow')
    // aria-label avec note + nombre d'avis pour les screen readers.
    const ariaLabel = link.getAttribute('aria-label') ?? ''
    expect(ariaLabel).toContain('4.5')
    expect(ariaLabel).toContain('5')
    expect(ariaLabel).toContain('50')
    // data-eeat signal pour audit éditorial.
    expect(link).toHaveAttribute('data-eeat', 'external-reviews')
    expect(link).toHaveAttribute('data-source', 'google-places')
  })

  it('rend rating à 1 décimale (4 → 4.0)', () => {
    render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={4}
        userRatingsTotal={10}
        businessStatus="OPERATIONAL"
      />
    )
    expect(screen.getByText('4.0')).toBeTruthy()
  })

  it('retourne null sur businessStatus null (defensive vs DB jamais sync)', () => {
    const { container } = render(
      <GoogleReviewsBadge
        placeId="ChIJxxx"
        rating={4.5}
        userRatingsTotal={50}
        businessStatus={null}
      />
    )
    expect(container.firstChild).toBeNull()
  })
})
