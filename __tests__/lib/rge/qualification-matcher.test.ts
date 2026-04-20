/**
 * Tests unitaires — qualification-matcher
 * ---------------------------------------
 * Vérifie le mapping qualif ADEME → guides internes + codes CEE.
 * Libellés basés sur des échantillons réels du dataset data.gouv.fr
 * `liste-des-entreprises-rge-2` (champs nom/domaine/meta_domaine).
 */

import { describe, it, expect } from 'vitest'
import { matchQualifications, type RgeQualificationInput } from '@/lib/rge/qualification-matcher'

function q(partial: Partial<RgeQualificationInput>): RgeQualificationInput {
  return {
    code: partial.code ?? '',
    nom: partial.nom ?? '',
    organisme: partial.organisme ?? '',
    domaine: partial.domaine ?? null,
    meta_domaine: partial.meta_domaine ?? null,
    date_debut: partial.date_debut ?? '2024-01-01',
    date_fin: partial.date_fin ?? '2099-12-31',
    url: partial.url ?? null,
  }
}

describe('matchQualifications — entrées vides', () => {
  it('retourne un match vide pour null', () => {
    const res = matchQualifications(null, null)
    expect(res.guideSlugs).toEqual([])
    expect(res.ceeOpCodes).toEqual([])
    expect(res.categories).toEqual([])
  })

  it('retourne un match vide pour un tableau vide', () => {
    const res = matchQualifications([], [])
    expect(res.guideSlugs).toEqual([])
    expect(res.ceeOpCodes).toEqual([])
    expect(res.categories).toEqual([])
  })

  it('retourne un match vide pour undefined', () => {
    const res = matchQualifications(undefined, undefined)
    expect(res.guideSlugs).toEqual([])
  })
})

describe('matchQualifications — catégories principales', () => {
  it('détecte PAC depuis "QualiPAC Chauffage"', () => {
    const res = matchQualifications(
      [q({ nom: 'QualiPAC Chauffage — Pose de pompe à chaleur', organisme: 'Qualit\u2019ENR' })],
      []
    )
    expect(res.categories).toContain('pac')
    expect(res.guideSlugs).toContain('qualipac')
    expect(res.ceeOpCodes).toEqual(
      expect.arrayContaining(['BAR-TH-171', 'BAR-TH-129', 'BAR-TH-148'])
    )
  })

  it('détecte PAC depuis "pompe à chaleur" en texte libre', () => {
    const res = matchQualifications([q({ nom: 'Installation de pompe à chaleur air/eau' })], [])
    expect(res.categories).toContain('pac')
  })

  it('détecte chauffe-eau thermodynamique comme PAC', () => {
    const res = matchQualifications([q({ nom: 'Chauffe-eau thermodynamique' })], [])
    expect(res.categories).toContain('pac')
  })

  it('détecte bois depuis "Qualibois module Eau"', () => {
    const res = matchQualifications(
      [q({ nom: 'Qualibois module Eau', organisme: 'Qualit\u2019ENR' })],
      []
    )
    expect(res.categories).toContain('bois')
    expect(res.guideSlugs).toContain('qualibois')
    expect(res.ceeOpCodes).toEqual(expect.arrayContaining(['BAR-TH-112', 'BAR-TH-113']))
  })

  it('détecte bois depuis "poêle à granulés"', () => {
    const res = matchQualifications([q({ nom: 'Installation de poêle à granulés' })], [])
    expect(res.categories).toContain('bois')
  })

  it('détecte solaire thermique depuis "QualiSol CESI"', () => {
    const res = matchQualifications([q({ nom: 'QualiSol CESI', organisme: 'Qualit\u2019ENR' })], [])
    expect(res.categories).toContain('solaire-thermique')
    expect(res.guideSlugs).toContain('qualisol')
    // BAR-TH-143 (SSC) est mappé depuis 2026-04-20 (ajout guide éditorial)
    expect(res.ceeOpCodes).toContain('BAR-TH-143')
  })

  it('détecte photovoltaïque depuis "Panneaux Solaires Photovoltaïques"', () => {
    const res = matchQualifications([q({ nom: 'Panneaux Solaires Photovoltaïques' })], [])
    expect(res.categories).toContain('photovoltaique')
    expect(res.guideSlugs).toContain('qualipv')
  })

  it('détecte isolation depuis un libellé contenant "isolation"', () => {
    const res = matchQualifications(
      [q({ nom: 'Isolation thermique par l\u2019intérieur — combles' })],
      []
    )
    expect(res.categories).toContain('isolation')
    expect(res.ceeOpCodes).toEqual(
      expect.arrayContaining(['BAR-EN-101', 'BAR-EN-102', 'BAR-EN-103'])
    )
  })

  it('détecte menuiserie depuis "fenêtres"', () => {
    const res = matchQualifications([q({ nom: 'Remplacement de fenêtres double vitrage' })], [])
    expect(res.categories).toContain('menuiserie')
    expect(res.ceeOpCodes).toContain('BAR-EN-104')
  })

  it('détecte ventilation depuis "VMC double flux"', () => {
    const res = matchQualifications([q({ nom: 'VMC double flux haute performance' })], [])
    expect(res.categories).toContain('ventilation')
    expect(res.ceeOpCodes).toContain('BAR-TH-125')
  })

  it('détecte audit énergétique depuis "architecte"', () => {
    const res = matchQualifications(
      [q({ nom: 'Architecte — audit énergétique réglementaire' })],
      []
    )
    expect(res.categories).toContain('audit-energetique')
    expect(res.guideSlugs).toContain('architecte-audit-energetique')
    // Pas de code CEE pour audit
    expect(res.ceeOpCodes).toEqual([])
  })

  it('détecte chaudière gaz/fuel comme chaudiere-condensation (catégorie obsolète)', () => {
    const res = matchQualifications([q({ nom: 'Chaudière gaz à condensation' })], [])
    expect(res.categories).toContain('chaudiere-condensation')
    // BAR-TH-106 abrogée → aucun code CEE débloqué pour cette catégorie
    expect(res.ceeOpCodes.filter((c) => c === 'BAR-TH-106')).toEqual([])
  })
})

describe('matchQualifications — Sprint 4+5 : patterns Qualibat 5911 / 7131 / Qualifelec IRVE', () => {
  it('détecte Qualibat 5911 (thermique) via code + organisme', () => {
    const res = matchQualifications(
      [q({ code: '5911', nom: 'Installation de systèmes thermiques', organisme: 'Qualibat' })],
      []
    )
    expect(res.guideSlugs).toContain('qualibat-5911-thermique')
  })

  it('détecte Qualibat 5911 avec suffixe (5911-1, 5911-2)', () => {
    const res = matchQualifications(
      [q({ code: '5911-2', nom: 'Installation thermique classe 2', organisme: 'QUALIBAT SA' })],
      []
    )
    expect(res.guideSlugs).toContain('qualibat-5911-thermique')
  })

  it('ne détecte PAS Qualibat 5911 si organisme n\u2019est pas Qualibat', () => {
    const res = matchQualifications(
      [q({ code: '5911', nom: 'Thermique', organisme: 'Qualit\u2019ENR' })],
      []
    )
    expect(res.guideSlugs).not.toContain('qualibat-5911-thermique')
  })

  it('ne détecte PAS Qualibat 5911 si code ne commence pas par 5911', () => {
    const res = matchQualifications(
      [q({ code: '5912', nom: 'Autre qualif thermique', organisme: 'Qualibat' })],
      []
    )
    expect(res.guideSlugs).not.toContain('qualibat-5911-thermique')
  })

  it('détecte Qualibat 7131 (isolation ITI combles)', () => {
    const res = matchQualifications(
      [q({ code: '7131', nom: 'Isolation thermique intérieure combles', organisme: 'Qualibat' })],
      []
    )
    expect(res.guideSlugs).toContain('qualibat-7131-isolation')
  })

  it('détecte Qualibat 7141 vers le même guide (ITI toiture)', () => {
    const res = matchQualifications(
      [q({ code: '7141', nom: 'Isolation thermique toiture', organisme: 'Qualibat' })],
      []
    )
    expect(res.guideSlugs).toContain('qualibat-7131-isolation')
  })

  it('ne détecte PAS Qualibat isolation si organisme hors Qualibat', () => {
    const res = matchQualifications(
      [q({ code: '7131', nom: 'Isolation', organisme: 'Qualifelec' })],
      []
    )
    expect(res.guideSlugs).not.toContain('qualibat-7131-isolation')
  })

  it('détecte Qualifelec IRVE via "IRVE" dans le nom', () => {
    const res = matchQualifications(
      [q({ nom: 'Qualifelec IRVE Niveau 2', organisme: 'Qualifelec' })],
      ['Qualifelec']
    )
    expect(res.guideSlugs).toContain('qualifelec-irve')
  })

  it('détecte Qualifelec IRVE via "borne de recharge"', () => {
    const res = matchQualifications(
      [q({ nom: 'Installation de borne de recharge véhicule électrique' })],
      []
    )
    expect(res.guideSlugs).toContain('qualifelec-irve')
  })

  it('détecte Qualifelec IRVE via "infrastructure de recharge"', () => {
    const res = matchQualifications(
      [q({ nom: 'Infrastructure de recharge véhicule électrique P2' })],
      []
    )
    expect(res.guideSlugs).toContain('qualifelec-irve')
  })
})

describe('matchQualifications — organisme Qualifelec', () => {
  it('ajoute le guide qualifelec quand Qualifelec est dans les organismes', () => {
    const res = matchQualifications(
      [q({ nom: 'Panneaux Solaires Photovoltaïques', organisme: 'Qualifelec' })],
      ['Qualifelec']
    )
    expect(res.guideSlugs).toContain('qualifelec')
    // Le PV matche aussi qualipv en parallèle
    expect(res.guideSlugs).toContain('qualipv')
  })

  it('est insensible à la casse de l\u2019organisme', () => {
    const res = matchQualifications([q({ nom: 'PV' })], ['QUALIFELEC SAS'])
    expect(res.guideSlugs).toContain('qualifelec')
  })

  it('n\u2019ajoute pas qualifelec si organisme absent', () => {
    const res = matchQualifications(
      [q({ nom: 'Panneaux Solaires Photovoltaïques' })],
      ['Qualit\u2019ENR']
    )
    expect(res.guideSlugs).not.toContain('qualifelec')
  })
})

describe('matchQualifications — déduplication', () => {
  it('déduplique les guides quand plusieurs qualifs matchent la même catégorie', () => {
    const res = matchQualifications(
      [
        q({ nom: 'QualiPAC Chauffage' }),
        q({ nom: 'Pompe à chaleur air/eau' }),
        q({ nom: 'Chauffe-eau thermodynamique' }),
      ],
      []
    )
    const pacGuides = res.guideSlugs.filter((s) => s === 'qualipac')
    expect(pacGuides).toHaveLength(1)
  })

  it('déduplique les codes CEE', () => {
    const res = matchQualifications(
      [q({ nom: 'Isolation combles' }), q({ nom: 'Isolation plancher bas' })],
      []
    )
    const unique = new Set(res.ceeOpCodes)
    expect(unique.size).toBe(res.ceeOpCodes.length)
  })

  it('déduplique les catégories', () => {
    const res = matchQualifications([q({ nom: 'Pompe à chaleur' }), q({ nom: 'QualiPAC' })], [])
    const pacCats = res.categories.filter((c) => c === 'pac')
    expect(pacCats).toHaveLength(1)
  })
})

describe('matchQualifications — multi-catégories', () => {
  it('agrège plusieurs catégories pour un artisan polyvalent', () => {
    const res = matchQualifications(
      [
        q({ nom: 'QualiPAC Chauffage' }),
        q({ nom: 'Qualibois module Eau' }),
        q({ nom: 'QualiSol CESI' }),
      ],
      ['Qualit\u2019ENR']
    )
    expect(res.categories).toEqual(expect.arrayContaining(['pac', 'bois', 'solaire-thermique']))
    expect(res.guideSlugs).toEqual(expect.arrayContaining(['qualipac', 'qualibois', 'qualisol']))
    // PAC + bois contribuent des codes CEE
    expect(res.ceeOpCodes).toEqual(expect.arrayContaining(['BAR-TH-171', 'BAR-TH-112']))
  })
})

describe('matchQualifications — robustesse normalize', () => {
  it('gère les accents (é, è, à, ï)', () => {
    const res = matchQualifications([q({ nom: 'Pompe à chaleur aÉrothermique' })], [])
    expect(res.categories).toContain('pac')
  })

  it('gère les champs null (domaine, meta_domaine)', () => {
    const res = matchQualifications(
      [q({ nom: 'Pompe à chaleur', domaine: null, meta_domaine: null })],
      []
    )
    expect(res.categories).toContain('pac')
  })

  it('gère un code null/undefined sans crash', () => {
    const res = matchQualifications([q({ nom: 'Isolation' })], [])
    expect(res.guideSlugs).not.toContain('qualibat-7131-isolation')
    // Pas de code → pas de détection Qualibat stricte
  })
})

describe('matchQualifications — filtrage CEE_CODES_WITH_GUIDE', () => {
  it('ne retourne que des codes CEE ayant un guide interne', () => {
    const allowlist = new Set([
      'BAR-TH-171',
      'BAR-TH-172',
      'BAR-TH-174',
      'BAR-TH-129',
      'BAR-TH-143',
      'BAR-TH-148',
      'BAR-TH-159',
      'BAR-TH-112',
      'BAR-TH-113',
      'BAR-TH-125',
      'BAR-EN-101',
      'BAR-EN-102',
      'BAR-EN-103',
      'BAR-EN-104',
      'BAR-EN-108',
    ])
    const res = matchQualifications(
      [
        q({ nom: 'Pompe à chaleur' }),
        q({ nom: 'Isolation' }),
        q({ nom: 'Chaudière gaz condensation' }),
      ],
      []
    )
    for (const code of res.ceeOpCodes) {
      expect(allowlist.has(code)).toBe(true)
    }
  })
})
