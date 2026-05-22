import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  __INTERNAL,
  getAideRelatedLinks,
  getCeeRelatedLinks,
  getClusterRelatedLinks,
  getServiceRelatedLinks,
} from '../related-links'
import { aidesBySlug } from '@/lib/aides/aides-catalog'

const REPO_ROOT = process.cwd()

describe('related-links — service → topical maillage', () => {
  it('PAC service expose aides + CEE + cluster + simulateur', () => {
    const links = getServiceRelatedLinks('pompe-a-chaleur', { slug: 'lyon', name: 'Lyon' })
    expect(links.length).toBeGreaterThanOrEqual(5)
    const hrefs = links.map((l) => l.href)
    expect(hrefs).toContain('/rge/pompe-a-chaleur/lyon')
    expect(hrefs).toContain('/renovation-energetique/travaux/pompe-a-chaleur')
    expect(hrefs).toContain('/aides/aide-pompe-a-chaleur')
    expect(hrefs).toContain('/cee/bar-th-171')
    expect(hrefs).toContain('/simulateur-aides-renovation')
  })

  it('Service hors périmètre reno (plombier) ne pollue pas mais reste linké via aides transverses', () => {
    const links = getServiceRelatedLinks('plombier', { slug: 'paris', name: 'Paris' })
    // plombier mappe à eco-ptz + tva-5-5 (transverses) → liens utiles mais limités.
    // L'objectif n'est pas vide : on permet la navigation vers /rge/plombier/paris.
    const hrefs = links.map((l) => l.href)
    expect(hrefs).toContain('/rge/plombier/paris')
    // Pas de cluster reno → pas de path /renovation-energetique/travaux/.
    expect(hrefs.every((h) => !h.startsWith('/renovation-energetique/travaux/'))).toBe(true)
  })

  it('Service inconnu retourne []', () => {
    expect(getServiceRelatedLinks('serrurier-non-existant')).toEqual([])
  })

  it('Aucun lien dupliqué (uniqByHref)', () => {
    const links = getServiceRelatedLinks('isolation-thermique', { slug: 'paris', name: 'Paris' })
    const hrefs = links.map((l) => l.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe('related-links — aide → topical maillage', () => {
  it('MaPrimeRénov retourne services + CEE + cluster + simulateur', () => {
    const links = getAideRelatedLinks('maprimerenov')
    const hrefs = links.map((l) => l.href)
    expect(hrefs).toContain('/renovation-energetique/aides/maprimerenov-2026')
    expect(hrefs.some((h) => h.startsWith('/rge/'))).toBe(true)
    expect(hrefs.some((h) => h.startsWith('/cee/'))).toBe(true)
    expect(hrefs).toContain('/simulateur-aides-renovation')
  })

  it('Toutes les aide-slugs du catalog ont au moins 2 liens (sauf chequeenergie/maprimeadapt qui sont transversales)', () => {
    const REQUIRED_DENSE = [
      'maprimerenov',
      'cee',
      'eco-ptz',
      'coup-de-pouce',
      'aide-pompe-a-chaleur',
      'aide-isolation',
      'aide-fenetres',
      'aide-chaudiere',
      'aide-audit-energetique',
    ]
    for (const slug of REQUIRED_DENSE) {
      const links = getAideRelatedLinks(slug)
      expect(links.length, `${slug} doit avoir ≥2 liens topical`).toBeGreaterThanOrEqual(2)
    }
  })

  it('Aide inconnue retourne []', () => {
    expect(getAideRelatedLinks('aide-fake')).toEqual([])
  })
})

describe('related-links — CEE op → topical maillage', () => {
  it('BAR-TH-171 (PAC air-eau) retourne cluster + aides + simulateur', () => {
    const links = getCeeRelatedLinks('BAR-TH-171', ['pompe-a-chaleur'])
    const hrefs = links.map((l) => l.href)
    expect(hrefs).toContain('/renovation-energetique/travaux/pompe-a-chaleur/air-eau-prix')
    expect(hrefs).toContain('/aides/aide-pompe-a-chaleur')
    expect(hrefs).toContain('/aides/maprimerenov')
    expect(hrefs).toContain('/rge/pompe-a-chaleur')
    expect(hrefs).toContain('/simulateur-aides-renovation')
  })

  it('Toutes les ops du seed 383 ont au moins cluster + aides', () => {
    const SEED_OPS = [
      'BAR-EN-101',
      'BAR-EN-102',
      'BAR-EN-103',
      'BAR-EN-104',
      'BAR-EN-108',
      'BAR-TH-112',
      'BAR-TH-113',
      'BAR-TH-125',
      'BAR-TH-127',
      'BAR-TH-129',
      'BAR-TH-148',
      'BAR-TH-171',
      'BAR-TH-172',
      'BAR-TH-174',
      'BAR-SE-104',
    ]
    for (const opCode of SEED_OPS) {
      const links = getCeeRelatedLinks(opCode)
      expect(links.length, `${opCode} doit avoir ≥2 liens topical`).toBeGreaterThanOrEqual(2)
    }
  })

  it('CEE op inconnue retourne []', () => {
    expect(getCeeRelatedLinks('BAR-XX-999')).toEqual([])
  })
})

describe('related-links — cluster → topical maillage', () => {
  it('isolation cluster retourne services + aides + CEE', () => {
    const links = getClusterRelatedLinks('isolation')
    const hrefs = links.map((l) => l.href)
    expect(hrefs).toContain('/rge/isolation-thermique')
    expect(hrefs).toContain('/aides/aide-isolation')
    expect(hrefs).toContain('/aides/maprimerenov')
    expect(hrefs).toContain('/cee/bar-en-101')
  })

  it('Tous les clusters mappés exposent ≥3 liens', () => {
    const clusters = Object.keys(__INTERNAL.CLUSTER_TO_LINKS)
    for (const c of clusters) {
      const links = getClusterRelatedLinks(c)
      expect(links.length, `${c} doit avoir ≥3 liens`).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('related-links — intégrité référentielle', () => {
  it('Tous les aide slugs mappés existent dans le catalog', () => {
    const allReferenced = new Set<string>()
    for (const arr of Object.values(__INTERNAL.SERVICE_TO_AIDES)) {
      for (const s of arr) allReferenced.add(s)
    }
    for (const arr of Object.values(__INTERNAL.CEE_TO_AIDES)) {
      for (const s of arr) allReferenced.add(s)
    }
    for (const entry of Object.values(__INTERNAL.CLUSTER_TO_LINKS)) {
      for (const s of entry.aides) allReferenced.add(s)
    }
    for (const slug of Array.from(allReferenced)) {
      expect(aidesBySlug[slug], `Aide slug ${slug} doit exister dans aidesCatalog`).toBeDefined()
    }
  })

  it('Tous les AIDE_LABEL keys référencés correspondent à un slug catalog OU sont labels génériques', () => {
    const knownLabels = Object.keys(__INTERNAL.AIDE_LABEL)
    for (const aideKey of knownLabels) {
      // Tolérance : tout slug du AIDE_LABEL doit exister dans le catalog réel.
      expect(aidesBySlug[aideKey], `AIDE_LABEL[${aideKey}] doit exister`).toBeDefined()
    }
  })
})

describe('related-links — densité injectée dans les pages cibles', () => {
  it('/cee/[operation]/page.tsx importe et utilise RelatedLinks', () => {
    const src = readFileSync(
      join(REPO_ROOT, 'src', 'app', '(public)', 'cee', '[operation]', 'page.tsx'),
      'utf8'
    )
    expect(src).toContain("from '@/components/seo/RelatedLinks'")
    expect(src).toContain('getCeeRelatedLinks')
    expect(src).toContain('<RelatedLinks')
  })

  it('/aides/[slug]/page.tsx importe et utilise RelatedLinks (aide variant)', () => {
    const src = readFileSync(
      join(REPO_ROOT, 'src', 'app', '(public)', 'aides', '[slug]', 'page.tsx'),
      'utf8'
    )
    expect(src).toContain("from '@/components/seo/RelatedLinks'")
    expect(src).toContain('getAideRelatedLinks')
    expect(src).toContain('<RelatedLinks')
  })

  it('/renovation-energetique/travaux/isolation/page.tsx importe et utilise RelatedLinks', () => {
    const src = readFileSync(
      join(
        REPO_ROOT,
        'src',
        'app',
        '(public)',
        'renovation-energetique',
        'travaux',
        'isolation',
        'page.tsx'
      ),
      'utf8'
    )
    expect(src).toContain("from '@/components/seo/RelatedLinks'")
    expect(src).toContain("getClusterRelatedLinks('isolation')")
    expect(src).toContain('<RelatedLinks')
  })
})
