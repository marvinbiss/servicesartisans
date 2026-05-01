import { describe, it, expect } from 'vitest'
import { RGE_ALLOWED_SERVICES, RGE_QUALIFICATION_LABELS } from '@/lib/rge/service-city-listings'
import { VALID_RGE_SERVICE_SLUGS } from '@/lib/seo/gone-paths'
import { SERVICE_TO_SPECIALTIES } from '@/lib/supabase'
import { getRgeServiceHubContent } from '@/lib/rge/service-hub-content'

describe('Élargissement RGE 2026-05-02 — invariants cross-files', () => {
  it('VALID_RGE_SERVICE_SLUGS miroir parfait de RGE_ALLOWED_SERVICES', () => {
    expect([...VALID_RGE_SERVICE_SLUGS].sort()).toEqual([...RGE_ALLOWED_SERVICES].sort())
  })

  it('chaque slug a une entrée dans RGE_QUALIFICATION_LABELS', () => {
    for (const slug of RGE_ALLOWED_SERVICES) {
      expect(RGE_QUALIFICATION_LABELS[slug], `label manquant pour ${slug}`).toBeDefined()
    }
  })

  it('chaque slug a une entrée dans SERVICE_TO_SPECIALTIES', () => {
    for (const slug of RGE_ALLOWED_SERVICES) {
      expect(SERVICE_TO_SPECIALTIES[slug], `specialty mapping manquant pour ${slug}`).toBeDefined()
      expect(SERVICE_TO_SPECIALTIES[slug].length).toBeGreaterThan(0)
    }
  })

  it('chaque slug a un contenu hub (h1, lede, faq, aides)', () => {
    for (const slug of RGE_ALLOWED_SERVICES) {
      const c = getRgeServiceHubContent(slug)
      expect(c, `content manquant pour ${slug}`).toBeDefined()
      expect(c.h1.length).toBeGreaterThan(0)
      expect(c.lede.length).toBeGreaterThan(0)
      expect(c.faq.length).toBeGreaterThan(0)
      expect(c.aides.length).toBeGreaterThan(0)
      expect(c.travaux.length).toBeGreaterThan(0)
    }
  })

  it('19 services post élargissement', () => {
    expect(RGE_ALLOWED_SERVICES.length).toBe(19)
  })
})
