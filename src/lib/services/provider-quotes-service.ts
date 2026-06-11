/**
 * Provider Quotes Service — devis-light structuré (table provider_quotes, mig 547).
 *
 * ⚠️ NE PAS confondre avec `quotes-service.ts` / la table legacy `quotes`
 * (réponse chiffrée plate à un devis_requests). Ici : devis rédigé par
 * l'artisan, avec lignes, type client (B2C/B2B), totaux, rail de financement.
 *
 * Framework-agnostic (pas de NextRequest). RLS-safe : toutes les requêtes sont
 * filtrées par provider_id (défense en profondeur, en plus des policies RLS).
 */

import { randomBytes } from 'node:crypto'
import type { SupabaseClientType } from '@/types'
import {
  computeTotals,
  lineTotalHt,
  resolveFinancingRail,
  assertTransition,
  transitionTimestampColumn,
  InvalidTransitionError,
  NEXT_DOCUMENT_NUMBER_RPC,
  type QuoteCreateInput,
  type QuoteStatus,
} from '@/lib/devis'

type Result<T> = { data: T | null; error: string | null }

const buildLineRows = (quoteId: string, lines: QuoteCreateInput['lines']) =>
  lines.map((l, i) => ({
    quote_id: quoteId,
    ordre: l.ordre ?? i,
    designation: l.designation,
    quantite: l.quantite,
    unite: l.unite,
    prix_unitaire_ht: l.prix_unitaire_ht,
    tva_rate: l.tva_rate,
    total_ligne_ht: lineTotalHt(l),
  }))

const quotePayloadFromInput = (input: QuoteCreateInput) => {
  const totals = computeTotals(input.lines)
  return {
    devis_request_id: input.devis_request_id ?? null,
    client_type: input.client_type,
    client_nom: input.client_nom ?? null,
    client_email: input.client_email ?? null,
    client_telephone: input.client_telephone ?? null,
    client_siren: input.client_siren ?? null,
    client_adresse: input.client_adresse ?? {},
    chantier_adresse: input.chantier_adresse ?? {},
    acompte_pct: input.acompte_pct,
    notes: input.notes ?? null,
    valid_until: input.valid_until ?? null,
    total_ht: totals.total_ht,
    total_tva: totals.total_tva,
    total_ttc: totals.total_ttc,
    financing_rail: resolveFinancingRail(input.client_type, totals.total_ttc),
  }
}

/** Crée un devis (status brouillon) + ses lignes. */
export async function createProviderQuote(
  supabase: SupabaseClientType,
  providerId: string,
  input: QuoteCreateInput
): Promise<Result<{ id: string }>> {
  const { data: quote, error } = await supabase
    .from('provider_quotes')
    .insert({ provider_id: providerId, status: 'brouillon', ...quotePayloadFromInput(input) })
    .select('id')
    .single()

  if (error || !quote) return { data: null, error: error?.message ?? 'INSERT_FAILED' }

  const { error: linesError } = await supabase
    .from('provider_quote_lines')
    .insert(buildLineRows(quote.id as string, input.lines))

  if (linesError) {
    // Rollback best-effort (pas de transaction multi-statements via PostgREST).
    await supabase.from('provider_quotes').delete().eq('id', quote.id)
    return { data: null, error: linesError.message }
  }

  return { data: { id: quote.id as string }, error: null }
}

export type QuoteListParams = { page: number; pageSize: number; status: string }

/** Liste paginée des devis de l'artisan. */
export async function listProviderQuotes(
  supabase: SupabaseClientType,
  providerId: string,
  { page, pageSize, status }: QuoteListParams
): Promise<Result<{ quotes: Record<string, unknown>[]; total: number; totalPages: number }>> {
  let query = supabase
    .from('provider_quotes')
    .select(
      'id, numero, client_type, client_nom, status, total_ttc, financing_rail, created_at, valid_until',
      { count: 'exact' }
    )
    .eq('provider_id', providerId)

  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) return { data: null, error: error.message }

  return {
    data: {
      quotes: data ?? [],
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
    error: null,
  }
}

/** Un devis + ses lignes (ownership vérifié). */
export async function getProviderQuote(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string
): Promise<Result<Record<string, unknown>>> {
  const { data: quote, error } = await supabase
    .from('provider_quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  if (error || !quote) return { data: null, error: 'NOT_FOUND' }

  const { data: lines } = await supabase
    .from('provider_quote_lines')
    .select('*')
    .eq('quote_id', quoteId)
    .order('ordre', { ascending: true })

  return { data: { ...quote, lines: lines ?? [] }, error: null }
}

/** Met à jour un devis brouillon (remplace champs + lignes, recalcule totaux/rail). */
export async function updateProviderQuote(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string,
  input: QuoteCreateInput
): Promise<Result<{ id: string }>> {
  const { data: existing, error: fetchError } = await supabase
    .from('provider_quotes')
    .select('status')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  if (fetchError || !existing) return { data: null, error: 'NOT_FOUND' }
  if (existing.status !== 'brouillon') return { data: null, error: 'ONLY_DRAFT_EDITABLE' }

  const { error: updateError } = await supabase
    .from('provider_quotes')
    .update(quotePayloadFromInput(input))
    .eq('id', quoteId)
    .eq('provider_id', providerId)

  if (updateError) return { data: null, error: updateError.message }

  // Remplace les lignes (delete + insert).
  await supabase.from('provider_quote_lines').delete().eq('quote_id', quoteId)
  const { error: linesError } = await supabase
    .from('provider_quote_lines')
    .insert(buildLineRows(quoteId, input.lines))

  if (linesError) return { data: null, error: linesError.message }

  return { data: { id: quoteId }, error: null }
}

/** Transition de statut (validée par la machine à états). Attribue numéro +
 *  token d'accès client au passage en 'envoye'. */
export async function transitionProviderQuote(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string,
  to: QuoteStatus
): Promise<Result<{ status: QuoteStatus }>> {
  const { data: existing, error: fetchError } = await supabase
    .from('provider_quotes')
    .select('status, numero, access_token')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  if (fetchError || !existing) return { data: null, error: 'NOT_FOUND' }

  try {
    assertTransition(existing.status as QuoteStatus, to)
  } catch (e) {
    if (e instanceof InvalidTransitionError) return { data: null, error: 'INVALID_TRANSITION' }
    throw e
  }

  const patch: Record<string, unknown> = { status: to }
  const tsCol = transitionTimestampColumn(to)
  if (tsCol) patch[tsCol] = new Date().toISOString()

  if (to === 'envoye') {
    if (!existing.numero) {
      const { data: numero, error: rpcError } = await supabase.rpc(NEXT_DOCUMENT_NUMBER_RPC, {
        p_provider_id: providerId,
        p_kind: 'quote',
      })
      if (rpcError) return { data: null, error: rpcError.message }
      patch.numero = numero
    }
    if (!existing.access_token) patch.access_token = randomBytes(24).toString('hex')
  }

  const { error: updateError } = await supabase
    .from('provider_quotes')
    .update(patch)
    .eq('id', quoteId)
    .eq('provider_id', providerId)

  if (updateError) return { data: null, error: updateError.message }

  return { data: { status: to }, error: null }
}

// ---------------------------------------------------------------------------
// Accès CLIENT par token (vue publique sans compte). À appeler avec le client
// admin (bypass RLS) — jamais le client RLS anon. La réponse est sanitisée :
// pas de access_token, pas de client_telephone (PII interne).
// ---------------------------------------------------------------------------

const CLIENT_QUOTE_FIELDS =
  'id, numero, status, client_type, client_nom, total_ht, total_tva, total_ttc, ' +
  'acompte_pct, notes, valid_until, financing_rail, created_at, sent_at, ' +
  'viewed_at, accepted_at, refused_at, provider:provider_id(name, slug, address_city)'

/** Récupère un devis via son token client (+ lignes + nom artisan), sanitisé. */
export async function getQuoteByToken(
  supabase: SupabaseClientType,
  token: string
): Promise<Result<Record<string, unknown>>> {
  const { data, error } = await supabase
    .from('provider_quotes')
    .select(CLIENT_QUOTE_FIELDS)
    .eq('access_token', token)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'NOT_FOUND' }

  // Le client typé infère un type d'erreur sur l'embed FK ; on coerce.
  const quote = data as unknown as Record<string, unknown>

  const { data: lines } = await supabase
    .from('provider_quote_lines')
    .select('id, ordre, designation, quantite, unite, prix_unitaire_ht, tva_rate, total_ligne_ht')
    .eq('quote_id', quote.id as string)
    .order('ordre', { ascending: true })

  return { data: { ...quote, lines: lines ?? [] }, error: null }
}

/** Marque le devis « vu » à la première consultation client (envoye → vu). */
export async function markQuoteViewedByToken(
  supabase: SupabaseClientType,
  token: string
): Promise<void> {
  await supabase
    .from('provider_quotes')
    .update({ status: 'vu', viewed_at: new Date().toISOString() })
    .eq('access_token', token)
    .eq('status', 'envoye')
}

/** Le client accepte ou refuse le devis (transitions terminales). */
export async function respondToQuoteByToken(
  supabase: SupabaseClientType,
  token: string,
  to: Extract<QuoteStatus, 'accepte' | 'refuse'>
): Promise<Result<{ status: QuoteStatus }>> {
  const { data: existing, error: fetchError } = await supabase
    .from('provider_quotes')
    .select('id, status')
    .eq('access_token', token)
    .maybeSingle()

  if (fetchError) return { data: null, error: fetchError.message }
  if (!existing) return { data: null, error: 'NOT_FOUND' }

  try {
    assertTransition(existing.status as QuoteStatus, to)
  } catch (e) {
    if (e instanceof InvalidTransitionError) return { data: null, error: 'INVALID_TRANSITION' }
    throw e
  }

  const tsCol = to === 'accepte' ? 'accepted_at' : 'refused_at'
  const { error: updateError } = await supabase
    .from('provider_quotes')
    .update({ status: to, [tsCol]: new Date().toISOString() })
    .eq('id', existing.id)
    .eq('access_token', token)

  if (updateError) return { data: null, error: updateError.message }

  return { data: { status: to }, error: null }
}

/** Supprime un devis brouillon (lignes en cascade). */
export async function deleteProviderQuote(
  supabase: SupabaseClientType,
  providerId: string,
  quoteId: string
): Promise<Result<{ id: string }>> {
  const { data: existing, error: fetchError } = await supabase
    .from('provider_quotes')
    .select('status')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  if (fetchError || !existing) return { data: null, error: 'NOT_FOUND' }
  if (existing.status !== 'brouillon') return { data: null, error: 'ONLY_DRAFT_DELETABLE' }

  const { error } = await supabase
    .from('provider_quotes')
    .delete()
    .eq('id', quoteId)
    .eq('provider_id', providerId)

  if (error) return { data: null, error: error.message }

  return { data: { id: quoteId }, error: null }
}
