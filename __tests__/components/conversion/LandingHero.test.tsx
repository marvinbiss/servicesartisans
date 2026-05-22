// @vitest-environment jsdom
/**
 * Tests pour LandingHero — hero canonique landing pages pSEO SA.
 *
 * Contrat couvert :
 *  1. H1 rendu et identifié par aria-labelledby
 *  2. CTA primaire présent avec href, label et data-intent
 *  3. Rating affiché conditionnellement (omis si pas fourni / count=0 / average=0)
 *  4. Trust badges rendus (avec liens optionnels)
 *  5. Sticky mobile CTA présent par défaut + désactivable
 *  6. Variants d'accent (terra / forest / sand) appliquent un gradient distinct
 *  7. CTA secondaire optionnel
 *  8. Eyebrow optionnel
 *  9. Star count = 5 dans le rating bloc
 * 10. Rating clampé (>5 ramené à 5, <0 à 0)
 */

import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import React from 'react'

import { LandingHero } from '@/components/conversion/LandingHero'

const baseProps = {
  h1: 'Pompe à chaleur à Lyon — artisans RGE certifiés',
  subtitle:
    'Comparez des artisans RGE pompe à chaleur à Lyon. Devis gratuit, SIREN + ADEME vérifiés.',
  primaryCta: {
    label: 'Demander un devis gratuit',
    href: '/devis/pompe-a-chaleur/lyon',
    intent: 'devis' as const,
  },
}

describe('LandingHero', () => {
  it('rend le H1 et l’expose via aria-labelledby', () => {
    render(<LandingHero {...baseProps} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent(baseProps.h1)
    expect(h1.id).toBe('landing-hero-title')

    const section = h1.closest('section')
    expect(section).not.toBeNull()
    expect(section?.getAttribute('aria-labelledby')).toBe('landing-hero-title')
  })

  it('rend le CTA primaire avec href, label et data-intent', () => {
    render(<LandingHero {...baseProps} stickyMobileCta={false} />)
    const links = screen.getAllByRole('link', { name: baseProps.primaryCta.label })
    expect(links.length).toBeGreaterThanOrEqual(1)
    const cta = links[0]
    expect(cta.getAttribute('href')).toBe(baseProps.primaryCta.href)
    expect(cta.getAttribute('data-intent')).toBe('devis')
  })

  it('rend le rating seulement quand fourni avec count > 0 et average > 0', () => {
    const { rerender, container } = render(<LandingHero {...baseProps} stickyMobileCta={false} />)
    expect(screen.queryByText(/\/5/)).toBeNull()

    rerender(
      <LandingHero {...baseProps} stickyMobileCta={false} rating={{ average: 4.6, count: 1240 }} />
    )
    expect(screen.getByText('4.6/5')).toBeInTheDocument()
    expect(screen.getByText(/1\s?240/)).toBeInTheDocument()
    expect(screen.getByText(/avis vérifiés/)).toBeInTheDocument()

    // 5 étoiles dans la rangée rating
    const aria = container.querySelector('[aria-label^="Note moyenne"]')
    expect(aria).not.toBeNull()
    const svgs = aria!.querySelectorAll('svg')
    expect(svgs.length).toBe(5)

    // count = 0 → pas de rating
    rerender(
      <LandingHero {...baseProps} stickyMobileCta={false} rating={{ average: 4.6, count: 0 }} />
    )
    expect(screen.queryByText('4.6/5')).toBeNull()

    // average = 0 → pas de rating non plus
    rerender(
      <LandingHero {...baseProps} stickyMobileCta={false} rating={{ average: 0, count: 50 }} />
    )
    expect(screen.queryByText(/\/5/)).toBeNull()
  })

  it('rend les trust badges (texte + lien optionnel)', () => {
    render(
      <LandingHero
        {...baseProps}
        stickyMobileCta={false}
        trustBadges={[
          { label: 'Artisans RGE', icon: 'shield', href: '/rge' },
          { label: 'Devis 2 min', icon: 'check' },
        ]}
      />
    )
    const linkBadge = screen.getByRole('link', { name: 'Artisans RGE' })
    expect(linkBadge.getAttribute('href')).toBe('/rge')
    expect(screen.getByText('Devis 2 min')).toBeInTheDocument()
  })

  it('rend la sticky mobile CTA par défaut, désactivable via stickyMobileCta=false', () => {
    const { container, rerender } = render(<LandingHero {...baseProps} />)
    // 2 occurrences du CTA : hero + sticky
    let ctas = screen.getAllByRole('link', { name: baseProps.primaryCta.label })
    expect(ctas.length).toBe(2)
    const stickyCta = ctas.find((el) => el.getAttribute('data-intent') === 'devis-sticky-mobile')
    expect(stickyCta).toBeDefined()
    expect(container.querySelector('[aria-label="Action principale (mobile)"]')).not.toBeNull()

    rerender(<LandingHero {...baseProps} stickyMobileCta={false} />)
    ctas = screen.getAllByRole('link', { name: baseProps.primaryCta.label })
    expect(ctas.length).toBe(1)
    expect(container.querySelector('[aria-label="Action principale (mobile)"]')).toBeNull()
  })

  it('applique un gradient distinct selon le variant accent', () => {
    const { container, rerender } = render(
      <LandingHero {...baseProps} accent="terra" stickyMobileCta={false} />
    )
    let section = container.querySelector('section')!
    expect(section.className).toContain('from-primary-50')

    rerender(<LandingHero {...baseProps} accent="forest" stickyMobileCta={false} />)
    section = container.querySelector('section')!
    expect(section.className).toContain('from-accent-50')

    rerender(<LandingHero {...baseProps} accent="sand" stickyMobileCta={false} />)
    section = container.querySelector('section')!
    expect(section.className).toContain('from-sand-100')
  })

  it('rend le CTA secondaire uniquement si fourni', () => {
    const { rerender } = render(<LandingHero {...baseProps} stickyMobileCta={false} />)
    expect(screen.queryByRole('link', { name: /simulateur/i })).toBeNull()

    rerender(
      <LandingHero
        {...baseProps}
        stickyMobileCta={false}
        secondaryCta={{ label: 'Estimer mes aides', href: '/simulateur-aides-renovation' }}
      />
    )
    const sec = screen.getByRole('link', { name: 'Estimer mes aides' })
    expect(sec.getAttribute('href')).toBe('/simulateur-aides-renovation')
  })

  it('rend l’eyebrow seulement quand fourni', () => {
    const { rerender } = render(<LandingHero {...baseProps} stickyMobileCta={false} />)
    expect(screen.queryByText('Rénovation énergétique')).toBeNull()

    rerender(
      <LandingHero {...baseProps} stickyMobileCta={false} eyebrow="Rénovation énergétique" />
    )
    expect(screen.getByText('Rénovation énergétique')).toBeInTheDocument()
  })

  it('clampe le rating entre 0 et 5 dans l’affichage', () => {
    const { rerender } = render(
      <LandingHero {...baseProps} stickyMobileCta={false} rating={{ average: 7.2, count: 100 }} />
    )
    expect(screen.getByText('5.0/5')).toBeInTheDocument()

    rerender(
      <LandingHero {...baseProps} stickyMobileCta={false} rating={{ average: -1, count: 100 }} />
    )
    // average -1 clampé à 0 → showRating est false (safeRating > 0) → bloc absent
    expect(screen.queryByText(/\/5/)).toBeNull()
  })

  it('respecte un label de rating customisé', () => {
    render(
      <LandingHero
        {...baseProps}
        stickyMobileCta={false}
        rating={{ average: 4.4, count: 320, label: 'avis Google' }}
      />
    )
    expect(screen.getByText(/avis Google/)).toBeInTheDocument()
  })

  it('expose des CTAs avec hauteur tactile ≥ 44px (WCAG)', () => {
    const { container } = render(<LandingHero {...baseProps} />)
    const ctas = container.querySelectorAll('a[data-intent^="devis"]')
    expect(ctas.length).toBe(2)
    ctas.forEach((cta) => {
      expect(cta.className).toContain('min-h-[44px]')
    })
    // silence unused
    void within
  })
})
