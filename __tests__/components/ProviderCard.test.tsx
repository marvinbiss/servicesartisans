/**
 * Tests ProviderCard — rel="nofollow" PageRank sculpting
 * -------------------------------------------------------
 * Vérifie que les liens sortants vers les fiches `noindex=true` (920K
 * artisans non-RGE) portent `rel="nofollow"` pour concentrer le PageRank
 * sur les 46K fiches RGE visibles en SERP.
 *
 * Source stratégique : Google Search Central — rel="nofollow" = "source
 * douteuse" / "ne pas transmettre d'autorité". Ici les fiches non-RGE
 * sont sans signal de qualité vérifiable tant qu'elles ne sont pas
 * revendiquées ou validées RGE.
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import ProviderCard from '@/components/ProviderCard'
import type { Provider } from '@/types'

// Stub next/link pour éviter le router context
vi.mock('next/link', () => ({
  default: React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    function NextLinkStub(props, ref) {
      const { children, ...rest } = props
      return (
        <a ref={ref} {...rest}>
          {children}
        </a>
      )
    }
  ),
}))

// Stub tracking (évite les appels analytics dans les tests)
vi.mock('@/lib/analytics/tracking', () => ({
  trackEvent: vi.fn(),
}))

// Stub images-faces (évite dépendance DiceBear)
vi.mock('@/lib/data/images-faces', () => ({
  getDiceBearAvatar: () => 'data:image/svg+xml;utf8,<svg/>',
}))

const baseProvider: Partial<Provider> & Pick<Provider, 'id' | 'name'> = {
  id: 'uuid-1',
  stable_id: 'abc123',
  name: 'Plomberie Test',
  slug: 'plomberie-test',
  specialty: 'Plombier',
  address_city: 'Lyon',
  is_verified: false,
  is_active: true,
  noindex: false,
  rating_average: 4.5,
  review_count: 12,
  user_id: null,
}

describe('ProviderCard — rel="nofollow" sculpting', () => {
  it('n\u2019ajoute PAS rel="nofollow" quand noindex=false (fiche RGE visible)', () => {
    const { container } = render(<ProviderCard provider={{ ...baseProvider, noindex: false }} />)
    const links = Array.from(container.querySelectorAll('a[href]'))
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('rel')).toBeNull()
    }
  })

  it('ajoute rel="nofollow" sur TOUS les liens quand noindex=true', () => {
    const { container } = render(<ProviderCard provider={{ ...baseProvider, noindex: true }} />)
    const links = Array.from(container.querySelectorAll('a[href]')).filter((a) => {
      const href = a.getAttribute('href') || ''
      // Filtre sur les liens sortants vers la fiche — les liens internes comme
      // "#devis" héritent aussi du rel via linkRel (design voulu).
      return href.startsWith('/')
    })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute('rel')).toBe('nofollow')
    }
  })

  it('comportement par défaut (noindex non défini) = pas de nofollow', () => {
    const p = { ...baseProvider }
    delete (p as Partial<Provider>).noindex
    const { container } = render(<ProviderCard provider={p} />)
    const links = Array.from(container.querySelectorAll('a[href]'))
    for (const link of links) {
      expect(link.getAttribute('rel')).toBeNull()
    }
  })

  it('variant claimed (user_id défini) propage aussi le rel sur devis+profil', () => {
    const { container } = render(
      <ProviderCard provider={{ ...baseProvider, user_id: 'user-1', noindex: true }} />
    )
    const devisLink = container.querySelector('a[href*="#devis"]')
    expect(devisLink?.getAttribute('rel')).toBe('nofollow')
  })
})
