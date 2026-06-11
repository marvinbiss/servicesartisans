/** Construit le payload Iopole canonique à partir de nos enregistrements. */

import type { IopoleInvoicePayload, IopoleLine } from './types'

type ProviderLike = { name: string | null; siret: string | null }
type EmitterLike = { iopole_emitter_id: string | null; siren: string | null } | null
type QuoteLike = {
  client_type: 'particulier' | 'pro'
  client_nom: string | null
  client_siren: string | null
  client_email: string | null
}
type InvoiceLike = {
  id: string
  numero: string | null
  type: 'acompte' | 'situation' | 'solde'
  einvoice_format: string | null
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  issued_at: string | null
}
type QuoteLineLike = {
  designation: string
  quantite: number
  unite: string
  prix_unitaire_ht: number
  tva_rate: number
  total_ligne_ht: number
}

/** SIREN = 9 premiers chiffres du SIRET (14). */
export function sirenFromSiret(siret: string | null | undefined): string | null {
  if (!siret) return null
  const digits = siret.replace(/\D/g, '')
  return digits.length >= 9 ? digits.slice(0, 9) : null
}

const mapLines = (lines: QuoteLineLike[]): IopoleLine[] =>
  lines.map((l) => ({
    designation: l.designation,
    quantite: l.quantite,
    unite: l.unite,
    prixUnitaireHt: l.prix_unitaire_ht,
    tvaRate: l.tva_rate,
    totalLigneHt: l.total_ligne_ht,
  }))

export function buildInvoicePayload(args: {
  provider: ProviderLike
  emitter: EmitterLike
  quote: QuoteLike
  invoice: InvoiceLike
  lines: QuoteLineLike[]
}): IopoleInvoicePayload {
  const { provider, emitter, quote, invoice, lines } = args
  return {
    internalId: invoice.id,
    numero: invoice.numero ?? '',
    type: invoice.type,
    format: invoice.einvoice_format ?? 'facturx',
    issuedAt: invoice.issued_at ?? new Date().toISOString(),
    emitter: {
      emitterId: emitter?.iopole_emitter_id ?? null,
      siren: emitter?.siren ?? sirenFromSiret(provider.siret),
      name: provider.name ?? '',
    },
    buyer: {
      type: quote.client_type,
      name: quote.client_nom,
      siren: quote.client_siren,
      email: quote.client_email,
    },
    lines: mapLines(lines),
    totals: {
      totalHt: invoice.montant_ht,
      totalTva: invoice.montant_tva,
      totalTtc: invoice.montant_ttc,
    },
  }
}
