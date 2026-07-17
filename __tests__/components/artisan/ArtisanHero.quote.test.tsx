// @vitest-environment jsdom
/**
 * « Le mot de l'artisan » (mig 546) — bloc citation du hero.
 * Gates : rendu UNIQUEMENT si isClaimed && artisan_quote (saisi dashboard,
 * donc claimed par construction — le gate protège contre toute régression
 * d'exposition côté mapping page.tsx).
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}))
vi.mock('@/lib/analytics/tracking', () => ({
  trackEvent: vi.fn(),
}))

import { ArtisanHero } from '@/components/artisan/ArtisanHero'
import type { LegacyArtisan } from '@/types/legacy'

const baseArtisan = {
  id: 'a1',
  business_name: 'Plomberie Martin',
  specialty: 'Plombier',
  specialty_slug: 'plombier',
  city: 'Lyon',
  postal_code: '69001',
  is_verified: true,
  rge_qualifications: null,
} as unknown as LegacyArtisan

const QUOTE = '22 ans de métier, je réponds moi-même à chaque demande.'

describe("ArtisanHero — « Le mot de l'artisan »", () => {
  it('affiche la citation signée quand claimed + quote', () => {
    render(
      <ArtisanHero artisan={{ ...baseArtisan, artisan_quote: QUOTE } as LegacyArtisan} isClaimed />
    )
    expect(screen.getByText(new RegExp(QUOTE))).toBeInTheDocument()
    expect(screen.getByText(/— Plomberie Martin/)).toBeInTheDocument()
  })

  it('ne rend RIEN si non claimed, même avec une quote (régression mapping)', () => {
    render(
      <ArtisanHero
        artisan={{ ...baseArtisan, artisan_quote: QUOTE } as LegacyArtisan}
        isClaimed={false}
      />
    )
    expect(screen.queryByText(new RegExp(QUOTE))).not.toBeInTheDocument()
  })

  it('ne rend rien si claimed sans quote', () => {
    render(<ArtisanHero artisan={baseArtisan} isClaimed />)
    expect(screen.queryByRole('blockquote')).not.toBeInTheDocument()
    expect(screen.queryByText(/«/)).not.toBeInTheDocument()
  })
})

describe('providerArtisanUpdateSchema — artisan_quote', () => {
  it('accepte 200 chars, null, et rejette 201', async () => {
    const { providerArtisanUpdateSchema } = await import('@/schemas/provider')
    expect(providerArtisanUpdateSchema.safeParse({ artisan_quote: 'a'.repeat(200) }).success).toBe(
      true
    )
    expect(providerArtisanUpdateSchema.safeParse({ artisan_quote: null }).success).toBe(true)
    expect(providerArtisanUpdateSchema.safeParse({ artisan_quote: 'a'.repeat(201) }).success).toBe(
      false
    )
  })
})
