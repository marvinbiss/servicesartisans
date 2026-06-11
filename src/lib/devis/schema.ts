/**
 * Devis-light — schemas & types (mig 547: provider_quotes / lines / invoices).
 * Framework-agnostic. Pas d'accès Supabase ici (pur, testable).
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums (miroir des types Postgres de la mig 547)
// ---------------------------------------------------------------------------

export const QUOTE_CLIENT_TYPES = ['particulier', 'pro'] as const
export type QuoteClientType = (typeof QUOTE_CLIENT_TYPES)[number]

export const QUOTE_STATUSES = ['brouillon', 'envoye', 'vu', 'accepte', 'refuse', 'expire'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const FINANCING_RAILS = ['younited', 'aria', 'none'] as const
export type FinancingRail = (typeof FINANCING_RAILS)[number]

export const INVOICE_TYPES = ['acompte', 'situation', 'solde'] as const
export type InvoiceType = (typeof INVOICE_TYPES)[number]

export const INVOICE_STATUSES = ['emise', 'payee', 'cedee_aria', 'annulee'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const addressSchema = z
  .object({
    rue: z.string().max(200).optional(),
    code_postal: z.string().max(10).optional(),
    ville: z.string().max(120).optional(),
  })
  .partial()

export const quoteLineSchema = z.object({
  designation: z.string().min(1).max(500),
  // Bornes hautes : évite l'overflow NUMERIC(12,2) côté DB (→ 400 propre, pas 500).
  quantite: z.number().nonnegative().max(100_000),
  unite: z.string().min(1).max(20).default('u'),
  prix_unitaire_ht: z.number().nonnegative().max(1_000_000),
  tva_rate: z.number().min(0).max(100).default(20),
  ordre: z.number().int().nonnegative().default(0),
})
export type QuoteLineInput = z.infer<typeof quoteLineSchema>

export const quoteCreateSchema = z
  .object({
    client_type: z.enum(QUOTE_CLIENT_TYPES).default('particulier'),
    client_nom: z.string().max(200).optional(),
    client_email: z.string().email().max(200).optional(),
    client_telephone: z.string().max(30).optional(),
    // SIREN = 9 chiffres (le SIRET en fait 14 ; ici on veut le SIREN)
    client_siren: z
      .string()
      .regex(/^\d{9}$/, 'SIREN = 9 chiffres')
      .optional(),
    client_adresse: addressSchema.optional(),
    chantier_adresse: addressSchema.optional(),
    acompte_pct: z.number().min(0).max(100).default(30),
    notes: z.string().max(5000).optional(),
    valid_until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date attendue au format YYYY-MM-DD')
      .optional(),
    devis_request_id: z.string().uuid().optional(),
    lines: z.array(quoteLineSchema).min(1, 'Au moins une ligne'),
  })
  .refine((v) => v.client_type !== 'pro' || Boolean(v.client_siren), {
    message: 'client_siren requis pour un client pro (alimente Aria)',
    path: ['client_siren'],
  })
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>

export const quoteTransitionSchema = z.object({
  to: z.enum(QUOTE_STATUSES),
})
export type QuoteTransitionInput = z.infer<typeof quoteTransitionSchema>

export const invoiceCreateSchema = z.object({
  quote_id: z.string().uuid(),
  type: z.enum(INVOICE_TYPES).default('acompte'),
  // montant optionnel : si absent, l'appelant le dérive (ex. acompte = total_ttc * acompte_pct)
  montant_ht: z.number().nonnegative().optional(),
  montant_tva: z.number().nonnegative().optional(),
  montant_ttc: z.number().nonnegative().optional(),
})
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>
