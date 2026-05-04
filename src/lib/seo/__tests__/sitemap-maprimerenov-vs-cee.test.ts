import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { aidesSlugs } from '@/lib/aides/aides-catalog'
import { isAidesDeptHubSlug } from '@/lib/aides/dept-hub-data'

/**
 * Sprint AI Wave I 2026-05-03 — verrou comparator /aides/maprimerenov-vs-cee.
 *
 * La route statique gagne sur [slug] (App Router precedence). On vérifie :
 *   - URL listée dans le sitemap static (sinon Google ne la trouve pas)
 *   - Le slug `maprimerenov-vs-cee` n'est PAS dans aidesSlugs (sinon
 *     /aides/[slug]/page.tsx tente de matcher d'abord — pas le cas car static
 *     gagne, mais on ne veut pas non plus le voir apparaître dans le hub
 *     `aidesCatalog`).
 *   - Le slug n'est PAS un dept hub (sinon collision avec generateStaticParams).
 */

describe('Sprint AI Wave I — sitemap /aides/maprimerenov-vs-cee', () => {
  it('URL présente dans le sitemap static', async () => {
    const entries = await sitemap({ id: 'static' })
    const urls = entries.map((e) => e.url)
    expect(urls).toContain('https://servicesartisans.fr/aides/maprimerenov-vs-cee')
  })

  it('priority cohérente avec les pages comparators existantes (≥ 0.7)', async () => {
    const entries = await sitemap({ id: 'static' })
    const entry = entries.find((e) => e.url.endsWith('/aides/maprimerenov-vs-cee'))
    expect(entry).toBeDefined()
    expect(entry!.priority).toBeGreaterThanOrEqual(0.7)
  })

  it('slug "maprimerenov-vs-cee" pas dans aidesSlugs (anti-collision routing)', () => {
    expect(aidesSlugs).not.toContain('maprimerenov-vs-cee')
  })

  it('slug "maprimerenov-vs-cee" pas dans AIDES_INDEXED_DEPTS (anti-collision)', () => {
    expect(isAidesDeptHubSlug('maprimerenov-vs-cee')).toBe(false)
  })
})
