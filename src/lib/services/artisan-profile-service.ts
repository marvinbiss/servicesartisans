/**
 * Artisan Profile Service — Centralized Supabase queries for artisan dashboard
 * Framework-agnostic: no NextRequest/NextResponse
 */

import type { SupabaseClientType } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
}

export interface ProfileSettingsRow {
  id: string
  email: string | null
  full_name: string | null
  role: string | null
}

export interface ProviderFullRow {
  id: string
  stable_id: string | null
  name: string | null
  slug: string | null
  email: string | null
  phone: string | null
  phone_secondary: string | null
  website: string | null
  siret: string | null
  specialty: string | null
  description: string | null
  bio: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_region: string | null
  address_department: string | null
  latitude: number | null
  longitude: number | null
  is_verified: boolean
  is_active: boolean | null
  noindex: boolean | null
  rating_average: number | null
  review_count: number | null
  user_id: string | null
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
  opening_hours: unknown
  accepts_new_clients: boolean | null
  free_quote: boolean | null
  available_24h: boolean | null
  intervention_radius_km: number | null
  services_offered: unknown
  service_prices: unknown
  faq: unknown
  team_size: number | null
}

export interface ProviderProfileRow {
  id: string
  name: string | null
  slug: string | null
  siret: string | null
  phone: string | null
  address_street: string | null
  address_city: string | null
  address_postal_code: string | null
  address_region: string | null
  specialty: string | null
  rating_average: number | null
  review_count: number | null
  is_verified: boolean
  is_active: boolean | null
}

export interface ProviderSettingsRow {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  is_active: boolean | null
  is_verified: boolean
}

export interface ProviderIdRow {
  id: string
}

export interface ProviderAvatarRow {
  id: string
  avatar_url: string | null
}

export interface ProviderRevalidationRow {
  specialty: string | null
  address_city: string | null
  slug: string | null
  stable_id: string | null
}

export interface ReviewRow {
  id: string
  provider_id: string
  rating: number
  content: string | null
  reply: string | null
  reply_date: string | null
  author_name: string | null
  booking_id: string | null
  created_at: string
  updated_at: string | null
}

export interface ReviewForReply {
  id: string
  provider_id: string
  reply: string | null
}

export interface RatingRow {
  rating: number
}

export interface TeamMemberRow {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  color: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface LeadAssignmentRow {
  lead_id: string
}

export interface DevisRequestRow {
  id: string
  client_id: string | null
  service_id: string | null
  service_name: string | null
  postal_code: string | null
  city: string | null
  description: string | null
  budget: string | null
  urgency: string | null
  status: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  created_at: string
  updated_at: string | null
}

export interface DevisRequestStatusRow {
  id: string
  status: string
}

export interface QuoteRow {
  id: string
  request_id: string
  provider_id: string
  amount: number
  description: string | null
  valid_until: string | null
  status: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request?: any
}

export interface QuoteStatusRow {
  id: string
  status: string
  provider_id: string
}

export interface InsertTeamMemberInput {
  artisan_id: string
  name: string
  email: string
  phone: string | null
  role: string
  color: string
  is_active: boolean
}

export interface InsertQuoteInput {
  request_id: string
  provider_id: string
  amount: number
  description: string
  valid_until: string
  status: string
}

// ---------------------------------------------------------------------------
// Profile queries
// ---------------------------------------------------------------------------

/** Fetch artisan profile from profiles table */
export async function getProfileById(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProfileRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single()

  return { data, error }
}

/** Fetch profile for settings view */
export async function getProfileForSettings(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProfileSettingsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single()

  return { data, error }
}

/** Update profile fields (profiles table) */
export async function updateProfileById(
  supabase: SupabaseClientType,
  userId: string,
  updates: Record<string, string>
): Promise<{ data: ProfileRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select('id, email, full_name, role')
    .single()

  return { data, error }
}

/** Update profile full_name only */
export async function updateProfileFullName(
  supabase: SupabaseClientType,
  userId: string,
  fullName: string
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)

  return { error }
}

// ---------------------------------------------------------------------------
// Provider queries
// ---------------------------------------------------------------------------

/** Fetch full provider data for the provider dashboard */
export async function getProviderFull(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderFullRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select(
      'id, stable_id, name, slug, email, phone, phone_secondary, website, siret, specialty, description, bio, address_street, address_city, address_postal_code, address_region, address_department, latitude, longitude, is_verified, is_active, noindex, rating_average, review_count, user_id, avatar_url, created_at, updated_at, opening_hours, accepts_new_clients, free_quote, available_24h, intervention_radius_km, services_offered, service_prices, faq, team_size'
    )
    .eq('user_id', userId)
    .or('is_active.eq.true,is_active.is.null')
    .single()

  return { data, error }
}

/** Fetch provider for the profile view */
export async function getProviderForProfile(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderProfileRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select(
      'id, name, slug, siret, phone, address_street, address_city, address_postal_code, address_region, specialty, rating_average, review_count, is_verified, is_active'
    )
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Fetch provider for settings view */
export async function getProviderForSettings(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderSettingsRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id, name, phone, email, is_active, is_verified')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Fetch provider ID only (for scoped queries) */
export async function getProviderIdByUserId(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Fetch active provider ID (maybeSingle — returns null instead of error on miss) */
export async function getActiveProviderIdByUserId(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  return { data, error }
}

/** Fetch provider ID with no active filter (maybeSingle) */
export async function getProviderIdMaybeSingle(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

/** Fetch provider for revalidation (slug, specialty, city) */
export async function getProviderForRevalidation(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderRevalidationRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('specialty, address_city, slug, stable_id')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Fetch provider for the provider PUT route (id + revalidation fields) */
export async function getProviderForUpdate(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: (ProviderIdRow & ProviderRevalidationRow) | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id, specialty, address_city, slug, stable_id')
    .eq('user_id', userId)
    .or('is_active.eq.true,is_active.is.null')
    .single()

  return { data, error }
}

/** Update provider by ID, returning full record */
export async function updateProviderById(
  supabase: SupabaseClientType,
  providerId: string,
  updates: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', providerId)
    .select()
    .single()

  return { data, error }
}

/** Update provider by ID (settings — no select) */
export async function updateProviderByIdNoSelect(
  supabase: SupabaseClientType,
  providerId: string,
  updates: Record<string, string>
): Promise<{ error: unknown }> {
  const { error } = await supabase.from('providers').update(updates).eq('id', providerId)

  return { error }
}

/** Update provider profile fields (profile PUT) */
export async function updateProviderByUserId(
  supabase: SupabaseClientType,
  userId: string,
  updates: Record<string, string>
): Promise<{
  data: {
    id: string
    name: string | null
    slug: string | null
    siret: string | null
    phone: string | null
    address_street: string | null
    address_city: string | null
    address_postal_code: string | null
    specialty: string | null
    stable_id: string | null
    is_verified: boolean
    is_active: boolean | null
  } | null
  error: unknown
}> {
  const { data, error } = await supabase
    .from('providers')
    .update(updates)
    .eq('user_id', userId)
    .select(
      'id, name, slug, siret, phone, address_street, address_city, address_postal_code, specialty, stable_id, is_verified, is_active'
    )
    .single()

  return { data, error }
}

/** Sync profile data from provider (fire-and-forget) */
export function syncProviderToProfile(
  supabase: SupabaseClientType,
  userId: string,
  profileData: Record<string, unknown>
): void {
  supabase
    .from('profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .then(({ error }) => {
      if (error) {
        // Caller should have its own logger; this is fire-and-forget
      }
    })
}

// ---------------------------------------------------------------------------
// Avatar queries
// ---------------------------------------------------------------------------

/** Fetch provider for avatar operations */
export async function getProviderForAvatar(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: ProviderAvatarRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('providers')
    .select('id, avatar_url')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/** Update avatar_url on providers table */
export async function updateProviderAvatarUrl(
  supabase: SupabaseClientType,
  userId: string,
  avatarUrl: string | null
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('providers')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', userId)

  return { error }
}

// ---------------------------------------------------------------------------
// Reviews queries
// ---------------------------------------------------------------------------

/** Fetch paginated reviews for a provider */
export async function getReviewsByProviderId(
  supabase: SupabaseClientType,
  providerId: string,
  opts: { orderColumn: string; ascending: boolean; from: number; to: number }
): Promise<{ data: ReviewRow[] | null; error: unknown; count: number | null }> {
  const { data, error, count } = await supabase
    .from('reviews')
    .select(
      'id, provider_id, rating, content, reply, reply_date, author_name, booking_id, created_at, updated_at',
      { count: 'exact' }
    )
    .eq('provider_id', providerId)
    .order(opts.orderColumn, { ascending: opts.ascending })
    .range(opts.from, opts.to)

  return { data, error, count }
}

/** Fetch all ratings for a provider (for stats) */
export async function getReviewRatings(
  supabase: SupabaseClientType,
  providerId: string
): Promise<{ data: RatingRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', providerId)

  return { data, error }
}

/** Fetch a single review by ID scoped to a provider */
export async function getReviewByIdForProvider(
  supabase: SupabaseClientType,
  reviewId: string,
  providerId: string
): Promise<{ data: ReviewForReply | null; error: unknown }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, provider_id, reply')
    .eq('id', reviewId)
    .eq('provider_id', providerId)
    .single()

  return { data, error }
}

/** Update review with reply */
export async function updateReviewReply(
  supabase: SupabaseClientType,
  reviewId: string,
  providerId: string,
  reply: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('reviews')
    .update({
      reply,
      reply_date: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .eq('provider_id', providerId)

  return { error }
}

// ---------------------------------------------------------------------------
// Team queries
// ---------------------------------------------------------------------------

/** List team members for an artisan */
export async function getTeamMembers(
  supabase: SupabaseClientType,
  artisanId: string
): Promise<{ data: TeamMemberRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id, name, email, phone, role, color, avatar_url, is_active, created_at')
    .eq('artisan_id', artisanId)
    .order('created_at', { ascending: true })

  return { data, error }
}

/** Insert a new team member */
export async function insertTeamMember(
  supabase: SupabaseClientType,
  input: InsertTeamMemberInput
): Promise<{ data: TeamMemberRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('team_members')
    .insert(input)
    .select('id, name, email, phone, role, color, avatar_url, is_active, created_at')
    .single()

  return { data, error }
}

/** Fetch a team member by ID scoped to artisan (ownership check) */
export async function getTeamMemberByIdForArtisan(
  supabase: SupabaseClientType,
  memberId: string,
  artisanId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('team_members')
    .select('id')
    .eq('id', memberId)
    .eq('artisan_id', artisanId)
    .single()

  return { data, error }
}

/** Update a team member */
export async function updateTeamMember(
  supabase: SupabaseClientType,
  memberId: string,
  artisanId: string,
  updates: Record<string, unknown>
): Promise<{ data: TeamMemberRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', memberId)
    .eq('artisan_id', artisanId)
    .select('id, name, email, phone, role, color, avatar_url, is_active, created_at')
    .single()

  return { data, error }
}

/** Delete a team member */
export async function deleteTeamMember(
  supabase: SupabaseClientType,
  memberId: string,
  artisanId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('artisan_id', artisanId)

  return { error }
}

// ---------------------------------------------------------------------------
// Demandes (lead assignments + devis_requests)
// ---------------------------------------------------------------------------

/** Fetch lead_assignment lead_ids for a provider */
export async function getLeadAssignmentsByProviderId(
  supabase: SupabaseClientType,
  providerId: string
): Promise<{ data: LeadAssignmentRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('lead_assignments')
    .select('lead_id')
    .eq('provider_id', providerId)

  return { data, error }
}

/** Fetch devis_requests by IDs (status only, for stats) */
export async function getDevisRequestStatusByIds(
  supabase: SupabaseClientType,
  ids: string[]
): Promise<{ data: DevisRequestStatusRow[] | null; error: unknown }> {
  const { data, error } = await supabase.from('devis_requests').select('id, status').in('id', ids)

  return { data, error }
}

/** Fetch devis_requests by IDs with full data, optional status filter */
export async function getDevisRequestsByIds(
  supabase: SupabaseClientType,
  ids: string[],
  statusFilter?: string
): Promise<{ data: DevisRequestRow[] | null; error: unknown }> {
  let query = supabase
    .from('devis_requests')
    .select(
      'id, client_id, service_id, service_name, postal_code, city, description, budget, urgency, status, client_name, client_email, client_phone, created_at, updated_at'
    )
    .in('id', ids)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  return { data, error }
}

/** Verify a devis_request exists and check its status */
export async function getDevisRequestById(
  supabase: SupabaseClientType,
  requestId: string
): Promise<{ data: DevisRequestStatusRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('devis_requests')
    .select('id, status')
    .eq('id', requestId)
    .single()

  return { data, error }
}

// ---------------------------------------------------------------------------
// Quotes (devis)
// ---------------------------------------------------------------------------

/** Fetch quotes for a provider */
export async function getQuotesByProviderId(
  supabase: SupabaseClientType,
  providerId: string
): Promise<{ data: QuoteRow[] | null; error: unknown }> {
  const { data, error } = await supabase
    .from('quotes')
    .select(
      `
      id,
      request_id,
      provider_id,
      amount,
      description,
      valid_until,
      status,
      created_at,
      request:devis_requests!request_id(id, service_name, city, postal_code, description, status, created_at)
    `
    )
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  return { data, error }
}

/** Verify a lead_assignment exists for provider + request */
export async function getLeadAssignment(
  supabase: SupabaseClientType,
  providerId: string,
  leadId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('lead_assignments')
    .select('id')
    .eq('provider_id', providerId)
    .eq('lead_id', leadId)
    .single()

  return { data, error }
}

/** Check for duplicate quote (same request + provider) */
export async function getExistingQuote(
  supabase: SupabaseClientType,
  requestId: string,
  providerId: string
): Promise<{ data: ProviderIdRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('quotes')
    .select('id')
    .eq('request_id', requestId)
    .eq('provider_id', providerId)
    .maybeSingle()

  return { data, error }
}

/** Insert a new quote */
export async function insertQuote(
  supabase: SupabaseClientType,
  input: InsertQuoteInput
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await supabase.from('quotes').insert(input).select().single()

  return { data, error }
}

/** Fetch a quote by ID (with status + provider_id for ownership check) */
export async function getQuoteById(
  supabase: SupabaseClientType,
  quoteId: string
): Promise<{ data: QuoteStatusRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, status, provider_id')
    .eq('id', quoteId)
    .single()

  return { data, error }
}

/** Fetch a quote by ID scoped to a provider */
export async function getQuoteByIdForProvider(
  supabase: SupabaseClientType,
  quoteId: string,
  providerId: string
): Promise<{ data: QuoteStatusRow | null; error: unknown }> {
  const { data, error } = await supabase
    .from('quotes')
    .select('id, status, provider_id')
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .single()

  return { data, error }
}

/**
 * Update a quote.
 * `status = 'pending'` est appliqué dans la mutation elle-même (anti-TOCTOU) :
 * le pre-check des routes ne suffit pas si le statut change entre lecture et écriture.
 */
export async function updateQuote(
  supabase: SupabaseClientType,
  quoteId: string,
  providerId: string,
  updates: Record<string, unknown>
): Promise<{ data: Record<string, unknown> | null; error: unknown }> {
  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .eq('status', 'pending')
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a quote.
 * `status = 'pending'` appliqué dans la mutation (anti-TOCTOU, cf. updateQuote).
 */
export async function deleteQuote(
  supabase: SupabaseClientType,
  quoteId: string,
  providerId: string
): Promise<{ error: unknown }> {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId)
    .eq('provider_id', providerId)
    .eq('status', 'pending')

  return { error }
}
