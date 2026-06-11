import { describe, it, expect } from 'vitest'
import { mapIopoleStatus } from '@/lib/einvoice/iopole/status'
import { buildUblInvoice } from '@/lib/einvoice/iopole/document'
import { sirenFromSiret } from '@/lib/einvoice/iopole/payload'
import { acompteBreakdown } from '@/lib/devis/acompte'
import type { IopoleInvoicePayload } from '@/lib/einvoice/iopole/types'

describe('mapIopoleStatus', () => {
  it('mappe les eventTypes outbound (sous-chaîne, casse/_)', () => {
    expect(mapIopoleStatus('INVOICE_OUTBOUND_ACCEPTED')).toEqual({ transmission: 'delivered' })
    expect(mapIopoleStatus('INVOICE_OUTBOUND_DEPOSITED')).toEqual({ transmission: 'submitted' })
    expect(mapIopoleStatus('INVOICE_REFUSED')).toEqual({ transmission: 'rejected' })
  })

  it('paiement → payee, annulation → annulee (priorité)', () => {
    expect(mapIopoleStatus('paymentSent')).toEqual({ transmission: 'delivered', invoice: 'payee' })
    expect(mapIopoleStatus('PAID')).toEqual({ transmission: 'delivered', invoice: 'payee' })
    expect(mapIopoleStatus('INVOICE_CANCELLED')).toEqual({ invoice: 'annulee' })
  })

  it('litige = acheminée mais contestée ; inconnu = {}', () => {
    expect(mapIopoleStatus('disputed')).toEqual({ transmission: 'delivered' })
    expect(mapIopoleStatus('something-else')).toEqual({})
  })
})

describe('sirenFromSiret', () => {
  it('extrait les 9 premiers chiffres', () => {
    expect(sirenFromSiret('80295478500015')).toBe('802954785')
    expect(sirenFromSiret('802 954 785 00015')).toBe('802954785')
    expect(sirenFromSiret(null)).toBeNull()
    expect(sirenFromSiret('123')).toBeNull()
  })
})

const payload: IopoleInvoicePayload = {
  internalId: 'inv-1',
  numero: 'FAC-2026-00001',
  type: 'acompte',
  format: 'facturx',
  issuedAt: '2026-06-11T10:00:00.000Z',
  emitter: { emitterId: null, siren: '802954785', name: 'Plomberie Dupont' },
  buyer: { type: 'pro', name: 'SARL Martin', siren: '912345678', email: null },
  lines: [
    {
      designation: 'Pose chaudière',
      quantite: 1,
      unite: 'u',
      prixUnitaireHt: 1000,
      tvaRate: 20,
      totalLigneHt: 1000,
    },
    {
      designation: 'Main d’œuvre',
      quantite: 2,
      unite: 'h',
      prixUnitaireHt: 50,
      tvaRate: 10,
      totalLigneHt: 100,
    },
  ],
  totals: { totalHt: 1100, totalTva: 210, totalTtc: 1310 },
}

describe('buildUblInvoice', () => {
  const xml = buildUblInvoice(payload)

  it('produit un UBL bien formé avec en-tête et racine', () => {
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<Invoice ')
    expect(xml.trim().endsWith('</Invoice>')).toBe(true)
    expect(xml).toContain('<cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>')
  })

  it('porte numéro, devise, parties et SIREN', () => {
    expect(xml).toContain('<cbc:ID>FAC-2026-00001</cbc:ID>')
    expect(xml).toContain('<cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>')
    expect(xml).toContain('Plomberie Dupont')
    expect(xml).toContain('<cbc:CompanyID schemeID="0009">802954785</cbc:CompanyID>')
    expect(xml).toContain('SARL Martin')
  })

  it('ventile la TVA par taux + totaux', () => {
    expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">210.00</cbc:TaxAmount>')
    expect(xml).toContain('<cbc:Percent>20.00</cbc:Percent>')
    expect(xml).toContain('<cbc:Percent>10.00</cbc:Percent>')
    expect(xml).toContain('<cbc:PayableAmount currencyID="EUR">1310.00</cbc:PayableAmount>')
  })

  it('échappe le XML (apostrophe typographique ok, & échappé)', () => {
    const x = buildUblInvoice({
      ...payload,
      buyer: { ...payload.buyer, name: 'Durand & Fils <SAS>' },
    })
    expect(x).toContain('Durand &amp; Fils &lt;SAS&gt;')
    expect(x).not.toContain('Durand & Fils <SAS>')
  })

  it('mappe les unités vers UN/ECE Rec 20', () => {
    expect(xml).toContain('unitCode="C62"') // u
    expect(xml).toContain('unitCode="HUR"') // h
  })
})

describe('UBL cohérence acompte (EN16931 BR-CO-10/14)', () => {
  it('document construit depuis acompteBreakdown : TaxTotal = Σ TaxSubtotal', () => {
    // Reproduit ce que fait transmitInvoice : lignes synthétiques par taux.
    const bd = acompteBreakdown(
      [
        { quantite: 1, prix_unitaire_ht: 1000, tva_rate: 20 },
        { quantite: 2, prix_unitaire_ht: 50, tva_rate: 10 },
      ],
      30
    )
    const docLines = bd.groups.map((g) => ({
      designation: `Acompte 30% — TVA ${g.rate}%`,
      quantite: 1,
      unite: 'forfait',
      prixUnitaireHt: g.ht,
      tvaRate: g.rate,
      totalLigneHt: g.ht,
    }))
    const p: IopoleInvoicePayload = {
      internalId: 'i',
      numero: 'FAC-2026-00009',
      type: 'acompte',
      format: 'facturx',
      issuedAt: '2026-06-11T00:00:00.000Z',
      emitter: { emitterId: null, siren: '802954785', name: 'Art' },
      buyer: { type: 'particulier', name: 'Client', siren: null, email: null },
      lines: docLines,
      totals: { totalHt: bd.total_ht, totalTva: bd.total_tva, totalTtc: bd.total_ttc },
    }
    const xml = buildUblInvoice(p)
    // total_tva = 63 ; subtotals = 60 (20%) + 3 (10%) → somme cohérente
    expect(xml).toContain('<cac:TaxTotal><cbc:TaxAmount currencyID="EUR">63.00</cbc:TaxAmount>')
    expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">60.00</cbc:TaxAmount>')
    expect(xml).toContain('<cbc:TaxAmount currencyID="EUR">3.00</cbc:TaxAmount>')
    // Σ lignes HT = total HT (BR-CO-10) : 300 + 30 = 330
    expect(xml).toContain(
      '<cbc:LineExtensionAmount currencyID="EUR">330.00</cbc:LineExtensionAmount>'
    )
  })
})
