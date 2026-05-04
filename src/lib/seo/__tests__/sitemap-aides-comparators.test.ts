import { describe, expect, it } from 'vitest'

import sitemap from '@/app/sitemap'
import { aidesSlugs } from '@/lib/aides/aides-catalog'
import { isAidesDeptHubSlug } from '@/lib/aides/dept-hub-data'

/**
 * Sprint AI Wave K + L 2026-05-03 — verrou comparators et hubs /aides/*.
 *
 * Garantit pour chaque URL `/aides/<slug-static>` (comparator ou hub racine) :
 *   - URL présente dans le sitemap static (sinon Google ne la trouve pas)
 *   - Slug pas dans aidesSlugs (anti-collision routing /aides/[slug])
 *   - Slug pas dans AIDES_INDEXED_DEPTS (anti-collision dept hub)
 *   - Priority cohérente avec le tier (≥ 0.7)
 *
 * Wave L ajoute deux entrées :
 *   - `/aides/pompe-a-chaleur-aides-comparatif` (comparator par type PAC)
 *   - `/aides/par-region` (hub racine cluster régional)
 */

const COMPARATORS = [
  '/aides/maprimerenov-vs-cee',
  '/aides/eco-ptz-vs-credit-personnel',
  '/aides/maprimerenov-vs-coup-de-pouce',
  '/aides/pompe-a-chaleur-aides-comparatif',
  '/aides/par-region',
  '/aides/calendrier-2026',
  '/aides/anah-vs-maprimerenov',
] as const

describe('Sprint AI Wave K + L — sitemap aides comparators & hubs', () => {
  it.each(COMPARATORS)('%s présent dans le sitemap static', async (path) => {
    const entries = await sitemap({ id: 'static' })
    const urls = entries.map((e) => e.url)
    expect(urls).toContain(`https://servicesartisans.fr${path}`)
  })

  it.each(COMPARATORS)('%s priority ≥ 0.7', async (path) => {
    const entries = await sitemap({ id: 'static' })
    const entry = entries.find((e) => e.url.endsWith(path))
    expect(entry).toBeDefined()
    expect(entry!.priority).toBeGreaterThanOrEqual(0.7)
  })

  it.each(COMPARATORS)('%s slug pas dans aidesSlugs (anti-collision routing)', (path) => {
    const slug = path.replace('/aides/', '')
    expect(aidesSlugs).not.toContain(slug)
  })

  it.each(COMPARATORS)('%s slug pas dans AIDES_INDEXED_DEPTS', (path) => {
    const slug = path.replace('/aides/', '')
    expect(isAidesDeptHubSlug(slug)).toBe(false)
  })
})
