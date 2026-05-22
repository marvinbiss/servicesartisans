// @vitest-environment jsdom
/**
 * Tests ArtisanSchema — fallback Google Places aggregateRating + sameAs.
 *
 * Ces tests vérifient le JSON-LD émis (parse du <script type="application/ld+json">)
 * et garantissent que :
 *  - first-party reviews sont prioritaires
 *  - Google rating est utilisé en fallback UNIQUEMENT si first-party=0 + place_id
 *    + rating∈[1,5] + count≥3 + status=OPERATIONAL
 *  - aucune AggregateRating n'est émise si business_status non OPERATIONAL
 *  - sameAs Google Maps URL est présente quand place_id existe
 *
 * Attention : le composant émet un @graph avec plusieurs nodes.
 * On extrait localBusinessSchema via @type pour les assertions.
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { ArtisanSchema } from '@/components/artisan/ArtisanSchema'
import type { LegacyArtisan } from '@/types/legacy'

function getLocalBusinessNode(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]')
  if (!script || !script.textContent) {
    throw new Error('No JSON-LD script tag found')
  }
  const parsed = JSON.parse(script.textContent) as { '@graph'?: unknown[] }
  if (!Array.isArray(parsed['@graph'])) {
    throw new Error('No @graph in JSON-LD')
  }
  const businessNode = parsed['@graph'].find((node) => {
    if (!node || typeof node !== 'object') return false
    const t = (node as Record<string, unknown>)['@type']
    return Array.isArray(t) && t.includes('LocalBusiness')
  }) as Record<string, unknown> | undefined
  if (!businessNode) {
    throw new Error('No LocalBusiness node in @graph')
  }
  return businessNode
}

const baseArtisan: LegacyArtisan = {
  id: 'a1',
  business_name: 'Plomberie Test',
  first_name: null,
  last_name: null,
  city: 'Lyon',
  postal_code: '69001',
  specialty: 'Plombier',
  description: 'Test plombier',
  average_rating: 0,
  review_count: 0,
  is_verified: true,
  services: [],
  service_prices: [],
}

describe('ArtisanSchema — fallback aggregateRating Google Places', () => {
  it('priorise first-party reviews quand review_count > 0 + average_rating > 0', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 4.7,
      review_count: 25,
      google_place_id: 'ChIJxxx',
      google_rating: 4.2,
      google_user_ratings_total: 100,
      google_business_status: 'OPERATIONAL',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const ar = node.aggregateRating as Record<string, string> | undefined
    expect(ar).toBeDefined()
    // Doit refléter first-party (4.7), PAS Google (4.2)
    expect(ar?.ratingValue).toBe('4.7')
    expect(ar?.reviewCount).toBe('25')
  })

  it('utilise Google fallback quand first-party=0 + tous guards OK', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 0,
      review_count: 0,
      google_place_id: 'ChIJxxx',
      google_rating: 4.2,
      google_user_ratings_total: 45,
      google_business_status: 'OPERATIONAL',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const ar = node.aggregateRating as Record<string, string> | undefined
    expect(ar).toBeDefined()
    expect(ar?.ratingValue).toBe('4.2')
    expect(ar?.reviewCount).toBe('45')
  })

  it('aucun aggregateRating quand first-party=0 + Google CLOSED_PERMANENTLY', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 0,
      review_count: 0,
      google_place_id: 'ChIJxxx',
      google_rating: 4.2,
      google_user_ratings_total: 100,
      google_business_status: 'CLOSED_PERMANENTLY',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.aggregateRating).toBeUndefined()
  })

  it('aucun aggregateRating quand Google count < 3 (mimer barre Google SERP)', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 0,
      review_count: 0,
      google_place_id: 'ChIJxxx',
      google_rating: 5,
      google_user_ratings_total: 2,
      google_business_status: 'OPERATIONAL',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.aggregateRating).toBeUndefined()
  })

  it('aucun aggregateRating quand Google rating < 1 (zéro réel = no signal)', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 0,
      review_count: 0,
      google_place_id: 'ChIJxxx',
      google_rating: 0.5,
      google_user_ratings_total: 50,
      google_business_status: 'OPERATIONAL',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.aggregateRating).toBeUndefined()
  })

  it('aucun aggregateRating quand place_id absent même avec rating', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      average_rating: 0,
      review_count: 0,
      google_place_id: null,
      google_rating: 4.5,
      google_user_ratings_total: 100,
      google_business_status: 'OPERATIONAL',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.aggregateRating).toBeUndefined()
  })

  it('inclut sameAs Google Maps URL avec place_id encodé quand présent', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '12345678901234',
      google_place_id: 'ChIJ_special&char',
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const sameAs = node.sameAs as string[] | undefined
    expect(sameAs).toBeDefined()
    const mapsUrl = sameAs?.find((u) => u.startsWith('https://www.google.com/maps/place/'))
    expect(mapsUrl).toBeDefined()
    // Caractère spécial doit être encodé.
    expect(mapsUrl).toContain(`place_id:${encodeURIComponent('ChIJ_special&char')}`)
  })

  it('omit sameAs Google Maps quand place_id null', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '12345678901234',
      google_place_id: null,
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const sameAs = (node.sameAs as string[] | undefined) ?? []
    expect(sameAs.some((u) => u.includes('maps/place'))).toBe(false)
  })
})

describe('ArtisanSchema — fallback E-E-A-T sans aggregateRating (97% fiches RGE)', () => {
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const pastDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  it('émet award + hasCredential RGE quand qualif active présente', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      // Pas de rating first-party ni Google
      average_rating: 0,
      review_count: 0,
      google_place_id: null,
      rge_qualifications: [
        {
          code: 'QB5911',
          nom: 'Pompe à chaleur',
          organisme: 'Qualibat',
          domaine: 'Chauffage',
          meta_domaine: 'Énergie',
          date_debut: '2024-01-01',
          date_fin: futureDate,
          url: 'https://www.qualibat.com/qualif/5911',
        },
      ],
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)

    // Pas d'aggregateRating attendu (compensation E-E-A-T)
    expect(node.aggregateRating).toBeUndefined()

    // award = libellé court lisible humain
    const awards = node.award as string[] | undefined
    expect(awards).toBeDefined()
    expect(awards).toHaveLength(1)
    expect(awards?.[0]).toContain('Qualibat')
    expect(awards?.[0]).toContain('Pompe à chaleur')
    expect(awards?.[0]).toContain('valide jusqu')

    // hasCredential = EducationalOccupationalCredential détaillé
    const creds = node.hasCredential as Array<Record<string, unknown>> | undefined
    expect(creds).toBeDefined()
    const rgeCred = creds?.find((c) => c.identifier === 'QB5911')
    expect(rgeCred).toBeDefined()
    expect(rgeCred?.['@type']).toBe('EducationalOccupationalCredential')
    expect(rgeCred?.credentialCategory).toContain('RGE')
  })

  it('award absent quand toutes les qualifs RGE sont expirées', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      rge_qualifications: [
        {
          code: 'QB5911',
          nom: 'Pompe à chaleur',
          organisme: 'Qualibat',
          domaine: null,
          meta_domaine: null,
          date_debut: '2020-01-01',
          date_fin: pastDate,
          url: null,
        },
      ],
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.award).toBeUndefined()
    const creds = (node.hasCredential as Array<Record<string, unknown>> | undefined) ?? []
    expect(creds.find((c) => c.identifier === 'QB5911')).toBeUndefined()
  })

  it('aucun award émis si rge_qualifications absent (zéro invention)', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      rge_qualifications: null,
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    expect(node.award).toBeUndefined()
  })

  it('émet hasCredential SIRET INSEE quand siret 14 chiffres + is_verified=true', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '12345678901234',
      is_verified: true,
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const creds = (node.hasCredential as Array<Record<string, unknown>> | undefined) ?? []
    const siretCred = creds.find((c) => c.identifier === '12345678901234')
    expect(siretCred).toBeDefined()
    expect(siretCred?.credentialCategory).toContain('INSEE')
    const recognizedBy = siretCred?.recognizedBy as Record<string, unknown> | undefined
    expect(recognizedBy?.name).toContain('INSEE')
  })

  it('omit SIRET hasCredential quand is_verified=false (pas de conformité inventée)', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '12345678901234',
      is_verified: false,
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const creds = (node.hasCredential as Array<Record<string, unknown>> | undefined) ?? []
    expect(creds.find((c) => c.identifier === '12345678901234')).toBeUndefined()
  })

  it('omit SIRET hasCredential quand SIRET malformé (12 chiffres)', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '123456789012',
      is_verified: true,
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)
    const creds = (node.hasCredential as Array<Record<string, unknown>> | undefined) ?? []
    expect(creds.find((c) => c.identifier === '123456789012')).toBeUndefined()
  })

  it('combine award RGE + hasCredential RGE + hasCredential INSEE sur fiche complète', () => {
    const artisan: LegacyArtisan = {
      ...baseArtisan,
      siret: '12345678901234',
      is_verified: true,
      rge_qualifications: [
        {
          code: 'QER5111',
          nom: 'Photovoltaïque',
          organisme: "Qualit'EnR",
          domaine: 'Solaire',
          meta_domaine: 'Énergie',
          date_debut: '2024-01-01',
          date_fin: futureDate,
          url: null,
        },
      ],
    }
    const { container } = render(<ArtisanSchema artisan={artisan} />)
    const node = getLocalBusinessNode(container)

    // award présent (RGE)
    const awards = node.award as string[] | undefined
    expect(awards).toBeDefined()
    expect(awards?.[0]).toContain('Photovoltaïque')

    // hasCredential = tableau avec 2 éléments (RGE + INSEE)
    const creds = node.hasCredential as Array<Record<string, unknown>> | undefined
    expect(creds).toBeDefined()
    expect(creds?.length).toBe(2)
    expect(creds?.find((c) => c.identifier === 'QER5111')).toBeDefined()
    expect(creds?.find((c) => c.identifier === '12345678901234')).toBeDefined()
  })
})
