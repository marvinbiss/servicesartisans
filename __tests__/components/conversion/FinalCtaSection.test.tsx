// @vitest-environment jsdom
/**
 * Tests pour FinalCtaSection — bottom-of-page canonical conversion block.
 *
 * Contrat :
 *  - Rendu sémantique : <section> + aria-labelledby="final-cta-heading"
 *  - heading dans un <h2 id="final-cta-heading">
 *  - primaryCta : <a href> avec label, data-intent et icône ArrowRight
 *  - secondaryCta optionnel : non rendu si absent
 *  - trustLine optionnelle : non rendue si absente
 *  - accent variant change la classe (blue/green/amber)
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import FinalCtaSection from '@/components/conversion/FinalCtaSection'

describe('FinalCtaSection', () => {
  it('rend heading dans un <h2 id="final-cta-heading"> avec aria-labelledby', () => {
    const { container, getByText } = render(
      <FinalCtaSection
        heading="Trouvez votre artisan RGE à Lyon"
        description="Recevez 3 devis en moins de 24h"
        primaryCta={{ label: 'Demander mes devis', href: '/devis' }}
      />
    )
    expect(getByText('Trouvez votre artisan RGE à Lyon')).toBeTruthy()

    const h2 = container.querySelector('h2#final-cta-heading')
    expect(h2).not.toBeNull()
    expect(h2?.tagName).toBe('H2')

    const section = container.querySelector('section[aria-labelledby="final-cta-heading"]')
    expect(section).not.toBeNull()
  })

  it('rend le primaryCta avec href, label, intent et icône (svg)', () => {
    const { container, getByText } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{
          label: 'Demander mes devis',
          href: '/simulateur?service=pac&cp=69000',
          intent: 'final-devis',
        }}
      />
    )
    const link = container.querySelector('a[data-intent="final-devis"]') as HTMLAnchorElement | null
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/simulateur?service=pac&cp=69000')
    expect(getByText('Demander mes devis')).toBeTruthy()
    // ArrowRight icône = svg
    expect(link?.querySelector('svg')).not.toBeNull()
  })

  it('intent par défaut = "final-cta" si non précisé', () => {
    const { container } = render(
      <FinalCtaSection heading="t" description="d" primaryCta={{ label: 'OK', href: '/x' }} />
    )
    const link = container.querySelector('a[data-intent="final-cta"]')
    expect(link).not.toBeNull()
  })

  it('secondaryCta optionnel : non rendu si absent, rendu si fourni', () => {
    const { container: c1 } = render(
      <FinalCtaSection heading="t" description="d" primaryCta={{ label: 'Primary', href: '/p' }} />
    )
    expect(c1.querySelectorAll('a').length).toBe(1)

    const { container: c2, getByText } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{ label: 'Primary', href: '/p' }}
        secondaryCta={{ label: 'Voir RGE', href: '/rge' }}
      />
    )
    expect(c2.querySelectorAll('a').length).toBe(2)
    expect(getByText('Voir RGE')).toBeTruthy()
    const sec = c2.querySelector('a[href="/rge"]') as HTMLAnchorElement | null
    expect(sec).not.toBeNull()
  })

  it('trustLine optionnelle : non rendue si absente, rendue si fournie', () => {
    const { container: c1 } = render(
      <FinalCtaSection heading="t" description="d" primaryCta={{ label: 'P', href: '/p' }} />
    )
    expect(c1.textContent).not.toContain('artisans RGE')

    const { container: c2 } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{ label: 'P', href: '/p' }}
        trustLine="247 artisans RGE • Source Registre ADEME • RGPD"
      />
    )
    expect(c2.textContent).toContain('247 artisans RGE')
    expect(c2.textContent).toContain('Source Registre ADEME')
  })

  it('accent variants appliquent les bonnes classes (blue / green / amber)', () => {
    // Palette aliases SA :
    //   blue  → primary  (terra / maple)
    //   green → accent   (forest)
    //   amber → secondary (honey gold)
    const { container: cBlue } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{ label: 'P', href: '/p' }}
        accent="blue"
      />
    )
    expect(cBlue.querySelector('section')?.className).toMatch(/bg-primary-50/)
    expect(cBlue.querySelector('a[data-intent="final-cta"]')?.className).toMatch(/bg-primary-600/)

    const { container: cGreen } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{ label: 'P', href: '/p' }}
        accent="green"
      />
    )
    expect(cGreen.querySelector('section')?.className).toMatch(/bg-accent-50/)
    expect(cGreen.querySelector('a[data-intent="final-cta"]')?.className).toMatch(/bg-accent-600/)

    const { container: cAmber } = render(
      <FinalCtaSection
        heading="t"
        description="d"
        primaryCta={{ label: 'P', href: '/p' }}
        accent="amber"
      />
    )
    expect(cAmber.querySelector('section')?.className).toMatch(/bg-secondary-50/)
    expect(cAmber.querySelector('a[data-intent="final-cta"]')?.className).toMatch(
      /bg-secondary-600/
    )

    // default = blue → primary
    const { container: cDefault } = render(
      <FinalCtaSection heading="t" description="d" primaryCta={{ label: 'P', href: '/p' }} />
    )
    expect(cDefault.querySelector('section')?.className).toMatch(/bg-primary-50/)
  })
})
