// @vitest-environment jsdom
/**
 * Tests composants intent routing — UrgencyBlock + ServiceIntentReroute
 * ---------------------------------------------------------------------
 * Vérifie que les 2 composants SSR introduits par le split intent
 * urgence / rénovation / travaux rendent correctement le contenu attendu
 * pour chaque registre éditorial.
 *
 * Contexte : les pages `/services/[service]/[ville]` servaient le même
 * template éditorial à TOUS les intents (dépannage + rénovation mélangés),
 * ce qui diluait le CTR et violait les guidelines people-first Google 2026
 * (§4.6.5/4.6.6). Le split est désormais piloté par `getServiceIntent`.
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import UrgencyBlock from '@/components/seo/UrgencyBlock'
import ServiceIntentReroute from '@/components/seo/ServiceIntentReroute'

// Stub next/link (éviter le router context de Next.js)
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

describe('UrgencyBlock', () => {
  it('renders service + city in heading', () => {
    const { container } = render(
      <UrgencyBlock
        serviceName="Plombier"
        villeName="Paris"
        providerCount={42}
        averageResponseTime="Sous 1h30"
        emergencyInfo="Disponible 24h/24 et 7j/7"
      />
    )
    expect(container.textContent).toContain('Plombier en urgence à Paris')
    expect(container.textContent).toContain('Sous 1h30')
    expect(container.textContent).toContain('42 artisans disponibles')
    expect(container.textContent).toContain('24h/24')
  })

  it('falls back to default intervention label when averageResponseTime is null', () => {
    const { container } = render(
      <UrgencyBlock
        serviceName="Serrurier"
        villeName="Lyon"
        providerCount={12}
        averageResponseTime={null}
        emergencyInfo={null}
      />
    )
    expect(container.textContent).toContain('Intervention sous 2h')
  })

  it('renders CTA link pointing to callbackAnchor', () => {
    const { container } = render(
      <UrgencyBlock
        serviceName="Plombier"
        villeName="Paris"
        providerCount={42}
        averageResponseTime={null}
        emergencyInfo={null}
        callbackAnchor="#callback-request"
      />
    )
    const cta = container.querySelector('a[href="#callback-request"]')
    expect(cta).not.toBeNull()
    expect(cta?.textContent).toMatch(/rappelé|15 min/i)
  })

  it('singular label when providerCount === 1', () => {
    const { container } = render(
      <UrgencyBlock
        serviceName="Vitrier"
        villeName="Brest"
        providerCount={1}
        averageResponseTime={null}
        emergencyInfo={null}
      />
    )
    expect(container.textContent).toContain('1 artisan disponible')
    expect(container.textContent).not.toContain('1 artisans')
  })
})

describe('ServiceIntentReroute', () => {
  const resolveServiceName = (slug: string) => {
    const map: Record<string, string> = {
      plombier: 'Plombier',
      chauffagiste: 'Chauffagiste',
      'pompe-a-chaleur': 'Pompe à chaleur',
      electricien: 'Électricien',
      'borne-recharge': 'Borne de recharge',
    }
    return map[slug] ?? null
  }

  it('renders reroute from plombier → chauffagiste', () => {
    const { container } = render(
      <ServiceIntentReroute
        serviceSlug="plombier"
        villeSlug="paris"
        villeName="Paris"
        resolveServiceName={resolveServiceName}
      />
    )
    const link = container.querySelector('a[href="/services/chauffagiste/paris"]')
    expect(link).not.toBeNull()
    expect(container.textContent).toMatch(/rénovation/i)
  })

  it('renders reroute from chauffagiste → plombier', () => {
    const { container } = render(
      <ServiceIntentReroute
        serviceSlug="chauffagiste"
        villeSlug="lyon"
        villeName="Lyon"
        resolveServiceName={resolveServiceName}
      />
    )
    const link = container.querySelector('a[href="/services/plombier/lyon"]')
    expect(link).not.toBeNull()
    expect(container.textContent).toMatch(/urgent/i)
  })

  it('returns null for services without reroute mapping', () => {
    const { container } = render(
      <ServiceIntentReroute
        serviceSlug="peintre-en-batiment"
        villeSlug="paris"
        villeName="Paris"
        resolveServiceName={resolveServiceName}
      />
    )
    expect(container.textContent).toBe('')
  })

  it('returns null if resolveServiceName returns null for the target', () => {
    const { container } = render(
      <ServiceIntentReroute
        serviceSlug="plombier"
        villeSlug="paris"
        villeName="Paris"
        resolveServiceName={() => null}
      />
    )
    expect(container.textContent).toBe('')
  })
})
