/**
 * Provider Invoices Service — factures issues d'un devis-light (mig 547) +
 * transmission e-facture via Iopole (PDP marque grise, mig 548).
 *
 * Facture native = source de vérité ; Iopole = format légal (Factur-X) +
 * acheminement + cycle de vie. Framework-agnostic, RLS-safe (filtre provider_id).
 */

import type { SupabaseClientType } from '@/types'
import { NEXT_DOCUMENT_NUMBER_RPC, acompteBreakdown, type InvoiceType } from '@/lib/devis'
import {
  buildInvoicePayload,
  registerEmitter,
  submitInvoice,
  mapIopoleStatus,
  sirenFromSiret,
} from '@/lib/einvoice/iopole'

type Result<T> = { data: T | null; error: string | null }

type LineForBreakdown = { quantite: number; prix_unitaire_ht: number; tva_rate: number }

/** Charge les lignes d'un devis pour le calcul d'acompte (base de vérité). */
async function fetchQuoteLines(
  supabase: SupabaseClientType,
  quoteId: string
): Promise<LineForBreakdown[]> {
  const { data } = await supabase
    .from('provider_quote_lines')
    .select('quantite, prix_unitaire_ht, tva_rate')
    .eq('quote_id', quoteId)
  return (data ?? []) as LineForBreakdown[]
}

/**
 * Crée une facture d'acompte à partir d'un devis ACCEPTÉ.
 * Montants = décomposition par taux de TVA (acompteBreakdown) → cohérence
 * EN16931 garantie avec le document UBL (même base de calcul).
 */
export async function createAcompteInvoice(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string
): Promise<Result<{ id: string }>> {
  const { data: quote, error: qErr } = await supabase
    .from('provider_quotes')
    .select('id, status, acompte_pct')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  if (qErr || !quote) return { data: null, error: 'QUOTE_NOT_FOUND' }
  if (quote.status !== 'accepte') return { data: null, error: 'QUOTE_NOT_ACCEPTED' }

  // Idempotence : une seule facture d'acompte par devis.
  const { data: existing } = await supabase
    .from('provider_invoices')
    .select('id')
    .eq('quote_id', quoteId)
    .eq('type', 'acompte')
    .maybeSingle()
  if (existing) return { data: { id: existing.id as string }, error: null }

  const lines = await fetchQuoteLines(supabase, quoteId)
  const bd = acompteBreakdown(lines, Number(quote.acompte_pct))
  const montant_ht = bd.total_ht
  const montant_tva = bd.total_tva
  const montant_ttc = bd.total_ttc

  const { data: numero, error: rpcErr } = await supabase.rpc(NEXT_DOCUMENT_NUMBER_RPC, {
    p_provider_id: providerId,
    p_kind: 'invoice',
  })
  if (rpcErr) return { data: null, error: rpcErr.message }

  const { data: invoice, error: insErr } = await supabase
    .from('provider_invoices')
    .insert({
      quote_id: quoteId,
      provider_id: providerId,
      numero,
      type: 'acompte' satisfies InvoiceType,
      montant_ht,
      montant_tva,
      montant_ttc,
      status: 'emise',
      transmission_status: 'pending',
    })
    .select('id')
    .single()

  if (insErr || !invoice) {
    // Course perdue (index unique idx_provider_invoices_one_acompte) → on récupère
    // la facture d'acompte déjà créée plutôt que d'échouer.
    if ((insErr as { code?: string } | null)?.code === '23505') {
      const { data: race } = await supabase
        .from('provider_invoices')
        .select('id')
        .eq('quote_id', quoteId)
        .eq('type', 'acompte')
        .maybeSingle()
      if (race) return { data: { id: race.id as string }, error: null }
    }
    return { data: null, error: insErr?.message ?? 'INSERT_FAILED' }
  }
  return { data: { id: invoice.id as string }, error: null }
}

export type InvoiceListParams = { page: number; pageSize: number }

export async function listProviderInvoices(
  supabase: SupabaseClientType,
  providerId: string,
  { page, pageSize }: InvoiceListParams
): Promise<Result<{ invoices: Record<string, unknown>[]; total: number; totalPages: number }>> {
  const { data, error, count } = await supabase
    .from('provider_invoices')
    .select(
      'id, quote_id, numero, type, montant_ttc, status, transmission_status, iopole_status, created_at',
      { count: 'exact' }
    )
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return { data: null, error: error.message }
  return {
    data: {
      invoices: data ?? [],
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
    error: null,
  }
}

/** Factures rattachées à un devis (pour le panneau facture côté artisan). */
export async function listInvoicesByQuote(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string
): Promise<Result<Record<string, unknown>[]>> {
  const { data, error } = await supabase
    .from('provider_invoices')
    .select(
      'id, numero, type, montant_ttc, status, transmission_status, iopole_status, transmitted_at, created_at'
    )
    .eq('provider_id', providerId)
    .eq('quote_id', quoteId)
    .order('created_at', { ascending: false })
  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}

export async function getProviderInvoice(
  supabase: SupabaseClientType,
  providerId: string,
  invoiceId: string
): Promise<Result<Record<string, unknown>>> {
  const { data, error } = await supabase
    .from('provider_invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('provider_id', providerId)
    .single()
  if (error || !data) return { data: null, error: 'NOT_FOUND' }
  return { data, error: null }
}

/**
 * Transmet la facture à Iopole (création + dépôt PDP). Enrôle l'émetteur à la
 * volée si besoin (marque grise, sous le SIREN de l'artisan).
 */
export async function transmitInvoice(
  supabase: SupabaseClientType,
  providerId: string,
  invoiceId: string
): Promise<Result<{ iopoleId: string; status: string }>> {
  const { data: invoice, error: invErr } = await supabase
    .from('provider_invoices')
    .select(
      'id, quote_id, numero, type, einvoice_format, montant_ht, montant_tva, montant_ttc, issued_at, iopole_id'
    )
    .eq('id', invoiceId)
    .eq('provider_id', providerId)
    .single()
  if (invErr || !invoice) return { data: null, error: 'NOT_FOUND' }
  if (invoice.iopole_id) {
    return {
      data: { iopoleId: invoice.iopole_id as string, status: 'already_submitted' },
      error: null,
    }
  }

  const { data: provider } = await supabase
    .from('providers')
    .select('name, siret')
    .eq('id', providerId)
    .single()
  if (!provider) return { data: null, error: 'PROVIDER_NOT_FOUND' }

  const { data: quote } = await supabase
    .from('provider_quotes')
    .select('client_type, client_nom, client_siren, client_email, acompte_pct')
    .eq('id', invoice.quote_id)
    .single()
  if (!quote) return { data: null, error: 'QUOTE_NOT_FOUND' }

  // Émetteur (enrôlement KYB). Best-effort : on tente l'enrôlement s'il manque.
  const emitter = await getOrCreateEmitter(supabase, providerId, provider as ProviderRow)

  // Identité vendeur OBLIGATOIRE (EN16931) : sans SIREN résoluble, on NE transmet
  // PAS un document non identifiable (rejet garanti côté PDP).
  const sellerSiren = emitter?.siren ?? sirenFromSiret((provider as ProviderRow).siret)
  if (!sellerSiren) {
    return { data: null, error: 'EMITTER_SIREN_MISSING' }
  }

  // Lignes du document = décomposition de l'acompte par taux de TVA (cohérence
  // EN16931 : Σ lignes HT = total HT, TaxTotal = Σ TaxSubtotal). On ne réémet PAS
  // les lignes pleines du devis (qui valent 100%, pas l'acompte).
  const quoteLines = await fetchQuoteLines(supabase, invoice.quote_id)
  const bd = acompteBreakdown(quoteLines, Number(quote.acompte_pct))
  const acomptePct = Number(quote.acompte_pct)
  const docLines = bd.groups.map((g) => ({
    designation: `Acompte ${acomptePct}% — TVA ${g.rate}%`,
    quantite: 1,
    unite: 'forfait',
    prix_unitaire_ht: g.ht,
    tva_rate: g.rate,
    total_ligne_ht: g.ht,
  }))

  const payload = buildInvoicePayload({
    provider: provider as ProviderRow,
    emitter,
    quote: quote as Parameters<typeof buildInvoicePayload>[0]['quote'],
    invoice: { ...(invoice as Record<string, unknown>) } as Parameters<
      typeof buildInvoicePayload
    >[0]['invoice'],
    lines: docLines,
  })

  const { data: submitted, error: subErr } = await submitInvoice(payload)
  if (subErr || !submitted) {
    await supabase
      .from('provider_invoices')
      .update({ transmission_status: 'error', iopole_error: subErr })
      .eq('id', invoiceId)
      .eq('provider_id', providerId)
    return { data: null, error: subErr ?? 'SUBMIT_FAILED' }
  }

  await supabase
    .from('provider_invoices')
    .update({
      iopole_id: submitted.iopoleId,
      iopole_status: submitted.status,
      transmission_status: 'submitted',
      transmitted_at: new Date().toISOString(),
      iopole_error: null,
    })
    .eq('id', invoiceId)
    .eq('provider_id', providerId)

  return { data: { iopoleId: submitted.iopoleId, status: submitted.status }, error: null }
}

type ProviderRow = { name: string | null; siret: string | null }
type EmitterRow = { iopole_emitter_id: string | null; siren: string | null }

/** Récupère l'émetteur Iopole de l'artisan, l'enrôle si absent (best-effort). */
async function getOrCreateEmitter(
  supabase: SupabaseClientType,
  providerId: string,
  provider: ProviderRow
): Promise<EmitterRow | null> {
  const { data: existing } = await supabase
    .from('provider_einvoice_emitters')
    .select('iopole_emitter_id, siren, kyb_status')
    .eq('provider_id', providerId)
    .maybeSingle()

  if (existing?.iopole_emitter_id) {
    return { iopole_emitter_id: existing.iopole_emitter_id, siren: existing.siren }
  }

  const siren = sirenFromSiret(provider.siret)
  if (!siren) return null

  const { data: reg, error: regErr } = await registerEmitter({
    siren,
    name: provider.name ?? '',
  })

  // Upsert de l'état d'enrôlement (même en cas d'échec, pour traçabilité).
  await supabase.from('provider_einvoice_emitters').upsert(
    {
      provider_id: providerId,
      siren,
      iopole_emitter_id: reg?.emitterId ?? null,
      kyb_status: reg ? (reg.status === 'active' ? 'active' : 'pending') : 'rejected',
      kyb_error: regErr,
      registered_at: reg ? new Date().toISOString() : null,
    },
    { onConflict: 'provider_id' }
  )

  if (regErr || !reg) return null
  return { iopole_emitter_id: reg.emitterId, siren }
}

/**
 * Applique un statut Iopole (webhook). Idempotent via provider_invoice_events.
 * À appeler avec le client admin (service_role) — flux non authentifié.
 */
export async function applyIopoleStatus(
  supabase: SupabaseClientType,
  args: { iopoleId: string; rawStatus: string; eventId?: string | null; payload?: unknown }
): Promise<Result<{ invoiceId: string }>> {
  const { iopoleId, rawStatus, eventId, payload } = args

  const { data: invoice } = await supabase
    .from('provider_invoices')
    .select('id')
    .eq('iopole_id', iopoleId)
    .maybeSingle()
  if (!invoice) return { data: null, error: 'INVOICE_NOT_FOUND' }

  const invoiceId = invoice.id as string

  // Journalise (idempotent : index unique invoice_id+iopole_event_id).
  const { error: evErr } = await supabase.from('provider_invoice_events').insert({
    invoice_id: invoiceId,
    iopole_event_id: eventId ?? null,
    iopole_status: rawStatus,
    payload: (payload ?? {}) as Record<string, unknown>,
  })
  if (evErr) {
    // 23505 = duplicate → event déjà traité, on s'arrête sans ré-appliquer.
    if ((evErr as { code?: string }).code === '23505') return { data: { invoiceId }, error: null }
    // Autre échec : NE PAS appliquer le patch (sinon double-application possible
    // à la redélivrance). On surface l'erreur → webhook 500 → Iopole rejoue.
    return { data: null, error: evErr.message }
  }

  const mapped = mapIopoleStatus(rawStatus)
  const patch: Record<string, unknown> = {
    iopole_status: rawStatus,
    lifecycle_updated_at: new Date().toISOString(),
  }
  if (mapped.transmission) patch.transmission_status = mapped.transmission
  if (mapped.invoice) patch.status = mapped.invoice

  await supabase.from('provider_invoices').update(patch).eq('id', invoiceId)

  return { data: { invoiceId }, error: null }
}
