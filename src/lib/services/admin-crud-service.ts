/**
 * Admin CRUD Service — Centralized Supabase queries for admin routes
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { type AdminRole } from '@/types/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supabase client type (user-scoped or admin) */
type SupabaseClient = ReturnType<typeof createAdminClient>

// --- Providers ---

export interface ProviderListParams {
  page: number
  limit: number
  filter: 'all' | 'verified' | 'pending' | 'suspended'
  search: string
}

export interface ProviderListItem {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  address_city: string
  address_region: string
  specialty: string
  is_verified: boolean
  is_active: boolean
  rating_average: number
  review_count: number
  created_at: string
  source: string | null
  siret: string | null
}

export interface ProviderDetail {
  id: string
  user_id: string | null
  stable_id: string | null
  email: string
  full_name: string
  name: string
  slug: string
  phone: string
  siret: string
  specialty: string
  description: string
  bio: string
  address_street: string
  address_city: string
  address_postal_code: string
  address_region: string
  address_department: string
  latitude: number | null
  longitude: number | null
  is_verified: boolean
  is_active: boolean
  rating_average: number | null
  review_count: number
  created_at: string
  updated_at: string | null
}

// --- Users ---

export interface UserListItem {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: 'client' | 'artisan'
  is_verified: boolean
  is_banned: boolean
  subscription_plan: string
  subscription_status: null
  average_rating: number
  review_count: number
  created_at: string
  last_sign_in_at: string | null
}

export interface UserDetail {
  id: string
  email: string | undefined
  full_name: string | null
  phone: string | null
  user_type: 'client' | 'artisan'
  is_verified: boolean
  is_banned: boolean
  subscription_plan: null
  subscription_status: null
  created_at: string
  last_sign_in_at: string | null
  provider: Record<string, unknown> | null
  stats: { bookings: number; reviews: number }
  [key: string]: unknown
}

export interface CreateUserData {
  email: string
  password: string
  full_name?: string
  phone?: string
  user_type: 'client' | 'artisan'
}

export interface UpdateUserData {
  full_name?: string
  phone?: string
  user_type?: 'client' | 'artisan'
  name?: string
  siret?: string
  description?: string
  address?: string
  city?: string
  postal_code?: string
  is_verified?: boolean
}

// --- Services ---

export interface ServiceListItem {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  category: string | null
  is_active: boolean
  sort_order: number | null
  created_at: string
}

export interface CreateServiceData {
  name: string
  slug: string
  description?: string
  icon?: string
  parent_id?: string | null
  meta_title?: string
  meta_description?: string
}

export interface UpdateServiceData {
  name?: string
  description?: string
  icon?: string
  parent_id?: string | null
  meta_title?: string
  meta_description?: string
  is_active?: boolean
  slug?: string
}

// --- Settings ---

export interface PlatformSettings {
  siteName: string
  contactEmail: string
  supportEmail: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  maxQuotesPerDay: number
  requireEmailVerification: boolean
  requirePhoneVerification: boolean
  commissionRate: number
  minBookingNotice: number
  maxBookingAdvance: number
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  siteName: 'ServicesArtisans',
  contactEmail: 'contact@servicesartisans.fr',
  supportEmail: 'support@servicesartisans.fr',
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  maxQuotesPerDay: 10,
  requireEmailVerification: true,
  requirePhoneVerification: false,
  commissionRate: 10,
  minBookingNotice: 24,
  maxBookingAdvance: 90,
}

// --- Reviews ---

export interface ReviewListItem {
  id: string
  author_name: string
  author_email: string
  provider_name: string
  provider_id: string
  rating: number
  comment: string | null
  response: string | null
  moderation_status: 'approved' | 'rejected' | 'pending'
  is_visible: boolean
  is_flagged: boolean
  created_at: string
}

export interface ReviewListParams {
  page: number
  limit: number
  filter: 'pending' | 'flagged' | 'approved' | 'rejected' | 'all'
}

// --- Admins ---

export interface AdminListItem {
  id: string
  email: string
  full_name: string | null
  role: AdminRole | null
  is_admin: boolean
  created_at: string
}

export interface CreateAdminData {
  user_id?: string
  email?: string
  role: AdminRole
}

export interface UpdateAdminData {
  role?: AdminRole
  is_admin?: boolean
}

// --- Result wrappers ---

export interface ServiceResult<T> {
  data: T
  error: null
}

export interface ServiceError {
  data: null
  error: { message: string; code?: string; status: number; details?: unknown }
}

export type ServiceResponse<T> = ServiceResult<T> | ServiceError

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PROVIDER_LIST_COLUMNS = `
  id,
  name,
  slug,
  email,
  phone,
  address_city,
  address_region,
  siret,
  specialty,
  is_verified,
  is_active,
  source,
  rating_average,
  review_count,
  created_at
`

const PROVIDER_DETAIL_COLUMNS =
  'id, user_id, stable_id, name, slug, email, phone, siret, specialty, description, bio, address_street, address_city, address_postal_code, address_region, address_department, latitude, longitude, is_verified, is_active, rating_average, review_count, created_at, updated_at'

const ALLOWED_PROVIDER_FIELDS = [
  'name',
  'slug',
  'specialty',
  'description',
  'bio',
  'address_street',
  'address_city',
  'address_postal_code',
  'address_region',
  'address_department',
  'latitude',
  'longitude',
  'phone',
  'email',
  'siret',
  'is_verified',
  'is_active',
  'noindex',
  'code_naf',
  'updated_at',
]

/** Strip HTML tags from text inputs */
const stripTags = (val: string | null | undefined): string | null =>
  val ? val.replace(/<[^>]*>/g, '').trim() : null

/** Map frontend form fields to database column names and sanitize values. */
export function buildProviderUpdateData(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.name && typeof body.name === 'string' && body.name.trim()) {
    data.name = stripTags(body.name as string)
  } else if (
    body.full_name &&
    typeof body.full_name === 'string' &&
    (body.full_name as string).trim()
  ) {
    data.name = stripTags(body.full_name as string)
  }

  if (body.specialty !== undefined) data.specialty = stripTags(body.specialty as string)

  const directFields: [string, string][] = [
    ['phone', 'phone'],
    ['email', 'email'],
    ['siret', 'siret'],
  ]
  for (const [src, dest] of directFields) {
    if (body[src] !== undefined) data[dest] = body[src] || null
  }

  if (body.description !== undefined) data.description = stripTags(body.description as string)
  if (body.bio !== undefined) data.bio = stripTags(body.bio as string)

  const addr = body.address_street ?? body.address
  if (addr !== undefined) data.address_street = stripTags(addr as string)

  const city = body.address_city ?? body.city
  if (city !== undefined) data.address_city = stripTags(city as string)

  const postal = body.address_postal_code ?? body.postal_code
  if (postal !== undefined) data.address_postal_code = (postal as string) || null

  const region = body.address_region ?? body.region ?? body.department
  if (region !== undefined) data.address_region = stripTags(region as string)

  if (body.is_verified !== undefined) data.is_verified = Boolean(body.is_verified)
  if (body.is_active !== undefined) data.is_active = Boolean(body.is_active)

  // Filter to only allowed DB columns
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_PROVIDER_FIELDS.includes(key))
  )
}

/** Map frontend moderation_status to DB status column */
function toDbStatus(moderationStatus: string): string {
  if (moderationStatus === 'approved') return 'published'
  if (moderationStatus === 'rejected') return 'hidden'
  return 'pending_review'
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export async function listProviders(
  supabase: SupabaseClient,
  params: ProviderListParams
): Promise<
  ServiceResponse<{
    providers: ProviderListItem[]
    total: number
    page: number
    totalPages: number
  }>
> {
  const { page, limit, filter, search } = params
  const offset = (page - 1) * limit

  let query = supabase.from('providers').select(PROVIDER_LIST_COLUMNS, { count: 'exact' })

  if (filter === 'verified') {
    query = query.in('is_verified', [true]).in('is_active', [true])
  } else if (filter === 'pending') {
    query = query.in('is_verified', [false]).in('is_active', [true])
  } else if (filter === 'suspended') {
    query = query.in('is_active', [false])
  }

  if (search) {
    const sanitized = sanitizeSearchQuery(search)
    if (sanitized) {
      query = query.or(
        `name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,address_city.ilike.%${sanitized}%,siret.ilike.%${sanitized}%`
      )
    }
  }

  const {
    data: providers,
    count,
    error,
  } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (error) {
    return {
      data: null,
      error: {
        message: 'Erreur lors de la récupération des artisans',
        code: error.code,
        status: 502,
      },
    }
  }

  const transformedProviders: ProviderListItem[] = (providers || []).map(
    (p: Record<string, unknown>) => ({
      id: p.id as string,
      name: p.name as string,
      slug: p.slug as string,
      email: (p.email as string) || '',
      phone: (p.phone as string) || '',
      address_city: (p.address_city as string) || '',
      address_region: (p.address_region as string) || '',
      specialty: (p.specialty as string) || 'Artisan',
      is_verified: p.is_verified as boolean,
      is_active: p.is_active as boolean,
      rating_average: Number(p.rating_average) || 0,
      review_count: Number(p.review_count) || 0,
      created_at: p.created_at as string,
      source: p.source as string | null,
      siret: p.siret as string | null,
    })
  )

  return {
    data: {
      providers: transformedProviders,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    },
    error: null,
  }
}

export async function getProviderById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ provider: ProviderDetail }>> {
  const { data: provider, error } = await supabase
    .from('providers')
    .select(PROVIDER_DETAIL_COLUMNS)
    .eq('id', id)
    .single()

  if (error || !provider) {
    return { data: null, error: { message: 'Provider non trouvé', status: 404 } }
  }

  return {
    data: {
      provider: {
        id: provider.id,
        user_id: provider.user_id || null,
        stable_id: provider.stable_id || null,
        email: provider.email || '',
        full_name: provider.name,
        name: provider.name,
        slug: provider.slug,
        phone: provider.phone || '',
        siret: provider.siret || '',
        specialty: provider.specialty || '',
        description: provider.description || '',
        bio: provider.bio || '',
        address_street: provider.address_street || '',
        address_city: provider.address_city || '',
        address_postal_code: provider.address_postal_code || '',
        address_region: provider.address_region || '',
        address_department: provider.address_department || '',
        latitude: provider.latitude,
        longitude: provider.longitude,
        is_verified: provider.is_verified || false,
        is_active: provider.is_active !== false,
        rating_average: provider.rating_average || null,
        review_count: provider.review_count || 0,
        created_at: provider.created_at,
        updated_at: provider.updated_at,
      },
    },
    error: null,
  }
}

export async function updateProvider(
  supabase: SupabaseClient,
  id: string,
  updateData: Record<string, unknown>
): Promise<ServiceResponse<{ data: Record<string, unknown> }>> {
  const { data, error } = await supabase
    .from('providers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      data: null,
      error: { message: 'Erreur lors de la mise à jour', code: error.code, status: 500 },
    }
  }

  return { data: { data }, error: null }
}

export async function deleteProvider(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ message: string }>> {
  // Clean up related data before deletion
  await supabase.from('provider_claims').delete().eq('provider_id', id)
  await supabase.from('reviews').delete().eq('provider_id', id)
  await supabase.from('lead_assignments').delete().eq('provider_id', id)
  await supabase.from('bookings').delete().eq('provider_id', id)

  const { error } = await supabase.from('providers').delete().eq('id', id)

  if (error) {
    return {
      data: null,
      error: { message: 'Erreur lors de la suppression', code: error.code, status: 500 },
    }
  }

  return { data: { message: 'Artisan supprimé définitivement' }, error: null }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers(
  supabase: SupabaseClient,
  params: {
    page: number
    limit: number
    filter: 'all' | 'clients' | 'artisans' | 'banned'
    plan: 'all' | 'gratuit' | 'pro' | 'premium'
    search: string
    authPage: number
    authPerPage: number
  }
): Promise<
  ServiceResponse<{
    users: UserListItem[]
    total: number
    page: number
    perPage: number
    totalPages: number
  }>
> {
  const { page, limit, filter, plan, search, authPage, authPerPage } = params

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
    page: authPage,
    perPage: authPerPage,
  })

  if (authError) {
    return {
      data: null,
      error: { message: 'Erreur lors de la récupération des utilisateurs', status: 502 },
    }
  }

  // Fetch profiles for all returned users
  const profilesMap = new Map<string, Record<string, unknown>>()
  try {
    const userIds = authUsers.users.map((u) => u.id)
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name, is_admin, role, phone_e164, average_rating, review_count')
        .in('id', userIds)

      if (profiles) {
        profiles.forEach((p) => profilesMap.set(p.id, p))
      }
    }
  } catch {
    // profiles table doesn't exist
  }

  let users: UserListItem[] = authUsers.users.map((user) => {
    const profile = profilesMap.get(user.id) || {}
    return {
      id: user.id,
      email: user.email || '',
      full_name:
        (profile.full_name as string) ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null,
      phone: (profile.phone_e164 as string) || user.user_metadata?.phone || null,
      user_type: user.user_metadata?.is_artisan ? ('artisan' as const) : ('client' as const),
      is_verified: !!user.email_confirmed_at,
      is_banned: user.banned_until !== null,
      subscription_plan: 'gratuit',
      subscription_status: null,
      average_rating: (profile.average_rating as number) || 0,
      review_count: (profile.review_count as number) || 0,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
    }
  })

  if (filter === 'clients') {
    users = users.filter((u) => u.user_type === 'client')
  } else if (filter === 'artisans') {
    users = users.filter((u) => u.user_type === 'artisan')
  } else if (filter === 'banned') {
    users = users.filter((u) => u.is_banned)
  }

  if (plan !== 'all') {
    users = users.filter((u) => u.subscription_plan === plan)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchLower) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchLower)) ||
        (u.phone && u.phone.includes(search))
    )
  }

  const total = users.length
  const offset = (page - 1) * limit
  const paginatedUsers = users.slice(offset, offset + limit)

  return {
    data: {
      users: paginatedUsers,
      total,
      page,
      perPage: limit,
      totalPages: Math.ceil(total / limit),
    },
    error: null,
  }
}

export async function getUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResponse<{ user: UserDetail }>> {
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError || !authUser.user) {
    return { data: null, error: { message: 'Utilisateur non trouvé', status: 404 } }
  }

  const user = authUser.user

  // Profile
  let profile: Record<string, unknown> = {}
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, is_admin, role, phone_e164, average_rating, review_count')
      .eq('id', userId)
      .single()
    if (data) profile = data
  } catch {
    // profiles table doesn't exist
  }

  // Provider data
  let providerData: Record<string, unknown> | null = null
  try {
    const { data: provider } = await supabase
      .from('providers')
      .select(
        'id, name, slug, email, phone, siret, is_verified, is_active, stable_id, noindex, address_city, address_postal_code, address_street, address_region, specialty, rating_average, review_count, created_at'
      )
      .eq('user_id', userId)
      .maybeSingle()
    providerData = provider
  } catch {
    // No provider or table doesn't exist
  }

  // Bookings count
  let bookingsCount = 0
  try {
    const [{ count: providerCount }, { count: clientCount }] = await Promise.all([
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('provider_id', userId),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', userId),
    ])
    bookingsCount = (providerCount || 0) + (clientCount || 0)
  } catch {
    // bookings table doesn't exist
  }

  // Reviews count
  let reviewsCount = 0
  try {
    const clientEmail = user.email
    if (clientEmail) {
      const { count } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('author_email', clientEmail)
      reviewsCount = count || 0
    }
  } catch {
    // reviews table doesn't exist
  }

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        full_name:
          (profile.full_name as string) ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null,
        phone: (profile.phone_e164 as string) || user.user_metadata?.phone || null,
        user_type:
          profile.role === 'artisan'
            ? 'artisan'
            : user.user_metadata?.is_artisan
              ? 'artisan'
              : 'client',
        is_verified: !!user.email_confirmed_at,
        is_banned: user.banned_until !== null,
        subscription_plan: null,
        subscription_status: null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        provider: providerData,
        stats: {
          bookings: bookingsCount,
          reviews: reviewsCount,
        },
        ...profile,
      },
    },
    error: null,
  }
}

export async function createUser(
  supabase: SupabaseClient,
  userData: CreateUserData
): Promise<ServiceResponse<{ user: Record<string, unknown>; message: string }>> {
  const { email, password, full_name, phone, user_type } = userData

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      phone,
      is_artisan: user_type === 'artisan',
    },
  })

  if (authError) {
    return { data: null, error: { message: authError.message, status: 400 } }
  }

  if (authData.user) {
    try {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email,
        full_name,
        role: user_type === 'artisan' ? 'artisan' : 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch {
      // profiles table doesn't exist, that's OK
    }
  }

  return {
    data: {
      user: authData.user as unknown as Record<string, unknown>,
      message: 'Utilisateur créé avec succès',
    },
    error: null,
  }
}

export async function updateUser(
  supabase: SupabaseClient,
  userId: string,
  userData: UpdateUserData
): Promise<ServiceResponse<{ message: string }>> {
  const userMetadataUpdates: Record<string, unknown> = {}
  if (userData.full_name !== undefined) userMetadataUpdates.full_name = userData.full_name
  if (userData.phone !== undefined) userMetadataUpdates.phone = userData.phone
  if (userData.user_type !== undefined)
    userMetadataUpdates.is_artisan = userData.user_type === 'artisan'

  if (Object.keys(userMetadataUpdates).length > 0) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: userMetadataUpdates,
    })
    if (authError) {
      return { data: null, error: { message: authError.message, status: 500 } }
    }
  }

  try {
    const allowedFields = ['full_name']
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in userData) {
        updates[field] = userData[field as keyof UpdateUserData]
      }
    }
    if (userData.user_type) {
      updates.role = userData.user_type === 'artisan' ? 'artisan' : 'client'
    }
    updates.updated_at = new Date().toISOString()

    await supabase.from('profiles').upsert({ id: userId, ...updates })
  } catch {
    // profiles table doesn't exist
  }

  return { data: { message: 'Utilisateur mis à jour' }, error: null }
}

export async function deleteUser(
  supabase: SupabaseClient,
  userId: string
): Promise<ServiceResponse<{ message: string }>> {
  const { error: banError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '876000h',
  })

  if (banError) {
    return { data: null, error: { message: banError.message, status: 500 } }
  }

  try {
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
  } catch {
    // profiles table doesn't exist
  }

  try {
    await supabase
      .from('providers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
  } catch {
    // providers table doesn't exist or no provider
  }

  return { data: { message: 'Utilisateur supprimé' }, error: null }
}

export async function banUser(
  supabase: SupabaseClient,
  userId: string,
  action: 'ban' | 'unban'
): Promise<ServiceResponse<{ message: string }>> {
  const isBanning = action === 'ban'

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: isBanning ? '876600h' : 'none',
  })

  if (authError) {
    return {
      data: null,
      error: { message: "Impossible de modifier le statut de l'utilisateur", status: 500 },
    }
  }

  await supabase
    .from('providers')
    .update({ is_active: !isBanning, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  return {
    data: { message: isBanning ? 'Utilisateur banni' : 'Utilisateur débanni' },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function listServices(
  supabase: SupabaseClient,
  params: { search: string; includeInactive: boolean }
): Promise<ServiceResponse<{ services: ServiceListItem[] }>> {
  let query = supabase
    .from('services')
    .select('id, name, slug, description, icon, category, is_active, sort_order, created_at')
    .order('name', { ascending: true })

  if (!params.includeInactive) {
    query = query.eq('is_active', true)
  }

  if (params.search) {
    const sanitized = sanitizeSearchQuery(params.search)
    if (sanitized) {
      query = query.ilike('name', `%${sanitized}%`)
    }
  }

  const { data: services, error } = await query

  if (error) {
    // Return empty list on query failure (non-critical)
    return { data: { services: [] }, error: null }
  }

  return { data: { services: (services || []) as ServiceListItem[] }, error: null }
}

export async function getServiceById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ service: ServiceListItem }>> {
  const { data: service, error } = await supabase
    .from('services')
    .select('id, name, slug, description, icon, category, is_active, sort_order, created_at')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: { message: 'Service introuvable', code: error.code, status: 404 } }
  }

  return { data: { service: service as ServiceListItem }, error: null }
}

export async function createService(
  supabase: SupabaseClient,
  serviceData: CreateServiceData
): Promise<ServiceResponse<{ service: Record<string, unknown>; message: string }>> {
  const { data, error } = await supabase
    .from('services')
    .insert({
      name: serviceData.name,
      slug: serviceData.slug,
      description: serviceData.description,
      icon: serviceData.icon,
      parent_id: serviceData.parent_id,
      meta_title: serviceData.meta_title || serviceData.name,
      meta_description: serviceData.meta_description || serviceData.description,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { data: null, error: { message: 'Un service avec ce nom existe déjà', status: 409 } }
    }
    return {
      data: null,
      error: { message: 'Erreur lors de la création du service', code: error.code, status: 500 },
    }
  }

  return { data: { service: data, message: 'Service créé avec succès' }, error: null }
}

export async function updateService(
  supabase: SupabaseClient,
  id: string,
  serviceData: UpdateServiceData
): Promise<ServiceResponse<{ service: Record<string, unknown>; message: string }>> {
  const { data, error } = await supabase
    .from('services')
    .update({ ...serviceData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      data: null,
      error: { message: 'Impossible de mettre à jour le service', code: error.code, status: 500 },
    }
  }

  return { data: { service: data, message: 'Service mis à jour' }, error: null }
}

export async function deleteService(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ message: string }>> {
  const { error } = await supabase.from('services').update({ is_active: false }).eq('id', id)

  if (error) {
    return {
      data: null,
      error: { message: 'Impossible de désactiver le service', code: error.code, status: 500 },
    }
  }

  return { data: { message: 'Service désactivé' }, error: null }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getSettings(
  supabase: SupabaseClient
): Promise<ServiceResponse<{ settings: PlatformSettings }>> {
  const { data: settings, error } = await supabase
    .from('platform_settings')
    .select('id, data, updated_at, updated_by')
    .single()

  if (error || !settings) {
    return { data: { settings: DEFAULT_SETTINGS }, error: null }
  }

  return {
    data: { settings: (settings.data as PlatformSettings) || DEFAULT_SETTINGS },
    error: null,
  }
}

export async function updateSettings(
  supabase: SupabaseClient,
  updates: Partial<PlatformSettings>,
  adminId: string
): Promise<ServiceResponse<{ settings: PlatformSettings }>> {
  let currentSettings: Record<string, unknown> | null = null
  try {
    const { data } = await supabase
      .from('platform_settings')
      .select('id, data, updated_at, updated_by')
      .single()
    currentSettings = data
  } catch {
    // Table may not exist yet
  }

  try {
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .upsert({
        id: (currentSettings?.id as number) || 1,
        data: {
          ...((currentSettings?.data as Record<string, unknown>) || DEFAULT_SETTINGS),
          ...updates,
        },
        updated_at: new Date().toISOString(),
        updated_by: adminId,
      })
      .select()
      .single()

    if (error) {
      return {
        data: null,
        error: {
          message:
            "Erreur lors de la mise à jour des paramètres. La table platform_settings n'existe peut-être pas encore.",
          status: 500,
        },
      }
    }

    return {
      data: { settings: (settings?.data as PlatformSettings) || DEFAULT_SETTINGS },
      error: null,
    }
  } catch {
    return {
      data: null,
      error: {
        message:
          "La table platform_settings n'existe pas encore. Veuillez exécuter la migration correspondante.",
        status: 500,
      },
    }
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function listReviews(
  supabase: SupabaseClient,
  params: ReviewListParams
): Promise<
  ServiceResponse<{ reviews: ReviewListItem[]; total: number; page: number; totalPages: number }>
> {
  const { page, limit, filter } = params
  const offset = (page - 1) * limit

  let query = supabase.from('reviews').select(
    `
      *,
      artisan:providers!provider_id(id, name)
    `,
    { count: 'exact' }
  )

  if (filter === 'pending') {
    query = query.eq('status', 'pending_review')
  } else if (filter === 'flagged') {
    query = query.eq('status', 'flagged')
  } else if (filter === 'approved') {
    query = query.eq('status', 'published')
  } else if (filter === 'rejected') {
    query = query.eq('status', 'hidden')
  }

  const {
    data: reviews,
    count,
    error,
  } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  if (error) {
    return { data: { reviews: [], total: 0, page, totalPages: 0 }, error: null }
  }

  const transformedReviews: ReviewListItem[] = (reviews || []).map(
    (review: Record<string, unknown>) => {
      const artisan = review.artisan as Record<string, unknown> | null
      const status = review.status as string
      return {
        id: review.id as string,
        author_name: (review.author_name as string) || 'Anonyme',
        author_email: (review.author_email as string) || '',
        provider_name: (artisan?.name as string) || 'Inconnu',
        provider_id: review.provider_id as string,
        rating: review.rating as number,
        comment: (review.content as string) || null,
        response: (review.reply as string) || null,
        moderation_status:
          status === 'published' ? 'approved' : status === 'hidden' ? 'rejected' : 'pending',
        is_visible: status === 'published',
        is_flagged: status === 'flagged',
        created_at: review.created_at as string,
      }
    }
  )

  return {
    data: {
      reviews: transformedReviews,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    },
    error: null,
  }
}

export async function moderateReview(
  supabase: SupabaseClient,
  reviewId: string,
  moderationStatus: 'pending' | 'approved' | 'rejected'
): Promise<ServiceResponse<{ data: Record<string, unknown> }>> {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      status: toDbStatus(moderationStatus),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) {
    return {
      data: null,
      error: { message: "Impossible de modérer l'avis", code: error.code, status: 500 },
    }
  }

  return { data: { data }, error: null }
}

// ---------------------------------------------------------------------------
// Admins
// ---------------------------------------------------------------------------

export async function listAdmins(
  supabase: SupabaseClient,
  params: { page: number; limit: number }
): Promise<
  ServiceResponse<{ admins: AdminListItem[]; total: number; totalPages: number; page: number }>
> {
  const { page, limit } = params
  const offset = (page - 1) * limit

  const {
    data: profiles,
    error,
    count,
  } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_admin, created_at', { count: 'exact' })
    .or('is_admin.eq.true,role.in.(super_admin,admin,moderator,viewer)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return { data: { admins: [], total: 0, totalPages: 0, page }, error: null }
  }

  const admins: AdminListItem[] = (profiles || []).map((p) => ({
    id: p.id,
    email: p.email || '',
    full_name: p.full_name || null,
    role: p.role as AdminRole | null,
    is_admin: p.is_admin,
    created_at: p.created_at,
  }))

  return {
    data: {
      admins,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      page,
    },
    error: null,
  }
}

export async function getAdminById(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ admin: AdminListItem }>> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_admin, created_at')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: { message: 'Administrateur non trouvé', status: 404 } }
  }

  return {
    data: {
      admin: {
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name || null,
        role: profile.role as AdminRole | null,
        is_admin: profile.is_admin,
        created_at: profile.created_at,
      },
    },
    error: null,
  }
}

export async function createAdmin(
  supabase: SupabaseClient,
  adminData: CreateAdminData
): Promise<ServiceResponse<{ admin: AdminListItem }>> {
  const { user_id, email, role } = adminData

  let targetUserId = user_id
  if (!targetUserId && email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (profile) {
      targetUserId = profile.id
    } else {
      const tempPassword = crypto.randomUUID()
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: email.split('@')[0] },
      })

      if (authError || !authData.user) {
        return {
          data: null,
          error: {
            message: authError?.message || 'Erreur lors de la création du compte',
            status: 400,
          },
        }
      }

      await supabase.from('profiles').upsert({
        id: authData.user.id,
        email,
        full_name: email.split('@')[0],
        is_admin: true,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      targetUserId = authData.user.id
    }
  }

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({ role, is_admin: true, updated_at: new Date().toISOString() })
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .eq('id', targetUserId!)
    .select('id, email, full_name, role, is_admin, created_at')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        data: null,
        error: { message: 'Aucun utilisateur trouvé avec cet identifiant', status: 404 },
      }
    }
    return {
      data: null,
      error: { message: "Erreur lors de la création de l'administrateur", status: 500 },
    }
  }

  return {
    data: {
      admin: {
        id: updatedProfile.id,
        email: updatedProfile.email || '',
        full_name: updatedProfile.full_name || null,
        role: updatedProfile.role as AdminRole | null,
        is_admin: updatedProfile.is_admin,
        created_at: updatedProfile.created_at,
      },
    },
    error: null,
  }
}

export async function updateAdmin(
  supabase: SupabaseClient,
  id: string,
  adminData: UpdateAdminData
): Promise<ServiceResponse<{ admin: AdminListItem }>> {
  const updateData: Record<string, unknown> = {}
  if (adminData.role !== undefined) updateData.role = adminData.role
  if (adminData.is_admin !== undefined) updateData.is_admin = adminData.is_admin
  updateData.updated_at = new Date().toISOString()

  const { data: updatedAdmin, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select('id, email, full_name, role, is_admin, created_at')
    .single()

  if (error) {
    return { data: null, error: { message: 'Erreur lors de la mise à jour', status: 500 } }
  }

  return {
    data: {
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email || '',
        full_name: updatedAdmin.full_name || null,
        role: updatedAdmin.role as AdminRole | null,
        is_admin: updatedAdmin.is_admin,
        created_at: updatedAdmin.created_at,
      },
    },
    error: null,
  }
}

export async function deleteAdmin(
  supabase: SupabaseClient,
  id: string
): Promise<ServiceResponse<{ success: boolean }>> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: null, is_admin: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression', status: 500 } }
  }

  return { data: { success: true }, error: null }
}
