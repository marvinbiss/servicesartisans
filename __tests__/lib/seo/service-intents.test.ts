import { describe, expect, it } from 'vitest'
import {
  getServiceIntent,
  getIntentTitleVariants,
  getIntentH1Variants,
  getIntentMetaDescription,
  getCrossIntentTarget,
  shouldRenderRenovationBlocks,
  shouldRenderUrgencyBlock,
  __internal,
} from '@/lib/seo/service-intents'

describe('service-intents — classification', () => {
  it('classifies URGENCE services correctly', () => {
    expect(getServiceIntent('plombier')).toBe('urgence')
    expect(getServiceIntent('serrurier')).toBe('urgence')
    expect(getServiceIntent('electricien')).toBe('urgence')
    expect(getServiceIntent('vitrier')).toBe('urgence')
    expect(getServiceIntent('ramoneur')).toBe('urgence')
    expect(getServiceIntent('desinsectisation')).toBe('urgence')
    expect(getServiceIntent('deratisation')).toBe('urgence')
    expect(getServiceIntent('ascensoriste')).toBe('urgence')
  })

  it('classifies RÉNOVATION services correctly', () => {
    expect(getServiceIntent('chauffagiste')).toBe('renovation')
    expect(getServiceIntent('pompe-a-chaleur')).toBe('renovation')
    expect(getServiceIntent('panneaux-solaires')).toBe('renovation')
    expect(getServiceIntent('isolation-thermique')).toBe('renovation')
    expect(getServiceIntent('renovation-energetique')).toBe('renovation')
    expect(getServiceIntent('climaticien')).toBe('renovation')
    expect(getServiceIntent('borne-recharge')).toBe('renovation')
    expect(getServiceIntent('diagnostiqueur')).toBe('renovation')
    expect(getServiceIntent('etancheiste')).toBe('renovation')
    expect(getServiceIntent('zingueur')).toBe('renovation')
    expect(getServiceIntent('facadier')).toBe('renovation')
  })

  it('defaults to TRAVAUX for unclassified slugs', () => {
    expect(getServiceIntent('peintre-en-batiment')).toBe('travaux')
    expect(getServiceIntent('menuisier')).toBe('travaux')
    expect(getServiceIntent('carreleur')).toBe('travaux')
    expect(getServiceIntent('macon')).toBe('travaux')
    expect(getServiceIntent('paysagiste')).toBe('travaux')
    expect(getServiceIntent('decorateur')).toBe('travaux')
    expect(getServiceIntent('demenageur')).toBe('travaux')
    expect(getServiceIntent('unknown-service')).toBe('travaux')
  })

  it('no service appears in both URGENCE and RÉNOVATION sets', () => {
    const urgence = Array.from(__internal.URGENCE_SERVICES)
    const reno = Array.from(__internal.RENOVATION_SERVICES)
    for (const slug of urgence) {
      expect(__internal.RENOVATION_SERVICES.has(slug)).toBe(false)
    }
    for (const slug of reno) {
      expect(__internal.URGENCE_SERVICES.has(slug)).toBe(false)
    }
  })
})

describe('service-intents — block gating', () => {
  it('shouldRenderRenovationBlocks only on renovation', () => {
    expect(shouldRenderRenovationBlocks('renovation')).toBe(true)
    expect(shouldRenderRenovationBlocks('urgence')).toBe(false)
    expect(shouldRenderRenovationBlocks('travaux')).toBe(false)
  })

  it('shouldRenderUrgencyBlock only on urgence', () => {
    expect(shouldRenderUrgencyBlock('urgence')).toBe(true)
    expect(shouldRenderUrgencyBlock('renovation')).toBe(false)
    expect(shouldRenderUrgencyBlock('travaux')).toBe(false)
  })
})

describe('service-intents — title variants', () => {
  const baseCtx = {
    serviceName: 'Plombier',
    locationName: 'Paris',
    providerCount: 42,
    reviewPrefix: '',
    year: 2026,
    departmentCode: '75',
  }

  it('URGENCE titles mention 24h/24 or dépannage/urgence', () => {
    const variants = getIntentTitleVariants('urgence', baseCtx)
    expect(variants.length).toBeGreaterThanOrEqual(4)
    for (const t of variants) {
      const hasUrgencySignal = /24h|dépannage|urgence|rapide|intervention/i.test(t)
      expect(hasUrgencySignal, `Missing urgency signal in: "${t}"`).toBe(true)
    }
  })

  it('RÉNOVATION titles mention RGE or MaPrimeRénov\u2019 or aides', () => {
    const variants = getIntentTitleVariants('renovation', {
      ...baseCtx,
      serviceName: 'Chauffagiste',
    })
    expect(variants.length).toBeGreaterThanOrEqual(4)
    for (const t of variants) {
      const hasRenoSignal = /RGE|MaPrimeRénov|CEE|aides|certifiés?/i.test(t)
      expect(hasRenoSignal, `Missing renovation signal in: "${t}"`).toBe(true)
    }
  })

  it('TRAVAUX titles do NOT mention 24h/24 nor RGE (stay neutral)', () => {
    const variants = getIntentTitleVariants('travaux', {
      ...baseCtx,
      serviceName: 'Peintre',
    })
    for (const t of variants) {
      expect(/24h\/24/i.test(t), `TRAVAUX must not mention 24h/24: "${t}"`).toBe(false)
      expect(/RGE/.test(t), `TRAVAUX must not mention RGE: "${t}"`).toBe(false)
    }
  })

  it('review prefix is injected on all variants when provided', () => {
    const withPrefix = getIntentTitleVariants('urgence', {
      ...baseCtx,
      reviewPrefix: '4.8★ (128 avis) · ',
    })
    for (const t of withPrefix) {
      expect(t.startsWith('4.8★ (128 avis) · ')).toBe(true)
    }
  })
})

describe('service-intents — H1 variants', () => {
  const baseH1 = {
    serviceName: 'Plombier',
    locationName: 'Paris',
    providerCount: 42,
    departmentCode: '75',
    pluralTerm: 'plombiers',
  }

  it('URGENCE H1s mention 24h/24 or urgence', () => {
    const variants = getIntentH1Variants('urgence', baseH1)
    for (const h of variants) {
      expect(/24h|urgent|urgence|dépannage/i.test(h)).toBe(true)
    }
  })

  it('RÉNOVATION H1s mention RGE or MaPrimeRénov\u2019 or certifiés', () => {
    const variants = getIntentH1Variants('renovation', {
      ...baseH1,
      serviceName: 'Chauffagiste',
      pluralTerm: 'chauffagistes',
    })
    for (const h of variants) {
      expect(/RGE|MaPrimeRénov|certifiés?/i.test(h)).toBe(true)
    }
  })

  it('TRAVAUX H1s stay neutral (no urgency, no RGE)', () => {
    const variants = getIntentH1Variants('travaux', {
      ...baseH1,
      serviceName: 'Peintre',
      pluralTerm: 'peintres',
    })
    for (const h of variants) {
      expect(/24h/i.test(h)).toBe(false)
      expect(/RGE/.test(h)).toBe(false)
    }
  })
})

describe('service-intents — meta descriptions', () => {
  const ctx = {
    serviceName: 'Plombier',
    locationName: 'Paris',
    providerCount: 42,
    year: 2026,
  }

  it('URGENCE description mentions 24h/24 and devis rapide', () => {
    const d = getIntentMetaDescription('urgence', ctx)
    expect(d).toMatch(/24h\/24/)
    expect(d).toMatch(/devis|intervention/i)
  })

  it('RÉNOVATION description mentions RGE + MaPrimeRénov\u2019', () => {
    const d = getIntentMetaDescription('renovation', { ...ctx, serviceName: 'Chauffagiste' })
    expect(d).toMatch(/RGE/)
    expect(d).toMatch(/MaPrimeRénov|CEE|aides/i)
  })

  it('TRAVAUX description is neutral (no 24h, no RGE)', () => {
    const d = getIntentMetaDescription('travaux', { ...ctx, serviceName: 'Peintre' })
    expect(d).not.toMatch(/24h\/24/)
    expect(d).not.toMatch(/RGE/)
  })

  it('uses "Artisans vérifiés" as fallback when providerCount is 0', () => {
    const d = getIntentMetaDescription('urgence', { ...ctx, providerCount: 0 })
    expect(d).toMatch(/[Aa]rtisans vérifiés/)
  })
})

describe('service-intents — cross-intent reroute', () => {
  it('returns a reroute for plombier → chauffagiste (urgence → rénovation)', () => {
    const r = getCrossIntentTarget('plombier')
    expect(r).not.toBeNull()
    expect(r?.targetSlug).toBe('chauffagiste')
    expect(r?.sourceIntent).toBe('urgence')
    expect(r?.targetIntent).toBe('renovation')
  })

  it('returns a reroute for chauffagiste → plombier (rénovation → urgence)', () => {
    const r = getCrossIntentTarget('chauffagiste')
    expect(r).not.toBeNull()
    expect(r?.targetSlug).toBe('plombier')
    expect(r?.sourceIntent).toBe('renovation')
    expect(r?.targetIntent).toBe('urgence')
  })

  it('returns null for services without reroute mapping', () => {
    expect(getCrossIntentTarget('peintre-en-batiment')).toBeNull()
    expect(getCrossIntentTarget('serrurier')).toBeNull()
    expect(getCrossIntentTarget('macon')).toBeNull()
  })

  it('never reroutes to a target of same intent', () => {
    const reroute = __internal.CROSS_INTENT_REROUTE
    for (const [source, target] of Object.entries(reroute)) {
      const sourceIntent = getServiceIntent(source)
      const targetIntent = getServiceIntent(target)
      expect(
        sourceIntent,
        `${source} (${sourceIntent}) must not reroute to ${target} of same intent`
      ).not.toBe(targetIntent)
    }
  })

  it('CTA label matches source intent (urgence → invites rénovation)', () => {
    const r = getCrossIntentTarget('plombier')
    expect(r?.ctaLabel).toMatch(/rénovation/i)
  })

  it('CTA label matches source intent (rénovation → invites urgence)', () => {
    const r = getCrossIntentTarget('chauffagiste')
    expect(r?.ctaLabel).toMatch(/urgent/i)
  })
})
