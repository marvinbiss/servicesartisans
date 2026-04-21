/**
 * Tests — gone-paths : validation statique des slugs ISR vulnérables au
 * bug Next.js 14.2 #69103.
 *
 * Le module doit être 100% pur (aucun I/O, testable sans mock). On couvre :
 *   1. Les 4 routes vulnérables (services, rge, cee, artisans-rge)
 *   2. Les routes non-concernées (doivent passer à travers)
 *   3. Les slugs service/RGE dans la whitelist
 *   4. Les slugs CEE au format FOS valide/invalide
 *   5. Les villes au format slug lowercase valide/invalide
 *   6. Cohérence VALID_SERVICE_SLUGS avec france-light.ts (source de vérité)
 */

import { describe, it, expect } from 'vitest'
import {
  evaluateGonePath,
  VALID_SERVICE_SLUGS,
  VALID_RGE_SERVICE_SLUGS,
  CEE_OPERATION_RE,
  VILLE_SLUG_RE,
  goneResponseHeaders,
  GONE_RESPONSE_BODY,
} from '@/lib/seo/gone-paths'
import { services as franceLightServices } from '@/lib/data/france-light'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'

describe('evaluateGonePath — /services/[service]/[location]', () => {
  it('valid service + valid ville → gone:false', () => {
    expect(evaluateGonePath('/services/plombier/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/services/electricien/saint-etienne')).toEqual({ gone: false })
  })

  it('service inconnu → gone:true service_slug_unknown', () => {
    expect(evaluateGonePath('/services/coiffeur/paris')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
    expect(evaluateGonePath('/services/notaire/lyon')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('ville malformée (MAJ) → gone:true ville_slug_malformed', () => {
    expect(evaluateGonePath('/services/plombier/Paris')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('ville avec underscore → gone:true', () => {
    expect(evaluateGonePath('/services/plombier/saint_etienne')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('ville avec double-tiret → gone:true (ambiguïté encodage)', () => {
    expect(evaluateGonePath('/services/plombier/saint--etienne')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('tiret en bord → gone:true', () => {
    expect(evaluateGonePath('/services/plombier/-paris')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
    expect(evaluateGonePath('/services/plombier/paris-')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('ne matche PAS /services/[s]/[v]/[publicId] (fiche artisan = 3 segments)', () => {
    // Cette URL doit passer à travers au rendu page, pas être trappée à 410.
    expect(evaluateGonePath('/services/plombier/paris/ABC123xyz')).toEqual({ gone: false })
  })

  it('trailing slash toléré', () => {
    expect(evaluateGonePath('/services/plombier/paris/')).toEqual({ gone: false })
    expect(evaluateGonePath('/services/coiffeur/paris/')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })
})

describe('evaluateGonePath — /rge/[service]/[ville]', () => {
  it('service RGE valide + ville valide → gone:false', () => {
    expect(evaluateGonePath('/rge/pompe-a-chaleur/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/isolation-thermique/lyon')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/chauffagiste/bordeaux')).toEqual({ gone: false })
  })

  it('service non-RGE (même si service général valide) → gone:true', () => {
    // serrurier est un service valide MAIS n'est PAS RGE-éligible
    expect(evaluateGonePath('/rge/serrurier/paris')).toEqual({
      gone: true,
      reason: 'rge_service_slug_unknown',
    })
  })

  it('service totalement inconnu → gone:true', () => {
    expect(evaluateGonePath('/rge/coiffeur/paris')).toEqual({
      gone: true,
      reason: 'rge_service_slug_unknown',
    })
  })

  it('service RGE valide + ville malformée → gone:true ville', () => {
    expect(evaluateGonePath('/rge/pompe-a-chaleur/PARIS')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })
})

describe('evaluateGonePath — /cee/[operation]/[ville]', () => {
  it('opération au format FOS valide → gone:false', () => {
    expect(evaluateGonePath('/cee/BAR-TH-104/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/BAT-EN-101/lyon')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/IND-UT-103/toulouse')).toEqual({ gone: false })
  })

  it('opération en minuscules → gone:true (format FOS exige MAJ)', () => {
    expect(evaluateGonePath('/cee/bar-th-104/paris')).toEqual({
      gone: true,
      reason: 'cee_operation_invalid_format',
    })
  })

  it('secteur inconnu → gone:true', () => {
    expect(evaluateGonePath('/cee/ZZZ-TH-104/paris')).toEqual({
      gone: true,
      reason: 'cee_operation_invalid_format',
    })
  })

  it('format incomplet → gone:true', () => {
    expect(evaluateGonePath('/cee/BAR-TH/paris')).toEqual({
      gone: true,
      reason: 'cee_operation_invalid_format',
    })
    expect(evaluateGonePath('/cee/BAR-TH-10/paris')).toEqual({
      gone: true,
      reason: 'cee_operation_invalid_format',
    })
    expect(evaluateGonePath('/cee/BAR-TH-1045/paris')).toEqual({
      gone: true,
      reason: 'cee_operation_invalid_format',
    })
  })

  it('opération valide + ville malformée → gone ville', () => {
    expect(evaluateGonePath('/cee/BAR-TH-104/saint_denis')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })
})

describe('evaluateGonePath — /artisans-rge/[ville]', () => {
  it('ville valide → gone:false', () => {
    expect(evaluateGonePath('/artisans-rge/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/artisans-rge/marseille-5')).toEqual({ gone: false })
  })

  it('ville malformée → gone:true', () => {
    expect(evaluateGonePath('/artisans-rge/Paris')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
    expect(evaluateGonePath('/artisans-rge/p')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })
})

describe('evaluateGonePath — routes non-vulnérables (passthrough)', () => {
  it('homepage', () => {
    expect(evaluateGonePath('/')).toEqual({ gone: false })
  })

  it('routes statiques', () => {
    expect(evaluateGonePath('/tarifs')).toEqual({ gone: false })
    expect(evaluateGonePath('/blog')).toEqual({ gone: false })
    expect(evaluateGonePath('/a-propos')).toEqual({ gone: false })
  })

  it('routes blog (dynamicParams=false, pas vulnérable)', () => {
    expect(evaluateGonePath('/blog/renovation-energetique-2026')).toEqual({ gone: false })
  })

  it('API routes', () => {
    expect(evaluateGonePath('/api/devis')).toEqual({ gone: false })
    expect(evaluateGonePath('/api/sitemap-providers')).toEqual({ gone: false })
  })

  it('sitemap/robots/next static', () => {
    expect(evaluateGonePath('/sitemap.xml')).toEqual({ gone: false })
    expect(evaluateGonePath('/robots.txt')).toEqual({ gone: false })
  })

  it('espace privé', () => {
    expect(evaluateGonePath('/espace-client/devis')).toEqual({ gone: false })
    expect(evaluateGonePath('/espace-artisan/leads')).toEqual({ gone: false })
  })
})

describe('CEE_OPERATION_RE', () => {
  it('valide les 6 préfixes secteurs FOS', () => {
    expect(CEE_OPERATION_RE.test('BAR-TH-104')).toBe(true)
    expect(CEE_OPERATION_RE.test('BAT-TH-102')).toBe(true)
    expect(CEE_OPERATION_RE.test('IND-UT-103')).toBe(true)
    expect(CEE_OPERATION_RE.test('RES-CH-108')).toBe(true)
    expect(CEE_OPERATION_RE.test('AGRI-TH-101')).toBe(true)
    expect(CEE_OPERATION_RE.test('TRA-EQ-101')).toBe(true)
  })

  it('rejette les variantes invalides', () => {
    expect(CEE_OPERATION_RE.test('bar-th-104')).toBe(false)
    expect(CEE_OPERATION_RE.test('BAR_TH_104')).toBe(false)
    expect(CEE_OPERATION_RE.test('BAR-TH-10')).toBe(false)
    expect(CEE_OPERATION_RE.test('BAR-TH-1045')).toBe(false)
    expect(CEE_OPERATION_RE.test('XYZ-TH-104')).toBe(false)
  })
})

describe('VILLE_SLUG_RE', () => {
  it('accepte les slugs de communes courants', () => {
    expect(VILLE_SLUG_RE.test('paris')).toBe(true)
    expect(VILLE_SLUG_RE.test('marseille-5')).toBe(true)
    expect(VILLE_SLUG_RE.test('saint-etienne')).toBe(true)
    expect(VILLE_SLUG_RE.test('la-rochelle')).toBe(true)
    expect(VILLE_SLUG_RE.test('fort-de-france')).toBe(true)
    expect(VILLE_SLUG_RE.test('16eme-arrondissement')).toBe(true)
    expect(VILLE_SLUG_RE.test('aix-en-provence')).toBe(true)
  })

  it('rejette les slugs malformés', () => {
    expect(VILLE_SLUG_RE.test('Paris')).toBe(false) // majuscule
    expect(VILLE_SLUG_RE.test('saint_etienne')).toBe(false) // underscore
    expect(VILLE_SLUG_RE.test('saint--etienne')).toBe(false) // double tiret
    expect(VILLE_SLUG_RE.test('-paris')).toBe(false) // tiret début
    expect(VILLE_SLUG_RE.test('paris-')).toBe(false) // tiret fin
    expect(VILLE_SLUG_RE.test('p')).toBe(false) // trop court
    expect(VILLE_SLUG_RE.test('a'.repeat(61))).toBe(false) // trop long
    expect(VILLE_SLUG_RE.test('ça-roule')).toBe(false) // accents/unicode
    expect(VILLE_SLUG_RE.test('')).toBe(false) // vide
  })
})

describe('VALID_SERVICE_SLUGS — cohérence avec france-light.ts', () => {
  it('contient exactement les slugs déclarés dans france-light.services', () => {
    const lightSlugs = new Set(franceLightServices.map((s) => s.slug))
    // Pas d'écart toléré : si la liste prod évolue, MAJ gone-paths + test.
    expect(Array.from(VALID_SERVICE_SLUGS).sort()).toEqual(Array.from(lightSlugs).sort())
  })

  it('46 services (15 historiques + 31 Sprint 1)', () => {
    expect(VALID_SERVICE_SLUGS.size).toBe(46)
  })
})

describe('VALID_RGE_SERVICE_SLUGS — cohérence avec RGE_ALLOWED_SERVICES', () => {
  it('correspond exactement à RGE_ALLOWED_SERVICES (source de vérité)', () => {
    const canonical = new Set<string>(RGE_ALLOWED_SERVICES)
    expect(Array.from(VALID_RGE_SERVICE_SLUGS).sort()).toEqual(Array.from(canonical).sort())
  })

  it('contient les services RGE critiques MaPrimeRénov', () => {
    expect(VALID_RGE_SERVICE_SLUGS.has('chauffagiste')).toBe(true)
    expect(VALID_RGE_SERVICE_SLUGS.has('pompe-a-chaleur')).toBe(true)
    expect(VALID_RGE_SERVICE_SLUGS.has('isolation-thermique')).toBe(true)
    expect(VALID_RGE_SERVICE_SLUGS.has('panneaux-solaires')).toBe(true)
  })

  it('ne contient PAS les services non-RGE', () => {
    expect(VALID_RGE_SERVICE_SLUGS.has('serrurier')).toBe(false)
    expect(VALID_RGE_SERVICE_SLUGS.has('vitrier')).toBe(false)
    expect(VALID_RGE_SERVICE_SLUGS.has('jardinier')).toBe(false)
  })
})

describe('goneResponseHeaders', () => {
  it('expose les headers attendus pour HTTP 410', () => {
    const h = goneResponseHeaders()
    expect(h['Content-Type']).toBe('text/plain; charset=utf-8')
    expect(h['X-Robots-Tag']).toBe('noindex, nofollow')
    expect(h['Cache-Control']).toContain('s-maxage=86400')
    expect(h['CDN-Cache-Control']).toContain('s-maxage=86400')
  })
})

describe('GONE_RESPONSE_BODY', () => {
  it('body minimal sans HTML (éviter leakage de contenu)', () => {
    expect(GONE_RESPONSE_BODY).not.toContain('<')
    expect(GONE_RESPONSE_BODY).toMatch(/Gone/i)
  })
})
