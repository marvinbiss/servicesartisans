import { describe, it, expect } from 'vitest'
import { validateDescription, RUBRIC_VERSION } from '@/lib/descriptions/validator'
import type { ProviderContext } from '@/lib/descriptions/prompts/rge-description-v1'

const baseCtx: ProviderContext = {
  name: 'Entreprise Dupont',
  slug: 'entreprise-dupont-lyon',
  address_city: 'Lyon',
  address_region: 'Auvergne-Rhône-Alpes',
  specialty: 'Plomberie chauffage',
  rge_qualifications: ['QualiPAC'],
  rge_valid_until: '2027-06-30',
  claimed_at: null,
  ademe_categories: ['Chauffage'],
  ademe_meta_domains: ['Solutions thermiques'],
  baseline_text: null,
}

// A 260-word description that:
//  - names the business, city and region verbatim
//  - mentions QualiPAC (the only qualification in context)
//  - uses intent cues (intervient, devis, ServicesArtisans, certifie)
//  - avoids concrete amounts and the word "rge" as substring (validator edge case)
//  - stays within 230-380 words for readability
const goodDescription = [
  'Entreprise Dupont est une société de Plomberie chauffage basée à Lyon, en Auvergne-Rhône-Alpes.',
  "L'équipe intervient sur le secteur lyonnais pour des travaux de Chauffage",
  'et propose un accompagnement local adapté aux logements de la région.',
  'Entreprise Dupont est certifiée QualiPAC, qualification valide jusque 2027-06-30.',
  'Cette qualification atteste du sérieux de la démarche technique et de la compétence des installateurs.',
  'La société propose des Solutions thermiques performantes et réalise chaque intervention',
  'avec une attention particulière portée au respect des règles de sécurité et de conformité.',
  'Les demandes de devis peuvent être adressées via ServicesArtisans pour obtenir une estimation détaillée',
  "afin d'étudier ensemble la solution la plus adaptée à chaque logement, en tenant compte de la configuration",
  'existante, des contraintes techniques rencontrées sur place et du budget envisagé par le client.',
  "L'entreprise met un point d'honneur à fournir un accompagnement clair, transparent et réactif.",
  "La zone d'intervention couvre la ville de Lyon ainsi que plusieurs communes limitrophes",
  "situées en Auvergne-Rhône-Alpes. Entreprise Dupont s'appuie sur une connaissance fine du tissu local",
  'et sur une expérience cumulée sur les problématiques rencontrées par les propriétaires de la région.',
  "Les interventions portent aussi bien sur l'installation de nouveaux équipements que sur la maintenance",
  "d'installations existantes, toujours dans le respect des normes en vigueur.",
  "Chaque projet de Chauffage et de Solutions thermiques fait l'objet d'une étude préalable",
  'afin de définir les options techniques pertinentes.',
  "L'entreprise reste joignable via ServicesArtisans pour toute demande de devis.",
].join(' ')

describe('validateDescription', () => {
  it('exposes a stable rubric version', () => {
    expect(RUBRIC_VERSION).toBe('rge-rubric-v1.2')
  })

  it('dim6_seo scores 10 when city, region and specialty all appear (no 3.3 ceiling)', () => {
    const score = validateDescription(goodDescription, baseCtx)
    expect(score.dim6_seo).toBe(10)
  })

  it('dim6_seo accepts region abbreviations (IDF for Île-de-France)', () => {
    const idfCtx: ProviderContext = {
      ...baseCtx,
      address_city: 'Paris',
      address_region: 'Île-de-France',
    }
    const text = goodDescription.replace(/Lyon/g, 'Paris').replace(/Auvergne-Rhône-Alpes/g, 'IDF')
    const score = validateDescription(text, idfCtx)
    expect(score.dim6_seo).toBeGreaterThanOrEqual(7)
  })

  it('dim9_qrg rewards E-E-A-T pillars instead of placeholder 5', () => {
    const score = validateDescription(goodDescription, baseCtx)
    expect(score.dim9_qrg).toBeGreaterThan(5)
  })

  it('dim9_qrg penalizes superlatives (Trustworthiness pillar)', () => {
    const text = `${goodDescription} Entreprise Dupont est le leader incontournable.`
    const score = validateDescription(text, baseCtx)
    expect(score.dim9_qrg).toBeLessThan(10)
  })

  it('passes a well-grounded description', () => {
    const score = validateDescription(goodDescription, baseCtx)
    expect(score.verdict).toBe('pass')
    expect(score.overall).toBeGreaterThanOrEqual(7.5)
    expect(score.dim5_ymyl).toBeGreaterThanOrEqual(8)
    expect(score.flags.every((f) => f.severity !== 'block')).toBe(true)
  })

  it('blocks on YMYL: aid keyword + concrete amount in euros', () => {
    // "euros" (not "€") so the \b boundary in YMYL_AMOUNT_REGEX fires.
    const text = `${goodDescription} MaPrimeRenov propose une aide de 5000 euros.`
    const score = validateDescription(text, baseCtx)
    expect(score.verdict).toBe('fail')
    expect(score.dim5_ymyl).toBe(0)
    expect(score.flags.some((f) => f.dimension === 'dim5_ymyl' && f.severity === 'block')).toBe(
      true
    )
  })

  it('blocks on hallucinated certification (Qualibat not in context)', () => {
    const text = goodDescription.replace(/QualiPAC/g, 'Qualibat')
    const score = validateDescription(text, baseCtx)
    expect(score.verdict).toBe('fail')
    expect(score.flags.some((f) => f.dimension === 'dim4_eeat' && f.severity === 'block')).toBe(
      true
    )
  })

  it('warns when business name is missing (E-E-A-T degraded)', () => {
    const text = goodDescription.replace(/Entreprise Dupont/g, 'Cette société')
    const score = validateDescription(text, baseCtx)
    expect(score.dim4_eeat).toBeLessThan(10)
    expect(score.flags.some((f) => f.dimension === 'dim4_eeat' && f.severity === 'warn')).toBe(true)
  })

  it('flags readability when description is too short', () => {
    const text = 'Entreprise Dupont à Lyon, QualiPAC, Chauffage.'
    const score = validateDescription(text, baseCtx)
    expect(score.dim7_readability).toBeLessThan(7)
    expect(score.flags.some((f) => f.dimension === 'dim7_readability')).toBe(true)
  })

  it('weights D5 (YMYL) heaviest: single dim miss tanks overall', () => {
    const text = `${goodDescription} Le montant peut atteindre 3000 euros.`
    const score = validateDescription(text, baseCtx)
    // Concrete amount alone (no aid keyword co-occurring) triggers warn, not block.
    // But with MaPrimeRenov keyword below it is a hard block.
    expect(score.dim5_ymyl).toBeLessThan(8)
  })

  it('returns breakdown for all 9 dimensions', () => {
    const score = validateDescription(goodDescription, baseCtx)
    expect(score).toHaveProperty('dim1_originality')
    expect(score).toHaveProperty('dim2_variability')
    expect(score).toHaveProperty('dim3_density')
    expect(score).toHaveProperty('dim4_eeat')
    expect(score).toHaveProperty('dim5_ymyl')
    expect(score).toHaveProperty('dim6_seo')
    expect(score).toHaveProperty('dim7_readability')
    expect(score).toHaveProperty('dim8_intent')
    expect(score).toHaveProperty('dim9_qrg')
  })

  it('boilerplate phrases reduce originality', () => {
    const text = `${goodDescription} Devis gratuit et sans engagement. N'hesitez pas a nous contacter.`
    const score = validateDescription(text, baseCtx)
    expect(score.dim1_originality).toBeLessThan(10)
  })
})
