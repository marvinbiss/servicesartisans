/**
 * Décompose un acompte par taux de TVA — source UNIQUE de vérité partagée entre
 * la création de la facture (montants stockés) et la génération du document UBL
 * (lignes + TaxTotal). Garantit la cohérence EN16931 :
 *   Σ lignes HT = total HT (BR-CO-10) et TaxTotal = Σ TaxSubtotal (BR-CO-14).
 *
 * Tout en centimes entiers (pas de dérive flottante). On groupe le HT plein du
 * devis par taux, on applique le pourcentage d'acompte sur le HT groupé, puis on
 * calcule la TVA sur ce HT d'acompte arrondi.
 */

const toCents = (n: number): number => Math.round(n * 100)
const fromCents = (c: number): number => c / 100

export type AcompteLineForBreakdown = {
  quantite: number
  prix_unitaire_ht: number
  tva_rate: number
}

export type AcompteGroup = { rate: number; ht: number; tva: number }

export type AcompteBreakdown = {
  groups: AcompteGroup[]
  total_ht: number
  total_tva: number
  total_ttc: number
}

export function acompteBreakdown(lines: AcompteLineForBreakdown[], pct: number): AcompteBreakdown {
  // HT plein (centimes) groupé par taux de TVA.
  const fullHtByRate = new Map<number, number>()
  for (const l of lines) {
    const lineHtCents = Math.round(l.quantite * toCents(l.prix_unitaire_ht))
    fullHtByRate.set(l.tva_rate, (fullHtByRate.get(l.tva_rate) ?? 0) + lineHtCents)
  }

  let htCents = 0
  let tvaCents = 0
  const groups: AcompteGroup[] = Array.from(fullHtByRate.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, fullHt]) => {
      const groupHtCents = Math.round(fullHt * (pct / 100))
      const groupTvaCents = Math.round(groupHtCents * (rate / 100))
      htCents += groupHtCents
      tvaCents += groupTvaCents
      return { rate, ht: fromCents(groupHtCents), tva: fromCents(groupTvaCents) }
    })

  return {
    groups,
    total_ht: fromCents(htCents),
    total_tva: fromCents(tvaCents),
    total_ttc: fromCents(htCents + tvaCents),
  }
}
