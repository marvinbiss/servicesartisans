/**
 * Tests unitaires du builder de meta description — fiche artisan détaillée.
 * Vérifie que `provider.description` enrichie (rubric v1.3, ~50K RGE) est
 * promue en meta description SERP au lieu du template générique.
 *
 * La logique est privée (dans generateMetadata) : on duplique ici la branche
 * pour figer le contrat. Si generateMetadata diverge, ces tests deviennent
 * des documents vivants du comportement attendu.
 */
import { describe, it, expect } from 'vitest'

// Extract-verbatim de la logique src/app/(public)/services/[service]/[location]/[publicId]/page.tsx
// Si tu changes l'un, change l'autre — ou mieux, extrais la fonction.
function buildMetaDescription(input: {
  description?: string | null
  displayName: string
  serviceName: string
  realCity: string
  available_24h?: boolean
  intervention_radius_km?: number
  rating?: number
  reviewCount?: number
  siret?: string
  is_verified?: boolean
}): string {
  const svcLower = input.serviceName.toLowerCase()
  const rating = input.rating ?? 0
  const reviewCount = input.reviewCount ?? 0

  const enriched = input.description?.replace(/\s+/g, ' ').trim() || ''
  if (enriched.length >= 120) {
    return enriched.length > 155 ? enriched.slice(0, 155).replace(/\s+\S*$/, '') + '…' : enriched
  }

  let desc = `${input.displayName}, ${svcLower} à ${input.realCity}`
  if (input.available_24h) desc += ' — Intervention 7j/7'
  else if (input.intervention_radius_km && input.intervention_radius_km > 0)
    desc += ` — Intervention dans un rayon de ${input.intervention_radius_km} km`
  else desc += ` et ses environs`
  desc += '.'

  if (rating >= 1 && reviewCount > 0)
    desc += ` Note ${rating.toFixed(1)}/5 sur ${reviewCount} avis.`
  else if (rating >= 1) desc += ` Note ${rating.toFixed(1)}/5.`

  if (input.siret) desc += ' SIRET vérifié.'
  else if (input.is_verified) desc += ' Artisan vérifié.'

  desc += ' Devis gratuit en ligne.'
  if (desc.length < 140) {
    desc += ` Comparez les ${svcLower}s à ${input.realCity} et demandez un devis personnalisé sans engagement.`
  }
  return desc.length > 160 ? desc.slice(0, 159).replace(/\s+\S*$/, '') + '…' : desc
}

const ENRICHED_SAMPLE =
  "E-H ENERGIE, basée à Bénesse-Maremne en Nouvelle-Aquitaine, intervient dans le domaine des installations d'énergies renouvelables. L'entreprise se concentre sur la pose de systèmes de chauffage et de production d'eau chaude sanitaire utilisant des technologies thermodynamiques et renouvelables."

describe('buildMetaDescription — enriched branch (~50K RGE)', () => {
  const base = {
    displayName: 'E-H ENERGIE',
    serviceName: 'Chauffagiste',
    realCity: 'Bénesse-Maremne',
  }

  it('utilise la description enrichie quand >= 120 chars', () => {
    const out = buildMetaDescription({ ...base, description: ENRICHED_SAMPLE })
    expect(out).toMatch(/^E-H ENERGIE, basée à Bénesse-Maremne/)
    expect(out).not.toMatch(/Devis gratuit en ligne/) // branche enrichie = pas de CTA fallback
  })

  it('tronque à ≤156 chars avec ellipsis sur frontière mot', () => {
    const out = buildMetaDescription({ ...base, description: ENRICHED_SAMPLE })
    expect(out.length).toBeLessThanOrEqual(156) // 155 + ellipsis
    expect(out).toMatch(/…$/)
    // Le char juste avant "…" est une lettre (fin de mot), jamais un espace
    expect(out).not.toMatch(/\s…$/)
  })

  it('aplati les espaces multiples dans la description enrichie', () => {
    const messy =
      'NOM\n\nBasée   à   Lyon,\t\tintervient   dans le domaine des\n\nénergies renouvelables depuis 2010. La société pose systèmes photovoltaïques.'
    const out = buildMetaDescription({ ...base, description: messy })
    expect(out).not.toMatch(/\s{2,}/)
    expect(out).not.toMatch(/\n/)
    expect(out).not.toMatch(/\t/)
  })

  it('ignore enriched si trop court (<120 chars) et tombe sur template', () => {
    const tooShort = 'Entreprise sérieuse.'
    const out = buildMetaDescription({
      ...base,
      description: tooShort,
      rating: 4.8,
      reviewCount: 12,
      siret: '31075643200012',
    })
    expect(out).toMatch(/Devis gratuit en ligne/)
    expect(out).toMatch(/Note 4\.8\/5 sur 12 avis/)
    expect(out).toMatch(/SIRET vérifié/)
  })
})

describe('buildMetaDescription — template fallback (~920K non-enrichies)', () => {
  const base = {
    displayName: 'Jean Dupont',
    serviceName: 'Plombier',
    realCity: 'Lyon',
  }

  it('retourne template core quand description absente', () => {
    const out = buildMetaDescription(base)
    expect(out).toMatch(/^Jean Dupont, plombier à Lyon/)
    expect(out).toMatch(/Devis gratuit en ligne/)
  })

  it('injecte 7j/7 si available_24h', () => {
    const out = buildMetaDescription({ ...base, available_24h: true })
    expect(out).toMatch(/Intervention 7j\/7/)
  })

  it('injecte rayon km si intervention_radius_km > 0', () => {
    const out = buildMetaDescription({ ...base, intervention_radius_km: 30 })
    expect(out).toMatch(/rayon de 30 km/)
  })

  it('privilégie SIRET sur is_verified quand les deux présents', () => {
    const out = buildMetaDescription({
      ...base,
      siret: '81287824700012',
      is_verified: true,
    })
    expect(out).toMatch(/SIRET vérifié/)
    expect(out).not.toMatch(/Artisan vérifié/)
  })

  it('padding court si < 140 chars sans rating/siret/radius', () => {
    const out = buildMetaDescription(base)
    expect(out.length).toBeGreaterThanOrEqual(100)
    expect(out).toMatch(/Comparez les plombiers à Lyon/)
  })

  it('tronque à ≤160 chars avec ellipsis', () => {
    const out = buildMetaDescription({
      ...base,
      displayName: 'Entreprise au Nom Vraiment Très Long Qui Dépasse',
      rating: 4.9,
      reviewCount: 234,
      siret: '12345678900012',
      intervention_radius_km: 50,
    })
    expect(out.length).toBeLessThanOrEqual(160)
  })
})
