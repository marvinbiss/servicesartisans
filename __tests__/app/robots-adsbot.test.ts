/**
 * Tests — src/app/robots.ts, règles AdsBot.
 *
 * Régression gardée : les patterns `/*?*gclid=` / `/*?*utm_*=` étaient
 * appliqués à AdsBot, qui crawle l'URL FINALE taguée par l'auto-tagging Ads.
 * Résultat : « Destination non explorable » → annonces refusées ou Quality
 * Score dégradé. Ce test empêche que l'anti-duplicate SEO reparte sur AdsBot.
 */

import { describe, it, expect } from 'vitest'
import robots from '@/app/robots'

type Rule = {
  userAgent?: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
}

function rulesFor(agent: string): Rule[] {
  const { rules } = robots()
  const list = (Array.isArray(rules) ? rules : [rules]) as Rule[]
  return list.filter((rule) => {
    const ua = rule.userAgent
    return Array.isArray(ua) ? ua.includes(agent) : ua === agent
  })
}

function disallowOf(agent: string): string[] {
  return rulesFor(agent).flatMap((rule) =>
    Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []
  )
}

const CLICK_ID_PATTERNS = ['/*?*gclid=', '/*?*gbraid=', '/*?*wbraid=']
const UTM_PATTERNS = ['/*?*utm_source=', '/*?*utm_medium=', '/*?*utm_campaign=']

describe('robots.ts — AdsBot', () => {
  it('déclare AdsBot explicitement (le wildcard * ne le couvre pas)', () => {
    expect(rulesFor('AdsBot-Google')).toHaveLength(1)
    expect(rulesFor('AdsBot-Google-Mobile')).toHaveLength(1)
  })

  it('ne bloque PAS AdsBot sur les URLs porteuses d un click-ID', () => {
    const disallow = disallowOf('AdsBot-Google')
    for (const pattern of CLICK_ID_PATTERNS) {
      expect(disallow).not.toContain(pattern)
    }
  })

  it('ne bloque PAS AdsBot sur les URLs taguées utm', () => {
    const disallow = disallowOf('AdsBot-Google')
    for (const pattern of UTM_PATTERNS) {
      expect(disallow).not.toContain(pattern)
    }
  })

  it('applique la même règle à AdsBot-Google-Mobile', () => {
    const disallow = disallowOf('AdsBot-Google-Mobile')
    for (const pattern of [...CLICK_ID_PATTERNS, ...UTM_PATTERNS]) {
      expect(disallow).not.toContain(pattern)
    }
  })

  it('continue de bloquer AdsBot sur les routes privées', () => {
    const disallow = disallowOf('AdsBot-Google')
    expect(disallow).toContain('/admin/')
    expect(disallow).toContain('/api/')
    expect(disallow).toContain('/espace-artisan/')
  })

  it('laisse AdsBot atteindre les landing pages payantes', () => {
    const disallow = disallowOf('AdsBot-Google')
    expect(disallow.some((p) => p.startsWith('/lp'))).toBe(false)
  })
})

describe('robots.ts — crawlers organiques', () => {
  it('conserve l anti-duplicate paramètres sur Googlebot', () => {
    const disallow = disallowOf('Googlebot')
    for (const pattern of [...CLICK_ID_PATTERNS, ...UTM_PATTERNS]) {
      expect(disallow).toContain(pattern)
    }
  })

  it('conserve l anti-duplicate paramètres sur le wildcard', () => {
    const disallow = disallowOf('*')
    expect(disallow).toContain('/*?*gclid=')
    expect(disallow).toContain('/*?*utm_source=')
  })

  it('conserve les routes privées sur Googlebot', () => {
    const disallow = disallowOf('Googlebot')
    expect(disallow).toContain('/admin/')
    expect(disallow).toContain('/api/')
  })
})
