/**
 * GDPR Service — Centralized Supabase queries for GDPR operations
 * Framework-agnostic: no NextRequest/NextResponse
 */

import type { SupabaseClientType } from '@/types'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const accessRequestSchema = z.object({
  type: z.enum(['access', 'rectification'], {
    error: 'Le type doit être "access" ou "rectification"',
  }),
  name: z.string().min(2, 'Le nom est requis (min. 2 caractères)').max(200),
  email: z.string().email('Email invalide'),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres')
    .optional(),
  description: z
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
})

export const consentPostSchema = z.object({
  preferences: z.object({
    necessary: z.boolean(),
    functional: z.boolean().optional(),
    analytics: z.boolean(),
    marketing: z.boolean(),
    personalization: z.boolean(),
  }),
  timestamp: z.string().datetime().optional(),
  userAgent: z.string().max(500).optional(),
})

export const deletePostSchema = z.object({
  reason: z.string().max(500).optional(),
  password: z.string().min(1),
  confirmText: z.literal('SUPPRIMER MON COMPTE'),
})

export const exportPostSchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
})

export const adminGdprDeleteSchema = z.object({
  confirmDelete: z.literal('SUPPRIMER'),
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AccessRequestInput = z.infer<typeof accessRequestSchema>
export type ConsentInput = z.infer<typeof consentPostSchema>
export type DeleteRequestInput = z.infer<typeof deletePostSchema>
export type ExportRequestInput = z.infer<typeof exportPostSchema>

export interface ConsentRecord {
  user_id: string | null
  session_id: string
  ip_address: string
  user_agent: string | undefined
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
  consent_given_at: string | undefined
}

export interface UserExportData {
  exportDate: string
  profile: Record<string, unknown> | null
  bookings: Record<string, unknown>[]
  reviews_received: Record<string, unknown>[]
  reviews_written: Record<string, unknown>[]
  messages: Record<string, unknown>[]
  preferences: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Access Request
// ---------------------------------------------------------------------------

/** Submit a GDPR access or rectification request */
export async function createAccessRequest(
  supabase: SupabaseClientType,
  input: AccessRequestInput
): Promise<{ error: string | null }> {
  const { type, name, email, siret, description } = input

  const { error: insertError } = await supabase.from('gdpr_access_requests').insert({
    request_type: type,
    requester_name: name.trim(),
    requester_email: email.trim().toLowerCase(),
    siret: siret || null,
    description: description.trim(),
    status: 'pending',
  })

  if (insertError) {
    return { error: insertError.message }
  }

  return { error: null }
}

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

/** Record cookie consent */
export async function updateConsent(
  supabase: SupabaseClientType,
  record: ConsentRecord
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('cookie_consents').insert({
    user_id: record.user_id,
    session_id: record.session_id,
    ip_address: record.ip_address,
    user_agent: record.user_agent,
    necessary: record.necessary,
    functional: record.functional,
    analytics: record.analytics,
    marketing: record.marketing,
    personalization: record.personalization,
    consent_given_at: record.consent_given_at,
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

/** Get consent history for an authenticated user */
export async function getConsentHistory(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: Record<string, unknown>[]; error: string | null }> {
  const { data: consents, error } = await supabase
    .from('cookie_consents')
    .select(
      'id, user_id, session_id, ip_address, user_agent, necessary, analytics, marketing, personalization, consent_given_at, updated_at'
    )
    .eq('user_id', userId)
    .order('consent_given_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: consents ?? [], error: null }
}

// ---------------------------------------------------------------------------
// Deletion
// ---------------------------------------------------------------------------

/** Request account deletion (schedules for 30 days) */
export async function requestDeletion(
  _supabase: SupabaseClientType,
  adminSupabase: SupabaseClientType,
  userId: string,
  reason: string | undefined
): Promise<{
  data: { requestId: string; scheduledDate: string; message: string } | null
  error: string | null
  pendingBookingsCount?: number
}> {
  // Check for existing pending request
  const { data: existingRequest } = await adminSupabase
    .from('deletion_requests')
    .select('id, user_id, reason, status, scheduled_deletion_at, created_at')
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .single()

  if (existingRequest) {
    return {
      data: null,
      error: 'EXISTING_REQUEST',
    }
  }

  // Check for pending bookings
  const { data: pendingBookings } = await adminSupabase
    .from('bookings')
    .select('id')
    .eq('provider_id', userId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])

  if (pendingBookings && pendingBookings.length > 0) {
    return {
      data: null,
      error: 'PENDING_BOOKINGS',
      pendingBookingsCount: pendingBookings.length,
    }
  }

  // Schedule deletion for 30 days
  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() + 30)

  const { data: deletionRequest, error } = await adminSupabase
    .from('deletion_requests')
    .insert({
      user_id: userId,
      reason,
      status: 'scheduled',
      scheduled_deletion_at: scheduledDate.toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return {
    data: {
      requestId: deletionRequest.id as string,
      scheduledDate: scheduledDate.toISOString(),
      message: `Votre compte est programmé pour suppression le ${scheduledDate.toLocaleDateString('fr-FR')}. Vous pouvez annuler cette demande avant cette date.`,
    },
    error: null,
  }
}

/** Cancel a pending deletion request */
export async function cancelDeletion(
  adminSupabase: SupabaseClientType,
  userId: string
): Promise<{ error: string | null }> {
  const { data: deletionRequest, error } = await adminSupabase
    .from('deletion_requests')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'scheduled')
    .select()
    .single()

  if (error || !deletionRequest) {
    return { error: 'NO_PENDING_REQUEST' }
  }

  return { error: null }
}

/** Get deletion status */
export async function getDeletionStatus(
  adminSupabase: SupabaseClientType,
  userId: string
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const { data: deletionRequest, error } = await adminSupabase
    .from('deletion_requests')
    .select('id, user_id, reason, status, scheduled_deletion_at, cancelled_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return { data: null, error: null } // No request found is not an error
  }

  return { data: deletionRequest, error: null }
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Request data export for authenticated user */
export async function requestExport(
  _supabase: SupabaseClientType,
  adminSupabase: SupabaseClientType,
  userId: string,
  format: 'json' | 'csv'
): Promise<{
  data: { requestId: string; exportData: UserExportData; message: string } | null
  error: string | null
  existingRequestId?: string
}> {
  // Check for existing pending request
  const { data: existingRequest } = await adminSupabase
    .from('data_export_requests')
    .select('id, user_id, format, status, completed_at, created_at')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .single()

  if (existingRequest) {
    return {
      data: null,
      error: 'EXISTING_REQUEST',
      existingRequestId: existingRequest.id as string,
    }
  }

  // Create export request
  const { data: exportRequest, error } = await adminSupabase
    .from('data_export_requests')
    .insert({
      user_id: userId,
      format,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Collect user data
  const exportData = await collectUserData(adminSupabase, userId)

  // Update request as completed
  await adminSupabase
    .from('data_export_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      download_url: null,
    })
    .eq('id', exportRequest.id)

  return {
    data: {
      requestId: exportRequest.id as string,
      exportData,
      message: 'Votre export de données est prêt',
    },
    error: null,
  }
}

/** Get export status or specific request */
export async function getExportStatus(
  adminSupabase: SupabaseClientType,
  userId: string,
  requestId: string | null
): Promise<{
  data: Record<string, unknown> | Record<string, unknown>[] | null
  error: string | null
}> {
  if (requestId) {
    const { data: exportRequest } = await adminSupabase
      .from('data_export_requests')
      .select('id, user_id, format, status, completed_at, created_at')
      .eq('id', requestId)
      .eq('user_id', userId)
      .single()

    if (!exportRequest) {
      return { data: null, error: 'REQUEST_NOT_FOUND' }
    }

    return { data: exportRequest, error: null }
  }

  const { data: requests } = await adminSupabase
    .from('data_export_requests')
    .select('id, user_id, format, status, completed_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: requests ?? [], error: null }
}

/** Collect all user data for export */
async function collectUserData(
  adminSupabase: SupabaseClientType,
  userId: string
): Promise<UserExportData> {
  const profileResult = await adminSupabase
    .from('profiles')
    .select('id, email, full_name, phone_e164, role, subscription_plan, created_at, updated_at')
    .eq('id', userId)
    .single()

  const userEmail: string | null =
    ((profileResult.data as Record<string, unknown> | null)?.email as string | null) ?? null

  const { data: userProvider } = await adminSupabase
    .from('providers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const [
    bookingsResult,
    reviewsReceivedResult,
    reviewsWrittenResult,
    messagesResult,
    preferencesResult,
  ] = await Promise.all([
    adminSupabase
      .from('bookings')
      .select(
        'id, client_id, provider_id, status, scheduled_date, address, city, postal_code, total_amount, payment_status, created_at'
      )
      .or(`client_id.eq.${userId},provider_id.eq.${userId}`),

    userProvider?.id
      ? adminSupabase
          .from('reviews')
          .select('id, rating, content, created_at, provider_id')
          .eq('provider_id', userProvider.id)
      : Promise.resolve({ data: [] }),

    userEmail
      ? adminSupabase
          .from('reviews')
          .select('id, rating, content, created_at, provider_id')
          .eq('author_email', userEmail)
      : Promise.resolve({ data: [] }),

    adminSupabase
      .from('messages')
      .select('id, conversation_id, sender_id, sender_type, content, read_at, created_at')
      .eq('sender_id', userId),

    adminSupabase
      .from('user_preferences')
      .select('id, user_id, created_at')
      .eq('user_id', userId)
      .single(),
  ])

  return {
    exportDate: new Date().toISOString(),
    profile: profileResult.data ?? null,
    bookings: (bookingsResult.data as Record<string, unknown>[]) ?? [],
    reviews_received: (reviewsReceivedResult.data as Record<string, unknown>[]) ?? [],
    reviews_written: (reviewsWrittenResult.data as Record<string, unknown>[]) ?? [],
    messages: (messagesResult.data as Record<string, unknown>[]) ?? [],
    preferences: preferencesResult.data ?? null,
  }
}

// ---------------------------------------------------------------------------
// Admin GDPR operations
// ---------------------------------------------------------------------------

/** Admin: delete/anonymize user data (GDPR) */
export async function adminDeleteUserData(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ completedSteps: string[]; error: string | null }> {
  const completedSteps: string[] = []

  try {
    // Step 1 — Fetch profile email for anonymizing client reviews
    completedSteps.push('fetch_profile')
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .maybeSingle()

    // Step 2 — Check if user is an artisan
    completedSteps.push('check_artisan')
    const { data: artisanRecord } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    // Step 3 — Anonymize profile
    completedSteps.push('anonymize_profile')
    await supabase
      .from('profiles')
      .update({
        email: `deleted_${userId.slice(0, 8)}@anonymized.local`,
        full_name: 'Utilisateur supprimé',
        phone_e164: null,
      })
      .eq('id', userId)

    // Step 4 — Anonymize client reviews
    completedSteps.push('anonymize_client_reviews')
    if ((profileData as Record<string, unknown> | null)?.email) {
      await supabase
        .from('reviews')
        .update({
          author_name: 'Utilisateur supprimé',
          author_email: 'deleted@anonymized.local',
        })
        .eq('author_email', (profileData as Record<string, unknown>).email as string)
    }

    // Step 5 — Anonymize artisan review replies
    completedSteps.push('anonymize_artisan_reviews')
    if (artisanRecord) {
      await supabase
        .from('reviews')
        .update({
          reply: null,
          reply_date: null,
        })
        .eq('provider_id', (artisanRecord as Record<string, unknown>).id as string)
    }

    // Step 6 — Deactivate provider if artisan
    completedSteps.push('deactivate_provider')
    if (artisanRecord) {
      await supabase
        .from('providers')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }

    completedSteps.push('audit_log')
  } catch {
    const failedStep = completedSteps[completedSteps.length - 1] ?? 'unknown'
    return {
      completedSteps,
      error: `Suppression partielle — étape échouée: ${failedStep}`,
    }
  }

  return { completedSteps, error: null }
}

/** Admin: export user data (GDPR) */
export async function adminExportUserData(
  supabase: SupabaseClientType,
  userId: string
): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  const [{ data: profile }, { data: bookings }, { data: userProvider }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, is_admin, role, phone_e164, average_rating, review_count')
      .eq('id', userId)
      .single(),
    supabase
      .from('bookings')
      .select('id, provider_id, client_id, status, scheduled_date, notes, created_at')
      .or(`provider_id.eq.${userId},client_id.eq.${userId}`),
    supabase.from('providers').select('id').eq('user_id', userId).maybeSingle(),
  ])

  const { data: reviews } = userProvider?.id
    ? await supabase
        .from('reviews')
        .select(
          'id, booking_id, provider_id, author_name, author_email, rating, content, status, created_at'
        )
        .eq('provider_id', (userProvider as Record<string, unknown>).id as string)
    : { data: [] }

  const exportData = {
    profile,
    bookings: bookings ?? [],
    reviews: reviews ?? [],
    conversations: null,
    _note: 'Données de conversations non disponibles dans cet export',
    exportedAt: new Date().toISOString(),
  }

  return { data: exportData, error: null }
}
