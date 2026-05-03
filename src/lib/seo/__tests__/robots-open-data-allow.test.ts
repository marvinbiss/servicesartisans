import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'

/**
 * Sprint AD Ahrefs 2026-05-03 — verrou exception robots.txt pour open-data.
 *
 * `/api/glossaire-rge.json` (Sprint AC) est servi sous `/api/` qui est
 * dans PRIVATE_DISALLOW. Sans Allow explicite, Googlebot/Bingbot/AI
 * crawlers ne pourront jamais découvrir l'asset open-data → backlink
 * magnet inerte. Ce test vérifie que chaque rule allow include bien
 * l'exception.
 */
type RobotRule = {
  userAgent?: string | string[]
  allow?: string | string[]
  disallow?: string | string[]
  crawlDelay?: number
}

describe('Sprint AD — robots.txt allow /api/glossaire-rge.json', () => {
  const r = robots()
  // Le type MetadataRoute.Robots.rules est Rule | Rule[]. Toujours array
  // dans notre implémentation (cf. robots.ts return rules: [...]).
  const rules: RobotRule[] = (Array.isArray(r.rules) ? r.rules : [r.rules]) as RobotRule[]

  it('chaque rule allow contient `/api/glossaire-rge.json`', () => {
    for (const rule of rules) {
      const allow = rule.allow
      // Skip rules avec disallow: ['/'] (AI training bots, scrapers spam)
      // — elles n'ont pas d'allow, sont en blocklist totale.
      if (!allow) continue
      const allowList = Array.isArray(allow) ? allow : [allow]
      expect(allowList, `rule ${JSON.stringify(rule.userAgent)}`).toContain(
        '/api/glossaire-rge.json'
      )
    }
  })

  it('Googlebot rule allow contient à la fois / et /api/glossaire-rge.json', () => {
    const googlebot = rules.find((rule) => rule.userAgent === 'Googlebot')
    expect(googlebot).toBeDefined()
    expect(Array.isArray(googlebot?.allow)).toBe(true)
    expect(googlebot?.allow).toContain('/')
    expect(googlebot?.allow).toContain('/api/glossaire-rge.json')
  })

  it("AI search bots (OAI-SearchBot, ChatGPT-User) ont aussi accès à l'open-data", () => {
    const aiBot = rules.find((rule) => {
      const ua = rule.userAgent
      return Array.isArray(ua) && ua.includes('OAI-SearchBot')
    })
    expect(aiBot).toBeDefined()
    expect(aiBot?.allow).toContain('/api/glossaire-rge.json')
  })

  it('PRIVATE_DISALLOW continue de bloquer le reste de /api/', () => {
    const googlebot = rules.find((rule) => rule.userAgent === 'Googlebot')
    const disallow = Array.isArray(googlebot?.disallow)
      ? googlebot?.disallow
      : googlebot?.disallow
        ? [googlebot.disallow]
        : []
    expect(disallow).toContain('/api/')
  })
})
