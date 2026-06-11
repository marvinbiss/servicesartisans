/**
 * Devis-light — calcul des totaux. Tout en centimes entiers pour éviter la
 * dérive flottante, arrondi par ligne (règle TVA usuelle).
 */

export type LineForTotal = {
  quantite: number
  prix_unitaire_ht: number
  tva_rate: number
}

export type QuoteTotals = {
  total_ht: number
  total_tva: number
  total_ttc: number
}

const toCents = (n: number): number => Math.round(n * 100)
const fromCents = (c: number): number => c / 100

/** Total HT d'une ligne (arrondi 2 décimales). */
export const lineTotalHt = (line: Pick<LineForTotal, 'quantite' | 'prix_unitaire_ht'>): number =>
  fromCents(Math.round(line.quantite * toCents(line.prix_unitaire_ht)))

/** Totaux HT / TVA / TTC d'un devis à partir de ses lignes. */
export const computeTotals = (lines: LineForTotal[]): QuoteTotals => {
  let htCents = 0
  let tvaCents = 0

  for (const l of lines) {
    const lineHtCents = Math.round(l.quantite * toCents(l.prix_unitaire_ht))
    const lineTvaCents = Math.round(lineHtCents * (l.tva_rate / 100))
    htCents += lineHtCents
    tvaCents += lineTvaCents
  }

  return {
    total_ht: fromCents(htCents),
    total_tva: fromCents(tvaCents),
    total_ttc: fromCents(htCents + tvaCents),
  }
}

/** Montant d'acompte (TTC) pour un pourcentage donné. */
export const acompteAmount = (totalTtc: number, pct: number): number =>
  fromCents(Math.round(toCents(totalTtc) * (pct / 100)))

const EUR_FORMAT = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formate un montant en euros (number décimal, pas centimes) → « 1 234,56 € ». */
export const formatEUR = (amount: number): string => EUR_FORMAT.format(amount)
