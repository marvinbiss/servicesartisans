/**
 * Leads Service — Centralized Supabase queries for lead_assignments and lead_events
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logLeadEvent } from '@/lib/dashboard/events'
import { logger } from '@/lib/logger'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supabase client type (user-scoped or admin) */
type SupabaseClient = ReturnType<typeof createAdminClient>

export interface LeadAssignmentRow {
  id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  lead_id?: string
  lead?: LeadData | LeadData[] | null
}

export interface LeadData {
  id: string
  service_name: string
  city: string | null
  postal_code: string | null
  description: string | null
  client_name: string
  client_email: string
  client_phone: string | null
  created_at: string
  status?: string
  budget?: string | null
  urgency?: string | null
}

export interface LeadEventRow {
  id: string
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
  lead_id?: string
}

export interface LeadPagination {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export type DerivedStatus =
  | 'en_attente'
  | 'en_traitement'
  | 'devis_recus'
  | 'accepte'
  | 'termine'
  | 'expire'
  | 'refuse'

export const STATUS_LABELS: Record<DerivedStatus, string> = {
  en_attente: 'En attente',
  en_traitement: 'En traitement',
  devis_recus: 'Devis reçu(s)',
  accepte: 'Accepté',
  termine: 'Terminé',
  expire: 'Expiré',
  refuse: 'Refusé',
}

export interface AssignmentWithProvider {
  id: string
  lead_id: string
  status: string
  assigned_at: string
  viewed_at: string | null
  source_table: string | null
  score: number | null
  distance_km: number | null
  position: number | null
  provider: {
    id: string
    name: string
    specialty: string | null
    address_city: string | null
  } | null
}

export interface DispatchStats {
  pending: number
  viewed: number
  quoted: number
  total: number
}

export interface ArtisanLeadStats {
  total: number
  pending: number
  viewed: number
  quoted: number
  declined: number
  accepted: number
  completed: number
  conversionRate: number
  avgResponseMinutes: number
  thisMonth: number
  lastMonth: number
  monthlyGrowth: number
}

export interface MonthlyTrendItem {
  month: string
  count: number
}

// ---------------------------------------------------------------------------
// Provider resolution (shared across artisan routes)
// ---------------------------------------------------------------------------

export async function getProviderForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<{ id: string; address_city?: string | null } | null> {
  const { data: provider } = await supabase
    .from('providers')
    .select('id, address_city')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  return provider
}

// ---------------------------------------------------------------------------
// Artisan: list leads with pagination
// ---------------------------------------------------------------------------

export async function getLeadsForArtisan(
  supabase: SupabaseClient,
  providerId: string,
  opts: { page: number; pageSize: number; status: string }
): Promise<{
  assignments: LeadAssignmentRow[]
  totalItems: number
  totalPages: number
}> {
  const { page, pageSize, status } = opts
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Count query
  let countQuery = supabase
    .from('lead_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', providerId)

  if (status !== 'all') {
    countQuery = countQuery.eq('status', status)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    logger.error('Error counting leads:', countError)
    throw new Error('Erreur lors du comptage des leads')
  }

  const totalItems = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Data query with pagination
  let dataQuery = supabase
    .from('lead_assignments')
    .select(
      `
      id,
      status,
      assigned_at,
      viewed_at,
      lead:devis_requests (
        id,
        service_name,
        city,
        postal_code,
        description,
        urgency,
        client_name,
        client_email,
        client_phone,
        created_at,
        status
      )
    `
    )
    .eq('provider_id', providerId)
    .order('assigned_at', { ascending: false })
    .range(from, to)

  if (status !== 'all') {
    dataQuery = dataQuery.eq('status', status)
  }

  const { data: assignments, error: assignError } = await dataQuery

  if (assignError) {
    logger.error('Error fetching assigned leads:', assignError)
    throw new Error('Erreur lors de la récupération des leads')
  }

  return {
    assignments: (assignments as LeadAssignmentRow[]) || [],
    totalItems,
    totalPages,
  }
}

// ---------------------------------------------------------------------------
// Artisan: get single lead detail
// ---------------------------------------------------------------------------

export async function getLeadByIdForArtisan(
  supabase: SupabaseClient,
  assignmentId: string,
  providerId: string
): Promise<LeadAssignmentRow | null> {
  const { data: assignment, error: assignError } = await supabase
    .from('lead_assignments')
    .select(
      `
      id,
      status,
      assigned_at,
      viewed_at,
      lead:devis_requests (
        id,
        service_name,
        city,
        postal_code,
        description,
        budget,
        urgency,
        client_name,
        client_email,
        client_phone,
        created_at,
        status
      )
    `
    )
    .eq('id', assignmentId)
    .eq('provider_id', providerId)
    .single()

  if (assignError || !assignment) {
    return null
  }

  return assignment as LeadAssignmentRow
}

// ---------------------------------------------------------------------------
// Artisan: get assignment (minimal — for action verification)
// ---------------------------------------------------------------------------

export async function getAssignmentForAction(
  supabase: SupabaseClient,
  assignmentId: string,
  providerId: string
): Promise<{ id: string; lead_id: string; status: string } | null> {
  const { data: assignment, error } = await supabase
    .from('lead_assignments')
    .select('id, lead_id, status')
    .eq('id', assignmentId)
    .eq('provider_id', providerId)
    .single()

  if (error || !assignment) {
    return null
  }

  return assignment
}

// ---------------------------------------------------------------------------
// Artisan: update assignment status
// ---------------------------------------------------------------------------

export async function updateAssignmentStatus(
  supabase: SupabaseClient,
  assignmentId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('lead_assignments').update(updates).eq('id', assignmentId)

  if (error) {
    logger.error('Lead assignment update error:', error)
    throw new Error('Erreur lors de la mise à jour du lead')
  }
}

// ---------------------------------------------------------------------------
// Artisan: check existing quote
// ---------------------------------------------------------------------------

export async function getExistingQuote(
  supabase: SupabaseClient,
  leadId: string,
  providerId: string
): Promise<{ id: string } | null> {
  const { data: existingQuote } = await supabase
    .from('quotes')
    .select('id')
    .eq('request_id', leadId)
    .eq('provider_id', providerId)
    .limit(1)
    .single()

  return existingQuote
}

// ---------------------------------------------------------------------------
// Artisan: insert quote
// ---------------------------------------------------------------------------

export async function insertQuote(
  supabase: SupabaseClient,
  data: {
    requestId: string
    providerId: string
    amount: number
    description: string
    validUntil: string
  }
): Promise<void> {
  const { error } = await supabase.from('quotes').insert({
    request_id: data.requestId,
    provider_id: data.providerId,
    amount: data.amount,
    description: data.description,
    valid_until: data.validUntil,
    status: 'pending',
  })

  if (error) {
    logger.error('Lead quote insert error:', error)
    throw new Error('Erreur lors de la création du devis')
  }
}

// ---------------------------------------------------------------------------
// Artisan: lead event history
// ---------------------------------------------------------------------------

export async function getLeadHistory(
  adminClient: SupabaseClient,
  leadId: string,
  providerId: string
): Promise<LeadEventRow[]> {
  const { data: events, error } = await adminClient
    .from('lead_events')
    .select('id, event_type, metadata, created_at')
    .eq('lead_id', leadId)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error('Lead history error:', error)
    throw new Error('Erreur serveur')
  }

  return (events as LeadEventRow[]) || []
}

// ---------------------------------------------------------------------------
// Artisan: verify assignment ownership (for history route)
// ---------------------------------------------------------------------------

export async function verifyAssignmentOwnership(
  supabase: SupabaseClient,
  assignmentId: string,
  providerId: string
): Promise<{ lead_id: string } | null> {
  const { data: assignment } = await supabase
    .from('lead_assignments')
    .select('lead_id')
    .eq('id', assignmentId)
    .eq('provider_id', providerId)
    .single()

  return assignment
}

// ---------------------------------------------------------------------------
// Artisan: lead stats
// ---------------------------------------------------------------------------

export async function getLeadStats(
  adminClient: SupabaseClient,
  providerId: string
): Promise<{ stats: ArtisanLeadStats; monthlyTrend: MonthlyTrendItem[] }> {
  const now = new Date()

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  // 6-month trend boundaries
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    return {
      start: d.toISOString(),
      end: end.toISOString(),
      label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    }
  })

  const [
    totalCount,
    pendingCount,
    viewedCount,
    declinedCount,
    quotedCount,
    acceptedCount,
    completedCount,
    thisMonthCount,
    lastMonthCount,
    ...trendCounts
  ] = await Promise.all([
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId),
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'pending'),
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'viewed'),
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'declined'),
    adminClient
      .from('lead_events')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('event_type', 'quoted'),
    adminClient
      .from('lead_events')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('event_type', 'accepted'),
    adminClient
      .from('lead_events')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('event_type', 'completed'),
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .gte('assigned_at', thisMonthStart),
    adminClient
      .from('lead_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .gte('assigned_at', lastMonthStart)
      .lt('assigned_at', thisMonthStart),
    ...trendMonths.map((m) =>
      adminClient
        .from('lead_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerId)
        .gte('assigned_at', m.start)
        .lt('assigned_at', m.end)
    ),
  ])

  if (totalCount.error) {
    logger.error('Leads stats total count error:', totalCount.error)
    throw new Error('Erreur serveur')
  }

  // Average response time — limited to 500 recent viewed leads
  const { data: responseTimeRows } = await adminClient
    .from('lead_assignments')
    .select('assigned_at, viewed_at')
    .eq('provider_id', providerId)
    .not('viewed_at', 'is', null)
    .order('assigned_at', { ascending: false })
    .limit(500)

  const responseTimes = (responseTimeRows || []).map(
    (a) => (new Date(a.viewed_at as string).getTime() - new Date(a.assigned_at).getTime()) / 60000
  )
  const avgResponseMinutes =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
      : 0

  const total = totalCount.count ?? 0
  const pending = pendingCount.count ?? 0
  const viewed = viewedCount.count ?? 0
  const declined = declinedCount.count ?? 0
  const quoted = quotedCount.count ?? 0
  const accepted = acceptedCount.count ?? 0
  const completed = completedCount.count ?? 0
  const thisMonth = thisMonthCount.count ?? 0
  const lastMonth = lastMonthCount.count ?? 0

  const conversionRate = quoted > 0 ? Math.round((accepted / quoted) * 100) : 0
  const monthlyGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0

  const monthlyTrend = trendMonths.map((m, i) => ({
    month: m.label,
    count: trendCounts[i].count ?? 0,
  }))

  return {
    stats: {
      total,
      pending,
      viewed,
      quoted,
      declined,
      accepted,
      completed,
      conversionRate,
      avgResponseMinutes,
      thisMonth,
      lastMonth,
      monthlyGrowth,
    },
    monthlyTrend,
  }
}

// ---------------------------------------------------------------------------
// Artisan: export leads (with optional filters)
// ---------------------------------------------------------------------------

export async function getLeadsForExport(
  supabase: SupabaseClient,
  providerId: string,
  opts: { status?: string; from?: string; to?: string; limit: number }
): Promise<LeadAssignmentRow[]> {
  let query = supabase
    .from('lead_assignments')
    .select(
      `
      id,
      status,
      assigned_at,
      lead:devis_requests (
        id,
        service_name,
        city,
        postal_code,
        description,
        client_name,
        client_email,
        client_phone,
        created_at
      )
    `
    )
    .eq('provider_id', providerId)
    .order('assigned_at', { ascending: false })
    .limit(opts.limit)

  if (opts.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  }

  if (opts.from) {
    query = query.gte('assigned_at', `${opts.from}T00:00:00`)
  }

  if (opts.to) {
    query = query.lte('assigned_at', `${opts.to}T23:59:59`)
  }

  const { data: assignments, error } = await query

  if (error) {
    logger.error('Error exporting leads:', error)
    throw new Error("Erreur lors de l'export")
  }

  return (assignments as LeadAssignmentRow[]) || []
}

// ---------------------------------------------------------------------------
// Client: get devis_requests for a client
// ---------------------------------------------------------------------------

export async function getDevisRequestsForClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<
  Array<{
    id: string
    service_name: string
    city: string | null
    postal_code: string | null
    description: string | null
    budget: string | null
    urgency: string | null
    status: string
    client_name: string
    created_at: string
  }>
> {
  const { data, error } = await supabase
    .from('devis_requests')
    .select(
      'id, service_name, city, postal_code, description, budget, urgency, status, client_name, created_at'
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Client leads fetch error:', error)
    throw new Error('Erreur serveur')
  }

  return data || []
}

// ---------------------------------------------------------------------------
// Client: get lead events for multiple lead IDs
// ---------------------------------------------------------------------------

export async function getLeadEventsForLeads(
  adminClient: SupabaseClient,
  leadIds: string[]
): Promise<Array<{ lead_id: string; event_type: string; created_at: string }>> {
  const { data, error } = await adminClient
    .from('lead_events')
    .select('lead_id, event_type, created_at')
    .in('lead_id', leadIds)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Client lead_events fetch error:', error)
    // Non-blocking: return empty array
    return []
  }

  return data || []
}

// ---------------------------------------------------------------------------
// Client: derive status from events
// ---------------------------------------------------------------------------

export function deriveStatus(events: Array<{ event_type: string }>): DerivedStatus {
  if (events.length === 0) return 'en_attente'

  const types = new Set(events.map((e) => e.event_type))
  if (types.has('completed')) return 'termine'
  if (types.has('expired')) return 'expire'
  if (types.has('accepted')) return 'accepte'
  if (types.has('refused')) return 'refuse'
  if (types.has('quoted')) return 'devis_recus'
  if (
    types.has('dispatched') ||
    types.has('viewed') ||
    types.has('declined') ||
    types.has('reassigned')
  )
    return 'en_traitement'
  return 'en_attente'
}

// ---------------------------------------------------------------------------
// Client: get single devis_request
// ---------------------------------------------------------------------------

export async function getDevisRequestById(
  supabase: SupabaseClient,
  leadId: string,
  clientId: string
): Promise<LeadData | null> {
  const { data, error } = await supabase
    .from('devis_requests')
    .select(
      'id, service_name, city, postal_code, description, budget, urgency, status, client_name, client_email, client_phone, created_at'
    )
    .eq('id', leadId)
    .eq('client_id', clientId)
    .single()

  if (error || !data) {
    return null
  }

  return data as LeadData
}

// ---------------------------------------------------------------------------
// Client: get quotes for a lead
// ---------------------------------------------------------------------------

export async function getQuotesForLead(
  adminClient: SupabaseClient,
  leadId: string
): Promise<
  Array<{
    id: string
    amount: number
    description: string | null
    valid_until: string | null
    status: string
    created_at: string
    provider_id: string
    provider:
      | {
          id: string
          name: string
          specialty: string | null
          address_city: string | null
          rating_average: number | null
        }
      | Array<{
          id: string
          name: string
          specialty: string | null
          address_city: string | null
          rating_average: number | null
        }>
      | null
  }>
> {
  const { data, error } = await adminClient
    .from('quotes')
    .select(
      `
      id,
      amount,
      description,
      valid_until,
      status,
      created_at,
      provider_id,
      provider:providers!provider_id(id, name, specialty, address_city, rating_average)
    `
    )
    .eq('request_id', leadId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error('Client lead detail quotes error:', error)
    return []
  }

  return data || []
}

// ---------------------------------------------------------------------------
// Client: get events for a single lead
// ---------------------------------------------------------------------------

export async function getLeadEventsById(
  adminClient: SupabaseClient,
  leadId: string
): Promise<LeadEventRow[]> {
  const { data, error } = await adminClient
    .from('lead_events')
    .select('id, event_type, metadata, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error('Client lead detail events error:', error)
    return []
  }

  return (data as LeadEventRow[]) || []
}

// ---------------------------------------------------------------------------
// Client: get assignments stats for a lead
// ---------------------------------------------------------------------------

export async function getAssignmentsForLead(
  adminClient: SupabaseClient,
  leadId: string
): Promise<Array<{ id: string; status: string }>> {
  const { data, error } = await adminClient
    .from('lead_assignments')
    .select('id, status')
    .eq('lead_id', leadId)

  if (error) {
    logger.error('Client lead detail assignments error:', error)
    return []
  }

  return data || []
}

// ---------------------------------------------------------------------------
// Client: get quote by ID (for accept/refuse)
// ---------------------------------------------------------------------------

export async function getQuoteById(
  adminClient: SupabaseClient,
  quoteId: string,
  leadId: string
): Promise<{ id: string; request_id: string; provider_id: string; status: string } | null> {
  const { data, error } = await adminClient
    .from('quotes')
    .select('id, request_id, provider_id, status')
    .eq('id', quoteId)
    .eq('request_id', leadId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// ---------------------------------------------------------------------------
// Client: update quote status
// ---------------------------------------------------------------------------

export async function updateQuoteStatus(
  adminClient: SupabaseClient,
  quoteId: string,
  status: string
): Promise<void> {
  const { error } = await adminClient.from('quotes').update({ status }).eq('id', quoteId)

  if (error) {
    logger.error(`Quote status update error (${status}):`, error)
    throw new Error(`Erreur lors de la mise à jour du devis`)
  }
}

// ---------------------------------------------------------------------------
// Client: refuse all other pending quotes for a lead
// ---------------------------------------------------------------------------

export async function refuseOtherQuotes(
  adminClient: SupabaseClient,
  leadId: string,
  excludeQuoteId: string
): Promise<void> {
  const { error } = await adminClient
    .from('quotes')
    .update({ status: 'refused' })
    .eq('request_id', leadId)
    .neq('id', excludeQuoteId)
    .eq('status', 'pending')

  if (error) {
    logger.error('Refuse other quotes error:', error)
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Client: update devis_request status
// ---------------------------------------------------------------------------

export async function updateDevisRequestStatus(
  adminClient: SupabaseClient,
  leadId: string,
  status: string
): Promise<void> {
  const { error } = await adminClient.from('devis_requests').update({ status }).eq('id', leadId)

  if (error) {
    logger.error('Devis request status update error:', error)
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Admin: get lead counts by filters
// ---------------------------------------------------------------------------

export async function getAdminLeadCounts(
  supabase: SupabaseClient,
  filters: { city: string | null; service: string | null }
): Promise<{ leadsCreated: number; leadsAssigned: number }> {
  let leadsQuery = supabase.from('devis_requests').select('id', { count: 'exact', head: true })
  if (filters.city) leadsQuery = leadsQuery.ilike('city', `%${filters.city}%`)
  if (filters.service) leadsQuery = leadsQuery.ilike('service_name', `%${filters.service}%`)

  let assignedQuery = supabase
    .from('lead_assignments')
    .select('id, lead:devis_requests!inner(city, service_name)', { count: 'exact', head: true })
  if (filters.city) assignedQuery = assignedQuery.ilike('lead.city', `%${filters.city}%`)
  if (filters.service)
    assignedQuery = assignedQuery.ilike('lead.service_name', `%${filters.service}%`)

  const assignedPromise = assignedQuery.then(
    (res) => res,
    () => ({ count: null as number | null, error: null })
  )

  const [leadsResult, assignedResult] = await Promise.all([leadsQuery, assignedPromise])

  let leadsAssigned = assignedResult.count
  if (leadsAssigned === null || leadsAssigned === undefined) {
    const { count: fallbackCount } = await supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
    leadsAssigned = fallbackCount
  }

  return {
    leadsCreated: leadsResult.count || 0,
    leadsAssigned: leadsAssigned || 0,
  }
}

// ---------------------------------------------------------------------------
// Admin: get active artisans
// ---------------------------------------------------------------------------

export async function getActiveArtisans(
  supabase: SupabaseClient,
  filters: { city: string | null; service: string | null }
): Promise<
  Array<{
    id: string
    stable_id: string | null
    name: string
    slug: string | null
    specialty: string | null
    address_city: string | null
    is_verified: boolean
  }>
> {
  let query = supabase
    .from('providers')
    .select('id, stable_id, name, slug, specialty, address_city, is_verified')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(100)

  if (filters.city) query = query.ilike('address_city', `${filters.city}%`)
  if (filters.service) query = query.ilike('specialty', `${filters.service}%`)

  const { data, error } = await query

  if (error) {
    logger.warn('Admin leads artisans query failed', {
      code: error.code,
      message: error.message,
    })
    return []
  }

  return data || []
}

// ---------------------------------------------------------------------------
// Admin: dispatch monitoring — recent assignments
// ---------------------------------------------------------------------------

export async function getDispatchAssignments(
  supabase: SupabaseClient,
  opts: { page: number; limit: number }
): Promise<AssignmentWithProvider[]> {
  const offset = (opts.page - 1) * opts.limit

  const { data, error } = await supabase
    .from('lead_assignments')
    .select(
      `
      id,
      lead_id,
      status,
      assigned_at,
      viewed_at,
      source_table,
      score,
      distance_km,
      position,
      provider:providers (id, name, specialty, address_city)
    `
    )
    .order('assigned_at', { ascending: false })
    .range(offset, offset + opts.limit - 1)

  if (error) {
    logger.warn('Dispatch assignments query failed', {
      code: error.code,
      message: error.message,
    })
    return []
  }

  return (data as unknown as AssignmentWithProvider[]) || []
}

// ---------------------------------------------------------------------------
// Admin: dispatch queue stats
// ---------------------------------------------------------------------------

export async function getDispatchStats(supabase: SupabaseClient): Promise<DispatchStats> {
  const [
    { count: pendingCount },
    { count: viewedCount },
    { count: quotedCount },
    { count: totalCount },
  ] = await Promise.all([
    supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'viewed'),
    supabase
      .from('lead_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'quoted'),
    supabase.from('lead_assignments').select('id', { count: 'exact', head: true }),
  ])

  return {
    pending: pendingCount || 0,
    viewed: viewedCount || 0,
    quoted: quotedCount || 0,
    total: totalCount || 0,
  }
}

// ---------------------------------------------------------------------------
// Admin: get assignment for dispatch actions
// ---------------------------------------------------------------------------

export async function getAssignmentById(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<{ lead_id: string; provider_id: string; source_table: string | null } | null> {
  const { data } = await supabase
    .from('lead_assignments')
    .select('lead_id, provider_id, source_table')
    .eq('id', assignmentId)
    .single()

  return data
}

// ---------------------------------------------------------------------------
// Admin: reassign assignment
// ---------------------------------------------------------------------------

export async function reassignAssignment(
  supabase: SupabaseClient,
  assignmentId: string,
  newProviderId: string
): Promise<void> {
  const { error } = await supabase
    .from('lead_assignments')
    .update({
      provider_id: newProviderId,
      status: 'pending',
      assigned_at: new Date().toISOString(),
      viewed_at: null,
    })
    .eq('id', assignmentId)

  if (error) {
    logger.error('Reassign assignment error:', error)
    throw new Error('Erreur lors de la réassignation')
  }
}

// ---------------------------------------------------------------------------
// Admin: delete assignment
// ---------------------------------------------------------------------------

export async function deleteAssignment(
  supabase: SupabaseClient,
  assignmentId: string
): Promise<void> {
  const { error } = await supabase.from('lead_assignments').delete().eq('id', assignmentId)

  if (error) {
    logger.error('Dispatch assignment delete error', error)
    throw new Error('Erreur lors de la suppression')
  }
}

// ---------------------------------------------------------------------------
// Re-export logLeadEvent for convenience
// ---------------------------------------------------------------------------

export { logLeadEvent }
