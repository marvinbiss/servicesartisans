/**
 * Quotes Service — Centralized Supabase queries for quotes & devis_requests
 * Framework-agnostic: no NextRequest/NextResponse
 */

import type { SupabaseClientType } from '@/types'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const quoteCreateSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(10).max(2000),
  valid_until: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unit_price: z.number().positive(),
      })
    )
    .optional(),
})

export const quoteUpdateActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'cancel']),
})

export const bulkStatusUpdateSchema = z.object({
  quote_ids: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum(['read', 'responded', 'converted', 'cancelled']),
})

export const bulkDeleteSchema = z.object({
  quote_ids: z.array(z.string().uuid()).min(1).max(50),
})

export const adminUpdateQuoteSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'expired']).optional(),
  amount: z.number().positive().max(1000000).optional(),
  notes: z.string().max(1000).optional(),
  valid_until: z.string().datetime().optional(),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>
export type QuoteUpdateAction = z.infer<typeof quoteUpdateActionSchema>
export type BulkStatusUpdateInput = z.infer<typeof bulkStatusUpdateSchema>
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>
export type AdminUpdateQuoteInput = z.infer<typeof adminUpdateQuoteSchema>

export interface QuoteListParams {
  userId: string
  role: string
  status: string | null
  page: number
  limit: number
}

export interface QuoteListResult {
  quotes: Record<string, unknown>[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface AdminQuoteListParams {
  status: string
  search: string
  page: number
  limit: number
}

export interface AdminQuoteListResult {
  demandes: Record<string, unknown>[]
  assignments: Record<
    string,
    Array<{
      id: string
      status: string
      assigned_at: string
      provider_name: string
      provider_id: string
    }>
  >
  total: number
  page: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// User-facing queries
// ---------------------------------------------------------------------------

/** List quotes for an authenticated user (client or provider) */
export async function listQuotes(
  supabase: SupabaseClientType,
  params: QuoteListParams
): Promise<{ data: QuoteListResult | null; error: string | null }> {
  const { userId, role, status, page, limit } = params

  let query = supabase.from('quotes').select(
    `
      *,
      booking:bookings(
        id,
        service_name,
        scheduled_date,
        client:profiles!client_id(full_name, email),
        provider:providers(name)
      )
    `,
    { count: 'exact' }
  )

  if (role === 'provider') {
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!provider) {
      return { data: null, error: 'PROVIDER_NOT_FOUND' }
    }

    query = query.eq('provider_id', provider.id)
  } else {
    query = query.eq('client_id', userId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  const { data: quotes, error, count } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return {
    data: {
      quotes: quotes ?? [],
      total: count ?? 0,
      page,
      limit,
      pages: Math.ceil((count ?? 0) / limit),
    },
    error: null,
  }
}

/** Get a single quote by ID, verifying user is provider or client */
export async function getQuoteById(
  supabase: SupabaseClientType,
  quoteId: string,
  userId: string
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(
      'id, request_id, provider_id, amount, description, valid_until, status, created_at, updated_at'
    )
    .eq('id', quoteId)
    .single()

  if (error || !quote) {
    return { data: null, error: 'QUOTE_NOT_FOUND' }
  }

  // Check authorization: is user the provider of this quote?
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  const isProvider = provider?.id === quote.provider_id

  // Check if user is the client via the devis_request
  const { data: devisRequest } = await supabase
    .from('devis_requests')
    .select('client_id')
    .eq('id', quote.request_id)
    .single()

  const isClient = devisRequest?.client_id === userId

  if (!isProvider && !isClient) {
    return { data: null, error: 'UNAUTHORIZED' }
  }

  return { data: quote, error: null }
}

/** Create a new quote (provider only) */
export async function createQuote(
  supabase: SupabaseClientType,
  userId: string,
  input: QuoteCreateInput
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  // Verify user is a provider
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!provider) {
    return { data: null, error: 'NOT_A_PROVIDER' }
  }

  const { booking_id, amount, description, valid_until, items } = input

  // Verify booking exists and belongs to this provider
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, client_id, provider_id')
    .eq('id', booking_id)
    .eq('provider_id', provider.id)
    .single()

  if (!booking) {
    return { data: null, error: 'BOOKING_NOT_FOUND' }
  }

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert({
      booking_id,
      provider_id: provider.id,
      client_id: booking.client_id,
      amount,
      description,
      valid_until: valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: items || [],
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: quote, error: null }
}

/** Update quote status (accept/reject/cancel) */
export async function updateQuote(
  supabase: SupabaseClientType,
  quoteId: string,
  userId: string,
  action: 'accept' | 'reject' | 'cancel'
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const { data: quote } = await supabase
    .from('quotes')
    .select(
      'id, request_id, provider_id, amount, description, valid_until, status, created_at, updated_at'
    )
    .eq('id', quoteId)
    .single()

  if (!quote) {
    return { data: null, error: 'QUOTE_NOT_FOUND' }
  }

  // Check authorization and validate action
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  const isProvider = provider?.id === quote.provider_id

  const { data: devisRequest } = await supabase
    .from('devis_requests')
    .select('client_id')
    .eq('id', quote.request_id)
    .single()

  const isClient = devisRequest?.client_id === userId

  let newStatus: string

  switch (action) {
    case 'accept':
      if (!isClient) return { data: null, error: 'ONLY_CLIENT_CAN_ACCEPT' }
      newStatus = 'accepted'
      break
    case 'reject':
      if (!isClient) return { data: null, error: 'ONLY_CLIENT_CAN_REJECT' }
      newStatus = 'rejected'
      break
    case 'cancel':
      if (!isProvider) return { data: null, error: 'ONLY_PROVIDER_CAN_CANCEL' }
      newStatus = 'cancelled'
      break
  }

  // Defense-in-depth: filter by owner in the UPDATE itself
  const updateQuery = supabase
    .from('quotes')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)

  if (action === 'cancel') {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    updateQuery.eq('provider_id', provider!.id)
  } else {
    updateQuery.eq('request_id', quote.request_id)
  }

  const { data: updatedQuote, error } = await updateQuery.select().single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: updatedQuote, error: null }
}

/** Bulk update quote statuses (provider only) */
export async function bulkUpdateQuotes(
  supabase: SupabaseClientType,
  userId: string,
  input: BulkStatusUpdateInput
): Promise<{ updated: number; error: string | null }> {
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!provider) {
    return { updated: 0, error: 'PROVIDER_NOT_FOUND' }
  }

  const { quote_ids, status } = input

  // Verify all quotes belong to this provider
  const { data: quotes, error: checkError } = await supabase
    .from('quotes')
    .select('id')
    .in('id', quote_ids)
    .eq('provider_id', provider.id)

  if (checkError) {
    return { updated: 0, error: checkError.message }
  }

  if (!quotes || quotes.length !== quote_ids.length) {
    return { updated: 0, error: 'QUOTES_NOT_OWNED' }
  }

  const updates: Record<string, unknown> = { status }
  if (status === 'read') updates.read_at = new Date().toISOString()
  if (status === 'responded') updates.first_response_at = new Date().toISOString()
  if (status === 'converted') updates.converted_at = new Date().toISOString()

  const { error } = await supabase
    .from('quotes')
    .update(updates)
    .in('id', quote_ids)
    .eq('provider_id', provider.id)

  if (error) {
    return { updated: 0, error: error.message }
  }

  return { updated: quote_ids.length, error: null }
}

/** Bulk delete quotes (provider only) */
export async function bulkDeleteQuotes(
  supabase: SupabaseClientType,
  userId: string,
  quoteIds: string[]
): Promise<{ deleted: number; error: string | null }> {
  const { data: provider } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!provider) {
    return { deleted: 0, error: 'PROVIDER_NOT_FOUND' }
  }

  const { error } = await supabase
    .from('quotes')
    .delete()
    .in('id', quoteIds)
    .eq('provider_id', provider.id)

  if (error) {
    return { deleted: 0, error: error.message }
  }

  return { deleted: quoteIds.length, error: null }
}

// ---------------------------------------------------------------------------
// Admin queries
// ---------------------------------------------------------------------------

/** Admin: list devis_requests with pagination, search, and status filter */
export async function adminListQuotes(
  supabase: SupabaseClientType,
  params: AdminQuoteListParams,
  sanitizeSearchQuery: (q: string) => string
): Promise<{ data: AdminQuoteListResult; error: string | null }> {
  const { status, search, page, limit } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('devis_requests')
    .select(
      'id, client_id, service_name, postal_code, city, description, budget, urgency, client_name, client_email, client_phone, status, created_at',
      { count: 'exact' }
    )

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (search) {
    const sanitized = sanitizeSearchQuery(search)
    if (sanitized) {
      query = query.or(
        `service_name.ilike.%${sanitized}%,description.ilike.%${sanitized}%,client_name.ilike.%${sanitized}%,client_email.ilike.%${sanitized}%,postal_code.ilike.%${sanitized}%,city.ilike.%${sanitized}%`
      )
    }
  }

  const {
    data: demandes,
    count,
    error,
  } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (error) {
    // Return empty list on query failure (same behavior as original)
    return {
      data: {
        demandes: [],
        assignments: {},
        total: 0,
        page,
        totalPages: 0,
      },
      error: error.message,
    }
  }

  // Fetch lead_assignments for these demandes
  const demandeIds = (demandes ?? []).map((d: Record<string, unknown>) => d.id as string)
  const assignmentsByLead: AdminQuoteListResult['assignments'] = {}

  if (demandeIds.length > 0) {
    const { data: assignments } = await supabase
      .from('lead_assignments')
      .select('id, lead_id, status, assigned_at, provider_id, provider:providers(id, name)')
      .in('lead_id', demandeIds)
      .order('position', { ascending: true })

    if (assignments) {
      for (const a of assignments as Array<Record<string, unknown>>) {
        const provider = a.provider as { id: string; name: string } | null
        const leadId = a.lead_id as string
        const entry = {
          id: a.id as string,
          status: a.status as string,
          assigned_at: a.assigned_at as string,
          provider_id: a.provider_id as string,
          provider_name: provider?.name || 'Inconnu',
        }
        if (!assignmentsByLead[leadId]) {
          assignmentsByLead[leadId] = []
        }
        assignmentsByLead[leadId].push(entry)
      }
    }
  }

  return {
    data: {
      demandes: demandes ?? [],
      assignments: assignmentsByLead,
      total: count ?? 0,
      page,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
    error: null,
  }
}

/** Admin: delete a devis_request and its lead_assignments */
export async function adminDeleteQuote(
  supabase: SupabaseClientType,
  id: string
): Promise<{ error: string | null }> {
  // Delete related lead_assignments first
  await supabase.from('lead_assignments').delete().eq('lead_id', id)

  const { error } = await supabase.from('devis_requests').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

/** Admin: get a single quote by ID */
export async function adminGetQuote(
  supabase: SupabaseClientType,
  quoteId: string
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const { data: quote, error } = await supabase
    .from('quotes')
    .select(
      'id, request_id, provider_id, amount, description, valid_until, status, created_at, updated_at'
    )
    .eq('id', quoteId)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: quote, error: null }
}

/** Admin: update a quote */
export async function adminUpdateQuote(
  supabase: SupabaseClientType,
  quoteId: string,
  updates: AdminUpdateQuoteInput
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  // Get old data for audit
  await supabase
    .from('quotes')
    .select(
      'id, request_id, provider_id, amount, description, valid_until, status, created_at, updated_at'
    )
    .eq('id', quoteId)
    .single()

  const { data: quote, error } = await supabase
    .from('quotes')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: quote, error: null }
}

/** Admin: delete a quote */
export async function adminDeleteQuoteById(
  supabase: SupabaseClientType,
  quoteId: string
): Promise<{ error: string | null }> {
  // Get quote data for audit
  await supabase
    .from('quotes')
    .select(
      'id, request_id, provider_id, amount, description, valid_until, status, created_at, updated_at'
    )
    .eq('id', quoteId)
    .single()

  const { error } = await supabase.from('quotes').delete().eq('id', quoteId)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
