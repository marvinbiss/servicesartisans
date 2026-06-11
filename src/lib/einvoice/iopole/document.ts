/**
 * Génère le document de facture UBL 2.1 (le `file` multipart envoyé à Iopole).
 *
 * ⚠️ Profil à VALIDER en sandbox Iopole : conformité EN16931 / CIUS FR
 * (codes unités UN/ECE Rec 20, schémas d'identifiants SIREN, ventilation TVA
 * complète). Cette v1 produit un UBL bien formé avec le cœur EN16931
 * (parties, lignes, TaxTotal par taux, LegalMonetaryTotal). Si Iopole exige
 * Factur-X (PDF/A-3) ou CII, basculer ici uniquement.
 */

import type { IopoleInvoicePayload } from './types'

const esc = (s: string | null | undefined): string =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const amt = (n: number): string => n.toFixed(2)
const isoDate = (iso: string): string => iso.slice(0, 10)

// Mapping minimal unité → code UN/ECE Rec 20 (défaut C62 = unité).
const UNIT_CODE: Record<string, string> = {
  u: 'C62',
  unite: 'C62',
  h: 'HUR',
  heure: 'HUR',
  j: 'DAY',
  jour: 'DAY',
  m2: 'MTK',
  m3: 'MTQ',
  ml: 'MTR',
  m: 'MTR',
  kg: 'KGM',
  l: 'LTR',
  forfait: 'C62',
}
const unitCode = (unite: string): string => UNIT_CODE[unite?.toLowerCase()] ?? 'C62'

type TaxGroup = { rate: number; base: number; tax: number }

function taxGroups(payload: IopoleInvoicePayload): TaxGroup[] {
  const byRate = new Map<number, { base: number }>()
  for (const l of payload.lines) {
    const g = byRate.get(l.tvaRate) ?? { base: 0 }
    g.base += l.totalLigneHt
    byRate.set(l.tvaRate, g)
  }
  return Array.from(byRate.entries())
    .map(([rate, { base }]) => ({
      rate,
      base: Math.round(base * 100) / 100,
      tax: Math.round(base * rate) / 100,
    }))
    .sort((a, b) => a.rate - b.rate)
}

function partyXml(tag: string, name: string | null, siren: string | null): string {
  const company = siren ? `<cbc:CompanyID schemeID="0009">${esc(siren)}</cbc:CompanyID>` : ''
  return `<cac:${tag}><cac:Party><cac:PartyLegalEntity><cbc:RegistrationName>${esc(
    name
  )}</cbc:RegistrationName>${company}</cac:PartyLegalEntity></cac:Party></cac:${tag}>`
}

export function buildUblInvoice(payload: IopoleInvoicePayload): string {
  const groups = taxGroups(payload)

  const taxSubtotals = groups
    .map(
      (g) =>
        `<cac:TaxSubtotal><cbc:TaxableAmount currencyID="EUR">${amt(
          g.base
        )}</cbc:TaxableAmount><cbc:TaxAmount currencyID="EUR">${amt(
          g.tax
        )}</cbc:TaxAmount><cac:TaxCategory><cbc:ID>${
          g.rate > 0 ? 'S' : 'Z'
        }</cbc:ID><cbc:Percent>${amt(
          g.rate
        )}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal>`
    )
    .join('')

  const lines = payload.lines
    .map(
      (l, i) =>
        `<cac:InvoiceLine><cbc:ID>${i + 1}</cbc:ID><cbc:InvoicedQuantity unitCode="${unitCode(
          l.unite
        )}">${l.quantite}</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="EUR">${amt(
          l.totalLigneHt
        )}</cbc:LineExtensionAmount><cac:Item><cbc:Name>${esc(
          l.designation
        )}</cbc:Name><cac:ClassifiedTaxCategory><cbc:ID>${
          l.tvaRate > 0 ? 'S' : 'Z'
        }</cbc:ID><cbc:Percent>${amt(
          l.tvaRate
        )}</cbc:Percent><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:ClassifiedTaxCategory></cac:Item><cac:Price><cbc:PriceAmount currencyID="EUR">${amt(
          l.prixUnitaireHt
        )}</cbc:PriceAmount></cac:Price></cac:InvoiceLine>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
<cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
<cbc:ID>${esc(payload.numero)}</cbc:ID>
<cbc:IssueDate>${isoDate(payload.issuedAt)}</cbc:IssueDate>
<cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
${partyXml('AccountingSupplierParty', payload.emitter.name, payload.emitter.siren ?? null)}
${partyXml('AccountingCustomerParty', payload.buyer.name, payload.buyer.siren)}
<cac:TaxTotal><cbc:TaxAmount currencyID="EUR">${amt(
    payload.totals.totalTva
  )}</cbc:TaxAmount>${taxSubtotals}</cac:TaxTotal>
<cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="EUR">${amt(
    payload.totals.totalHt
  )}</cbc:LineExtensionAmount><cbc:TaxExclusiveAmount currencyID="EUR">${amt(
    payload.totals.totalHt
  )}</cbc:TaxExclusiveAmount><cbc:TaxInclusiveAmount currencyID="EUR">${amt(
    payload.totals.totalTtc
  )}</cbc:TaxInclusiveAmount><cbc:PayableAmount currencyID="EUR">${amt(
    payload.totals.totalTtc
  )}</cbc:PayableAmount></cac:LegalMonetaryTotal>
${lines}
</Invoice>`
}
