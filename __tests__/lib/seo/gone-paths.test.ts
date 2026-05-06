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
  VALID_PROBLEM_SLUGS,
  CEE_OPERATION_RE,
  VILLE_SLUG_RE,
  goneResponseHeaders,
  GONE_RESPONSE_BODY,
} from '@/lib/seo/gone-paths'
import { services as franceLightServices } from '@/lib/data/france-light'
import { RGE_ALLOWED_SERVICES } from '@/lib/rge/service-city-listings'
import allProblems from '@/lib/data/problems'

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

  it('routes statiques /rge/labels/[label] → passthrough (pas 410)', () => {
    // Bug 2026-05-05 : le regex dynamique `/rge/[s]/[v]/?$` capturait à tort
    // les routes statiques `/rge/labels/qualisol` (vol 908, KD 0) etc.
    expect(evaluateGonePath('/rge/labels/qualisol')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/labels/qualibat')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/labels/qualibois')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/labels/qualifelec')).toEqual({ gone: false })
    expect(evaluateGonePath('/rge/labels/qualipac')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — /cee/[operation]/[ville]', () => {
  it('opération au format FOS valide → gone:false', () => {
    expect(evaluateGonePath('/cee/BAR-TH-104/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/BAT-EN-101/lyon')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/IND-UT-103/toulouse')).toEqual({ gone: false })
  })

  // 2026-05-06 — Régression P0 : Next.js sert les URLs CEE en lowercase
  // (sitemap émet `${SITE_URL}/cee/${code}/${ville.slug}` avec
  // CEE_OPERATION_CODES en lowercase, et generateStaticParams retourne
  // op.code.toLowerCase()). Sans le flag /i sur CEE_OPERATION_RE, ~9 000
  // URLs sitemap déclenchaient un faux 410 → soft-410 sitemap massif.
  it('opération en minuscules → gone:false (Next.js sert lowercase)', () => {
    expect(evaluateGonePath('/cee/bar-th-104/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/bar-th-112/toulouse')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/bar-th-112/ludres')).toEqual({ gone: false })
    expect(evaluateGonePath('/cee/bar-th-112/les-herbiers')).toEqual({ gone: false })
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

describe('evaluateGonePath — /tarifs/[s]/[v]/[task] (DEPRECATED 2026-04-29)', () => {
  it('toute URL 4-segments → gone:true tarifs_task_deprecated', () => {
    expect(evaluateGonePath('/tarifs/plombier/paris/debouchage-de-canalisation')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
    })
    expect(evaluateGonePath('/tarifs/electricien/lyon/installation-tableau')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
    })
  })

  it('même avec service inconnu → gone:true (pattern match avant whitelist)', () => {
    expect(evaluateGonePath('/tarifs/coiffeur/paris/coupe-homme')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
    })
  })

  it('trailing slash → gone:true', () => {
    expect(evaluateGonePath('/tarifs/plombier/lyon/fuite-eau/')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
    })
  })

  it('NE matche PAS /tarifs/[s] (1 segment) → gone:false', () => {
    expect(evaluateGonePath('/tarifs/plombier')).toEqual({ gone: false })
  })

  it('/tarifs/[s]/[v] (2 segments) → 301 vers /services/[s]/[v]#tarifs (DEPRECATED 2026-04-30)', () => {
    expect(evaluateGonePath('/tarifs/plombier/paris')).toEqual({
      gone: false,
      redirect: { to: '/services/plombier/paris#tarifs', status: 301 },
    })
    expect(evaluateGonePath('/tarifs/electricien/lyon')).toEqual({
      gone: false,
      redirect: { to: '/services/electricien/lyon#tarifs', status: 301 },
    })
  })

  it('/tarifs/[s]/[v] avec service inconnu → 410 (gone:true)', () => {
    expect(evaluateGonePath('/tarifs/inexistant/paris')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/devis/[s]/[v] (2 segments) → 301 vers /services/[s]/[v] (DEPRECATED 2026-04-30)', () => {
    expect(evaluateGonePath('/devis/plombier/paris')).toEqual({
      gone: false,
      redirect: { to: '/services/plombier/paris', status: 301 },
    })
    expect(evaluateGonePath('/devis/electricien/lyon')).toEqual({
      gone: false,
      redirect: { to: '/services/electricien/lyon', status: 301 },
    })
  })

  it('/devis/[s]/[v] avec service inconnu → 410', () => {
    expect(evaluateGonePath('/devis/inexistant/paris')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/devis/[s]/[v] avec ville malformée → 410', () => {
    expect(evaluateGonePath('/devis/plombier/--bad-slug')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('NE matche PAS /tarifs (hub) → gone:false', () => {
    expect(evaluateGonePath('/tarifs')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — /tarifs/[s]/[v]/[task] whitelist GSC G3', () => {
  it('URL whitelistée (clic GSC actif 90j) → 301 vers /services/[s]/[v]#tarifs', () => {
    // Pivot pure-play BTP énergétique 2026-05-02 : test migré jardinier→couvreur
    // (jardinier retiré de VALID_SERVICE_SLUGS + whitelist GSC).
    expect(
      evaluateGonePath('/tarifs/couvreur/besancon/nettoyage-et-demoussage-de-toiture')
    ).toEqual({
      gone: false,
      redirect: { to: '/services/couvreur/besancon#tarifs', status: 301 },
    })
    expect(evaluateGonePath('/tarifs/serrurier/lyon/changement-de-serrure-standard')).toEqual({
      gone: false,
      redirect: { to: '/services/serrurier/lyon#tarifs', status: 301 },
    })
    expect(
      evaluateGonePath('/tarifs/couvreur/marseille/refection-complete-de-toiture-100-m')
    ).toEqual({
      gone: false,
      redirect: { to: '/services/couvreur/marseille#tarifs', status: 301 },
    })
  })

  it('whitelist case-insensitive + trailing slash tolérés', () => {
    // Lookup et cible 301 sont tous deux lowercased → on canonicalise vers
    // /services/{lowercase}/{lowercase}#tarifs.
    expect(
      evaluateGonePath('/Tarifs/Couvreur/Besancon/Nettoyage-Et-Demoussage-De-Toiture')
    ).toEqual({
      gone: false,
      redirect: { to: '/services/couvreur/besancon#tarifs', status: 301 },
    })
    expect(
      evaluateGonePath('/tarifs/couvreur/besancon/nettoyage-et-demoussage-de-toiture/')
    ).toEqual({
      gone: false,
      redirect: { to: '/services/couvreur/besancon#tarifs', status: 301 },
    })
  })

  it('URL hors whitelist (mêmes service+ville mais task différent) → gone:true', () => {
    expect(evaluateGonePath('/tarifs/couvreur/besancon/refection-complete-toiture-1000m')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
    })
  })

  it('URL hors whitelist (variation slug) → gone:true', () => {
    // proche d'une URL whitelistée mais service/ville/task différents
    expect(evaluateGonePath('/tarifs/plombier/paris/tonte-de-pelouse-jardin-de-200-m')).toEqual({
      gone: true,
      reason: 'tarifs_task_deprecated',
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
  it('valide les 6 préfixes secteurs FOS (uppercase)', () => {
    expect(CEE_OPERATION_RE.test('BAR-TH-104')).toBe(true)
    expect(CEE_OPERATION_RE.test('BAT-TH-102')).toBe(true)
    expect(CEE_OPERATION_RE.test('IND-UT-103')).toBe(true)
    expect(CEE_OPERATION_RE.test('RES-CH-108')).toBe(true)
    expect(CEE_OPERATION_RE.test('AGRI-TH-101')).toBe(true)
    expect(CEE_OPERATION_RE.test('TRA-EQ-101')).toBe(true)
  })

  // 2026-05-06 — Next.js sert les URLs en lowercase (sitemap + generateStaticParams).
  // Le regex doit accepter lowercase, sinon ~9 000 URLs CEE × ville déclenchent
  // un faux 410. Bug introduit non couvert par CI jusqu'à cette date.
  it('accepte les codes en lowercase (Next.js sert lowercase)', () => {
    expect(CEE_OPERATION_RE.test('bar-th-104')).toBe(true)
    expect(CEE_OPERATION_RE.test('bar-th-112')).toBe(true)
    expect(CEE_OPERATION_RE.test('bat-en-101')).toBe(true)
  })

  it('rejette les formats vraiment invalides', () => {
    expect(CEE_OPERATION_RE.test('BAR_TH_104')).toBe(false)
    expect(CEE_OPERATION_RE.test('BAR-TH-10')).toBe(false)
    expect(CEE_OPERATION_RE.test('BAR-TH-1045')).toBe(false)
    expect(CEE_OPERATION_RE.test('XYZ-TH-104')).toBe(false)
    expect(CEE_OPERATION_RE.test('BARTH-104')).toBe(false)
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

  it('21 services (post pivot full RGE 2026-05-03 : -4 commodity hors RGE)', () => {
    // Pivot RGE 2026-05-01 : 46 → 30 services (16 niche Tier C supprimés).
    // Pivot pure-play BTP 2026-05-02 : 30 → 25 (jardinier, paysagiste,
    // nettoyage, alarme-securite, demenageur retirés).
    // Pivot full RGE 2026-05-03 : 25 → 21 (serrurier, vitrier, carreleur,
    // cuisiniste retirés — commodity sans qualification RGE possible).
    expect(VALID_SERVICE_SLUGS.size).toBe(21)
  })
})

describe('evaluateGonePath — /problemes/[probleme] (pivot RGE 2026-05-01)', () => {
  it('problème valide simple → gone:false', () => {
    expect(evaluateGonePath('/problemes/fuite-eau')).toEqual({ gone: false })
    expect(evaluateGonePath('/problemes/canalisation-bouchee')).toEqual({ gone: false })
    expect(evaluateGonePath('/problemes/court-circuit')).toEqual({ gone: false })
  })

  it('slug killed (nuisibles) → gone:true problem_slug_unknown', () => {
    expect(evaluateGonePath('/problemes/nuisibles')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
    expect(evaluateGonePath('/problemes/infestation-fourmis')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
  })

  it('slug inconnu arbitraire → gone:true problem_slug_unknown', () => {
    expect(evaluateGonePath('/problemes/inexistant-slug')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
  })
})

describe('evaluateGonePath — /problemes/[probleme]/[ville]', () => {
  it('problème valide + ville valide → gone:false', () => {
    expect(evaluateGonePath('/problemes/fuite-eau/paris')).toEqual({ gone: false })
    expect(evaluateGonePath('/problemes/serrure-bloquee/saint-etienne')).toEqual({ gone: false })
  })

  it('problème killed + ville valide → gone:true problem_slug_unknown', () => {
    expect(evaluateGonePath('/problemes/nuisibles/paris')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
    expect(evaluateGonePath('/problemes/infestation-fourmis/lyon')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
  })

  it('problème valide + ville malformée → gone:true ville_slug_malformed', () => {
    expect(evaluateGonePath('/problemes/fuite-eau/Paris')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })

  it('problème killed prime sur ville malformée (ordre check)', () => {
    expect(evaluateGonePath('/problemes/nuisibles/Paris')).toEqual({
      gone: true,
      reason: 'problem_slug_unknown',
    })
  })
})

describe('evaluateGonePath — bare hubs (pivot RGE soft-404 leak fix)', () => {
  it('/services/serrurier (bare hub dead slug) → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/services/serrurier')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/avis/serrurier → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/avis/serrurier')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/devis/vitrier → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/devis/vitrier')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/tarifs/carreleur → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/tarifs/carreleur')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/urgence/cuisiniste → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/urgence/cuisiniste')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('bare hub avec slug valide → gone:false (pass-through)', () => {
    expect(evaluateGonePath('/services/plombier')).toEqual({ gone: false })
    expect(evaluateGonePath('/avis/chauffagiste')).toEqual({ gone: false })
    expect(evaluateGonePath('/devis/electricien')).toEqual({ gone: false })
  })

  it('/services/serrurier/autour-de-moi → 410 service_slug_unknown', () => {
    expect(evaluateGonePath('/services/serrurier/autour-de-moi')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/services/plombier/autour-de-moi → gone:false', () => {
    expect(evaluateGonePath('/services/plombier/autour-de-moi')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — /avis|/urgence/[service]/[ville] (2-segment)', () => {
  it('/avis/serrurier/paris → 410', () => {
    expect(evaluateGonePath('/avis/serrurier/paris')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/urgence/serrurier/lyon → 410', () => {
    expect(evaluateGonePath('/urgence/serrurier/lyon')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/avis/plombier/paris → gone:false', () => {
    expect(evaluateGonePath('/avis/plombier/paris')).toEqual({ gone: false })
  })

  it('/avis/plombier/Paris (MAJ) → 410 ville_slug_malformed', () => {
    expect(evaluateGonePath('/avis/plombier/Paris')).toEqual({
      gone: true,
      reason: 'ville_slug_malformed',
    })
  })
})

describe('evaluateGonePath — /departements|/regions/[territory]/[service]', () => {
  it('/departements/seine-saint-denis/serrurier → 410', () => {
    expect(evaluateGonePath('/departements/seine-saint-denis/serrurier')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/regions/ile-de-france/vitrier → 410', () => {
    expect(evaluateGonePath('/regions/ile-de-france/vitrier')).toEqual({
      gone: true,
      reason: 'service_slug_unknown',
    })
  })

  it('/departements/seine-saint-denis/plombier → gone:false', () => {
    expect(evaluateGonePath('/departements/seine-saint-denis/plombier')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — /rge/[service]/departement/[dept]', () => {
  it('/rge/serrurier/departement/75 → 410 rge_service_slug_unknown', () => {
    expect(evaluateGonePath('/rge/serrurier/departement/75')).toEqual({
      gone: true,
      reason: 'rge_service_slug_unknown',
    })
  })

  it('/rge/chauffagiste/departement/75 → gone:false', () => {
    expect(evaluateGonePath('/rge/chauffagiste/departement/75')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — Sprint U /qualifications-rge → 301 /rge/qualifications', () => {
  // Sprint AI Ahrefs 2026-05-03 — `cacheControl` ajouté pour permettre
  // rollback CDN rapide pendant la phase de validation Sprint U.
  const SHORT_CACHE = 'public, max-age=3600, s-maxage=3600'

  it('/qualifications-rge → 301 vers /rge/qualifications avec TTL CDN court', () => {
    expect(evaluateGonePath('/qualifications-rge')).toEqual({
      gone: false,
      redirect: { to: '/rge/qualifications', status: 301, cacheControl: SHORT_CACHE },
    })
  })

  it('/qualifications-rge/ (trailing slash) → 301 vers /rge/qualifications avec TTL CDN court', () => {
    expect(evaluateGonePath('/qualifications-rge/')).toEqual({
      gone: false,
      redirect: { to: '/rge/qualifications', status: 301, cacheControl: SHORT_CACHE },
    })
  })

  it('/qualifications-rge/sub-path NON traité ici (passe à travers)', () => {
    // Le bloc 13 ne match QUE le path exact. Tout sous-chemin retombe sur
    // le default `{ gone: false }` final — Next.js retournera 404 standard.
    expect(evaluateGonePath('/qualifications-rge/foo')).toEqual({ gone: false })
  })

  it('/rge/qualifications (cible canonique) → gone:false (pas de redirect loop)', () => {
    expect(evaluateGonePath('/rge/qualifications')).toEqual({ gone: false })
  })
})

describe('evaluateGonePath — Sprint W /comparatifs → 301 /comparaison', () => {
  // Sprint AI Ahrefs 2026-05-03 — `cacheControl` ajouté pour permettre
  // rollback CDN rapide pendant la phase de validation Sprint W.
  const SHORT_CACHE = 'public, max-age=3600, s-maxage=3600'

  it('/comparatifs → 301 vers /comparaison avec TTL CDN court', () => {
    expect(evaluateGonePath('/comparatifs')).toEqual({
      gone: false,
      redirect: { to: '/comparaison', status: 301, cacheControl: SHORT_CACHE },
    })
  })

  it('/comparatifs/ (trailing slash) → 301 vers /comparaison avec TTL CDN court', () => {
    expect(evaluateGonePath('/comparatifs/')).toEqual({
      gone: false,
      redirect: { to: '/comparaison', status: 301, cacheControl: SHORT_CACHE },
    })
  })

  it('/comparatifs/sub-path NON traité (passe à travers)', () => {
    expect(evaluateGonePath('/comparatifs/foo')).toEqual({ gone: false })
  })

  it('/comparaison (cible canonique) → gone:false (pas de redirect loop)', () => {
    expect(evaluateGonePath('/comparaison')).toEqual({ gone: false })
  })
})

describe('VALID_PROBLEM_SLUGS — cohérence avec problems.ts', () => {
  it('contient exactement les slugs déclarés (zéro écart)', () => {
    const sourceSlugs = new Set(allProblems.map((p) => p.slug))
    expect(Array.from(VALID_PROBLEM_SLUGS).sort()).toEqual(Array.from(sourceSlugs).sort())
  })

  it('exclut explicitement les slugs killed du pivot RGE 2026-05-01', () => {
    expect(VALID_PROBLEM_SLUGS.has('nuisibles')).toBe(false)
    expect(VALID_PROBLEM_SLUGS.has('infestation-fourmis')).toBe(false)
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
