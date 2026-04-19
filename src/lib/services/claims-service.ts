/**
 * Claims Service — Business logic for provider claims and removal requests
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { slugify } from '@/lib/utils'
import { sendClaimApprovedEmail } from '@/lib/api/resend-client'
import { sendClaimApprovedAuthenticatedEmail } from '@/lib/simulateur/emails'
import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateClaimInput {
  providerId: string
  siret: string
  fullName: string
  email: string
  phone: string
  position: string
}

export interface ListClaimsParams {
  status: 'pending' | 'approved' | 'rejected' | 'all'
  page: number
  limit: number
}

export interface ClaimActionInput {
  claimId: string
  action: 'approve' | 'reject' | 'unclaim'
  rejectionReason?: string
}

export interface CreateRemovalRequestInput {
  providerId: string
  siret: string
  requesterName: string
  requesterEmail: string
  reason?: string
}

export interface ListRemovalRequestsParams {
  status: 'pending' | 'approved' | 'rejected' | 'all'
  page: number
  limit: number
}

export interface RemovalRequestActionInput {
  requestId: string
  action: 'approve' | 'reject'
  adminNotes?: string
}

interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type ServiceResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; status: number; details?: Record<string, unknown> }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const redactEmail = (e: string) =>
  e ? e.substring(0, 2) + '***@' + (e.split('@')[1] || '***') : '***'

async function revalidateProviderPages(
  supabase: SupabaseClient,
  providerId: string
): Promise<void> {
  try {
    const { data: providerInfo } = await supabase
      .from('providers')
      .select('specialty, address_city, slug, stable_id')
      .eq('id', providerId)
      .single()

    if (providerInfo) {
      const serviceSlug = slugify(providerInfo.specialty || 'artisan')
      const locationSlug = slugify(providerInfo.address_city || 'france')
      const publicId = providerInfo.slug || providerInfo.stable_id

      if (publicId) {
        revalidatePath(`/services/${serviceSlug}/${locationSlug}/${publicId}`, 'page')
      }
      revalidatePath(`/services/${serviceSlug}/${locationSlug}`, 'page')
      revalidatePath(`/services/${serviceSlug}`, 'page')
    }
  } catch (revalError) {
    logger.error('Revalidation failed:', revalError)
  }
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

export async function createClaim(
  input: CreateClaimInput,
  userId: string | null
): Promise<ServiceResult<{ message: string }>> {
  const { providerId, siret, fullName, email, phone, position } = input
  const adminClient = createAdminClient()

  // Duplicate checks — different logic for authenticated vs anonymous
  if (userId) {
    // Authenticated: check if user already owns a provider
    const { data: existingProvider } = await adminClient
      .from('providers')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingProvider) {
      return {
        success: false,
        error: 'Vous avez déjà une fiche artisan associée à votre compte',
        status: 409,
      }
    }

    // Check if user already has a pending claim
    const { data: pendingClaims } = await adminClient
      .from('provider_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1)

    if (pendingClaims && pendingClaims.length > 0) {
      return {
        success: false,
        error: 'Vous avez déjà une demande de revendication en cours de validation',
        status: 409,
      }
    }
  } else {
    // Anonymous: check by email if there's already a pending claim
    const { data: emailPendingClaims } = await adminClient
      .from('provider_claims')
      .select('id')
      .eq('claimant_email', email.trim().toLowerCase())
      .eq('status', 'pending')
      .limit(1)

    if (emailPendingClaims && emailPendingClaims.length > 0) {
      return {
        success: false,
        error: 'Une demande de revendication est déjà en cours avec cet email',
        status: 409,
      }
    }
  }

  // Check if this specific provider already has a pending claim from anyone
  const { data: providerPendingClaims } = await adminClient
    .from('provider_claims')
    .select('id')
    .eq('provider_id', providerId)
    .eq('status', 'pending')
    .limit(1)

  if (providerPendingClaims && providerPendingClaims.length > 0) {
    return {
      success: false,
      error: 'Une demande de revendication est déjà en cours pour cette fiche',
      status: 409,
    }
  }

  // Fetch provider
  const { data: provider, error: providerError } = await adminClient
    .from('providers')
    .select('id, name, siret, user_id')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    return { success: false, error: 'Fiche artisan introuvable', status: 404 }
  }

  if (provider.user_id) {
    return {
      success: false,
      error: 'Cette fiche a déjà été revendiquée par un autre utilisateur',
      status: 409,
    }
  }

  if (!provider.siret) {
    return {
      success: false,
      error:
        'Impossible de vérifier cette fiche. Veuillez vérifier votre numéro SIRET ou contacter le support.',
      status: 400,
    }
  }

  // SIREN/SIRET verification (normalize: strip spaces)
  const normalizedInput = siret.replace(/\s/g, '')
  const normalizedStored = provider.siret.replace(/\s/g, '')
  const isSirenInput = normalizedInput.length === 9

  // Match: full SIRET (14 digits) or SIREN (first 9 digits)
  const matches = isSirenInput
    ? normalizedInput === normalizedStored.slice(0, 9)
    : normalizedInput === normalizedStored

  if (!matches) {
    logger.warn('Claim SIREN/SIRET mismatch', {
      userId: userId || 'anonymous',
      claimantEmail: email,
      providerId,
      providerName: provider.name,
      inputSiren: normalizedInput.slice(0, 9),
      storedSiren: normalizedStored.slice(0, 9),
    })

    return {
      success: false,
      error:
        'Impossible de vérifier cette fiche. Veuillez vérifier votre numéro SIREN/SIRET ou contacter le support.',
      status: 403,
    }
  }

  // SIREN/SIRET matches — create a pending claim for admin review
  const { error: insertError } = await adminClient.from('provider_claims').insert({
    provider_id: providerId,
    user_id: userId ?? null,
    siret_provided: isSirenInput ? normalizedStored : normalizedInput,
    claimant_name: fullName,
    claimant_email: email.trim().toLowerCase(),
    claimant_phone: phone,
    claimant_position: position,
    status: 'pending',
  })

  if (insertError) {
    if (insertError.code === '23505') {
      return {
        success: false,
        error: 'Vous avez déjà soumis une demande pour cette fiche',
        status: 409,
      }
    }
    logger.error('Claim insert error', { error: insertError, userId, providerId })
    return {
      success: false,
      error: 'Erreur lors de la soumission de la demande',
      status: 500,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: insertError.message,
          code: insertError.code,
          dbDetails: insertError.details,
        },
      }),
    }
  }

  // Update user profile if authenticated
  if (userId) {
    await adminClient
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  }

  logger.info('Claim submitted', {
    userId: userId || 'anonymous',
    claimantEmail: email,
    providerId,
    providerName: provider.name,
  })

  return {
    success: true,
    data: {
      message:
        'Votre demande de revendication a été soumise. Un administrateur la validera rapidement.',
    },
    message:
      'Votre demande de revendication a été soumise. Un administrateur la validera rapidement.',
  }
}

export async function listClaims(
  supabase: SupabaseClient,
  params: ListClaimsParams
): Promise<ServiceResult<PaginatedResult<Record<string, unknown>>>> {
  const { status, page, limit } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('provider_claims')
    .select(
      `
      id,
      status,
      siret_provided,
      claimant_name,
      claimant_email,
      claimant_phone,
      claimant_position,
      rejection_reason,
      reviewed_at,
      created_at,
      provider_id,
      user_id,
      provider:provider_id(id, name, siret, address_city, stable_id),
      user:user_id(id, email, full_name)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: claims, error, count } = await query

  if (error) {
    return {
      success: false,
      error: 'Erreur lors de la récupération des demandes',
      status: 500,
    }
  }

  return {
    success: true,
    data: {
      data: claims || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    },
  }
}

export async function approveClaim(
  supabase: SupabaseClient,
  claimId: string,
  adminId: string
): Promise<ServiceResult<{ message: string }>> {
  const now = new Date().toISOString()

  // Fetch the claim
  const { data: claim, error: claimError } = await supabase
    .from('provider_claims')
    .select(
      'id, provider_id, user_id, status, claimant_email, claimant_name, claimant_phone, claimant_position'
    )
    .eq('id', claimId)
    .single()

  if (claimError || !claim) {
    return { success: false, error: 'Demande introuvable', status: 404 }
  }

  if (claim.status !== 'pending') {
    return { success: false, error: 'Cette demande a déjà été traitée', status: 409 }
  }

  // Resolve the user ID: either from the claim (authenticated) or create account (anonymous)
  let resolvedUserId = claim.user_id
  let accountCreated = false

  if (!resolvedUserId) {
    const claimEmail = claim.claimant_email?.trim().toLowerCase()
    if (!claimEmail) {
      return {
        success: false,
        error: 'Claim anonyme sans email — impossible de créer le compte',
        status: 400,
      }
    }

    // Check if a user with this email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', claimEmail)
      .single()

    if (existingProfile) {
      resolvedUserId = existingProfile.id
      logger.info('Anonymous claim: reusing existing user from profiles', {
        claimId,
        email: redactEmail(claimEmail),
        userId: resolvedUserId,
      })
    } else {
      // Try to create new account via Supabase admin auth
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: claimEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          full_name: claim.claimant_name || '',
          is_artisan: true,
        },
      })

      if (createUserError || !newUser.user) {
        const { data: linkData } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: claimEmail,
        })

        if (linkData?.user?.id) {
          resolvedUserId = linkData.user.id
          logger.info('Anonymous claim: found existing auth user via recovery', {
            claimId,
            email: redactEmail(claimEmail),
            userId: resolvedUserId,
          })

          const { error: upsertError } = await supabase.from('profiles').upsert(
            {
              id: resolvedUserId,
              email: claimEmail,
              full_name: claim.claimant_name || '',
              role: 'artisan',
              user_type: 'artisan',
              created_at: now,
              updated_at: now,
            },
            { onConflict: 'id' }
          )

          if (upsertError) {
            logger.error('Failed to upsert profile for existing auth user', {
              claimId,
              userId: resolvedUserId,
              error: upsertError,
            })
            return {
              success: false,
              error: `Erreur création profil: ${upsertError.message}`,
              status: 500,
            }
          }
        } else {
          logger.error('Failed to create or resolve user for anonymous claim', {
            claimId,
            email: claimEmail,
            createError: createUserError?.message,
          })
          return {
            success: false,
            error: 'Erreur lors de la création du compte artisan',
            status: 500,
          }
        }
      } else {
        resolvedUserId = newUser.user.id
        accountCreated = true

        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: resolvedUserId,
            email: claimEmail,
            full_name: claim.claimant_name || '',
            role: 'artisan',
            user_type: 'artisan',
            created_at: now,
            updated_at: now,
          },
          { onConflict: 'id' }
        )

        if (profileError) {
          logger.error('Failed to create profile for new user', {
            claimId,
            userId: resolvedUserId,
            error: profileError,
          })
          return {
            success: false,
            error: `Erreur création profil: ${profileError.message}`,
            status: 500,
          }
        }

        logger.info('Anonymous claim: created new user', {
          claimId,
          email: redactEmail(claimEmail),
          userId: resolvedUserId,
        })
      }
    }
  }

  // 1. Assign the provider to the user atomically
  const { data: updatedProvider, error: providerError } = await supabase
    .from('providers')
    .update({
      user_id: resolvedUserId,
      claimed_at: now,
      claimed_by: resolvedUserId,
      updated_at: now,
    })
    .eq('id', claim.provider_id)
    .is('user_id', null)
    .select('id, name')
    .maybeSingle()

  if (providerError) {
    logger.error('Error assigning provider during claim approval', {
      claimId,
      providerId: claim.provider_id,
      error: providerError,
    })
    return {
      success: false,
      error: "Erreur lors de l'attribution de la fiche",
      status: 500,
    }
  }

  if (!updatedProvider) {
    await supabase
      .from('provider_claims')
      .update({
        status: 'rejected',
        rejection_reason: 'Fiche déjà attribuée',
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq('id', claimId)

    return {
      success: false,
      error: 'Cette fiche a déjà été attribuée à un autre utilisateur',
      status: 409,
    }
  }

  // 2. Update the claim status
  const { error: updateClaimError } = await supabase
    .from('provider_claims')
    .update({
      status: 'approved',
      user_id: resolvedUserId,
      reviewed_by: adminId,
      reviewed_at: now,
    })
    .eq('id', claimId)

  if (updateClaimError) {
    return {
      success: false,
      error: 'Erreur lors de la mise à jour de la demande',
      status: 500,
    }
  }

  // 3. Set profiles.role = 'artisan' AND profiles.user_type = 'artisan'
  //    NB: `role` pilote l'auth dashboard/middleware; `user_type` pilote la
  //    RLS publique (migration 379) + filtres admin + MobileBottomNav. Les
  //    deux colonnes doivent rester synchrones pour éviter qu'une fiche
  //    revendiquée devienne invisible côté public ou mal routée côté app.
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', resolvedUserId)
    .single()

  const protectedRoles = ['super_admin', 'admin', 'moderator']
  if (!currentProfile || !protectedRoles.includes(currentProfile.role)) {
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: 'artisan', user_type: 'artisan', updated_at: now })
      .eq('id', resolvedUserId)

    if (roleError) {
      logger.error('Failed to update profile role to artisan', {
        claimId,
        userId: resolvedUserId,
        error: roleError,
      })
      return {
        success: false,
        error: 'Erreur lors de la mise à jour du rôle artisan',
        status: 500,
      }
    }
  } else {
    // Protected role (admin/moderator) — ne touche pas à role mais garantit
    // que user_type reflète la revendication (sinon RLS publique cassée).
    const { error: userTypeError } = await supabase
      .from('profiles')
      .update({ user_type: 'artisan', updated_at: now })
      .eq('id', resolvedUserId)
    if (userTypeError) {
      logger.warn('Failed to align user_type for protected-role user', {
        claimId,
        userId: resolvedUserId,
        error: userTypeError,
      })
    }
  }

  // 4. Mark user as artisan in auth metadata (both flags for consistency)
  await supabase.auth.admin.updateUserById(resolvedUserId, {
    user_metadata: { is_artisan: true, user_type: 'artisan' },
  })

  // 5. For anonymous claims: generate recovery link + send email
  let emailStatus = 'skipped'
  if (!claim.user_id) {
    if (!claim.claimant_email) {
      return {
        success: false,
        error: "Email du demandeur manquant — impossible d'envoyer l'email de configuration",
        status: 400,
      }
    }
    const claimEmail = claim.claimant_email.trim().toLowerCase()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: claimEmail,
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=/definir-mot-de-passe`,
        },
      })

      if (linkError || !linkData?.properties?.hashed_token) {
        emailStatus = `link_error: ${linkError?.message || 'no hashed_token returned'}`
        logger.error('Failed to generate recovery link', { claimId, error: linkError })
      } else {
        const safeLink = `${siteUrl}/auth/setup-password?token=${linkData.properties.hashed_token}`

        const emailResult = await sendClaimApprovedEmail({
          to: claimEmail,
          name: claim.claimant_name || 'Artisan',
          providerName: updatedProvider.name || 'Votre fiche',
          passwordLink: safeLink,
        })

        emailStatus = emailResult?.id ? `sent (id: ${emailResult.id})` : 'sent (no id)'
        logger.info('Claim approval email result', {
          claimId,
          email: redactEmail(claimEmail),
          emailResult,
        })
      }
    } catch (emailErr) {
      emailStatus = `exception: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`
      logger.error('Failed to send claim approval email', { claimId, error: emailErr })
    }
  } else {
    // Authenticated claim (artisan already logged in) — pas de recovery link
    // nécessaire, juste une confirmation email pour qu'il sache que sa fiche
    // est active. Récupère l'email depuis auth.users (source de vérité).
    try {
      const { data: userRes } = await supabase.auth.admin.getUserById(resolvedUserId)
      const authEmail = userRes?.user?.email?.trim().toLowerCase()
      if (authEmail) {
        const emailResult = await sendClaimApprovedAuthenticatedEmail({
          to: authEmail,
          name: claim.claimant_name || 'Artisan',
          providerName: updatedProvider.name || 'Votre fiche',
        })
        emailStatus = emailResult?.id ? `sent (id: ${emailResult.id})` : 'sent (no id)'
        logger.info('Claim approval email (authenticated) sent', {
          claimId,
          email: redactEmail(authEmail),
          emailResult,
        })
      } else {
        emailStatus = 'skipped: no auth email'
        logger.warn('Authenticated claim approval — auth user has no email', {
          claimId,
          userId: resolvedUserId,
        })
      }
    } catch (emailErr) {
      emailStatus = `exception: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`
      logger.error('Failed to send claim approval email (authenticated)', {
        claimId,
        error: emailErr,
      })
    }
  }

  // Revalidation
  await revalidateProviderPages(supabase, claim.provider_id)

  logger.info('Claim approved', {
    claimId,
    providerId: claim.provider_id,
    userId: resolvedUserId,
    adminId,
    accountCreated,
    emailStatus,
  })

  const emailMessage = emailStatus.startsWith('sent')
    ? 'Demande approuvée. La fiche a été attribuée. Email envoyé.'
    : emailStatus === 'skipped'
      ? 'Demande approuvée. La fiche a été attribuée.'
      : "Demande approuvée. La fiche a été attribuée. \u26A0 L'email n'a pas pu être envoyé \u2014 l'artisan devra utiliser \u00AB Mot de passe oublié \u00BB."

  return { success: true, data: { message: emailMessage }, message: emailMessage }
}

export async function rejectClaim(
  supabase: SupabaseClient,
  claimId: string,
  adminId: string,
  rejectionReason?: string
): Promise<ServiceResult<{ message: string }>> {
  const now = new Date().toISOString()

  const { data: claim, error: claimError } = await supabase
    .from('provider_claims')
    .select('id, provider_id, user_id, status')
    .eq('id', claimId)
    .single()

  if (claimError || !claim) {
    return { success: false, error: 'Demande introuvable', status: 404 }
  }

  // Handle unclaim action (approved -> rejected)
  if (claim.status === 'approved') {
    // 1. Remove user_id from provider
    const { error: providerError } = await supabase
      .from('providers')
      .update({
        user_id: null,
        claimed_at: null,
        claimed_by: null,
        updated_at: now,
      })
      .eq('id', claim.provider_id)

    if (providerError) {
      logger.error('Error unclaiming provider', providerError)
      return {
        success: false,
        error: `Erreur dérevendication: ${providerError.message}`,
        status: 500,
      }
    }

    // 2. Reset claim status to rejected with reason
    const { error: claimUpdateError } = await supabase
      .from('provider_claims')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason || 'Dérevendiqué par un administrateur',
        reviewed_by: adminId,
        reviewed_at: now,
      })
      .eq('id', claimId)

    if (claimUpdateError) {
      logger.error('Error updating claim after unclaim', claimUpdateError)
      return { success: false, error: 'Erreur mise à jour de la demande', status: 500 }
    }

    // 3. Reset user role to client if they have no other claimed providers
    if (claim.user_id) {
      const { count } = await supabase
        .from('providers')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', claim.user_id)

      if (!count || count === 0) {
        await supabase
          .from('profiles')
          .update({ role: 'client', updated_at: now })
          .eq('id', claim.user_id)
          .not('role', 'in', '(super_admin,admin,moderator)')
      }
    }

    // 4. Revalidate
    await revalidateProviderPages(supabase, claim.provider_id)

    logger.info('Claim unclaimed', {
      claimId,
      providerId: claim.provider_id,
      userId: claim.user_id,
      adminId,
      reason: rejectionReason || null,
    })

    return {
      success: true,
      data: { message: 'Revendication retirée. La fiche est à nouveau disponible.' },
      message: 'Revendication retirée. La fiche est à nouveau disponible.',
    }
  }

  if (claim.status !== 'pending') {
    return { success: false, error: 'Cette demande a déjà été traitée', status: 409 }
  }

  // Standard reject
  const { error: rejectError } = await supabase
    .from('provider_claims')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason || null,
      reviewed_by: adminId,
      reviewed_at: now,
    })
    .eq('id', claimId)

  if (rejectError) {
    return { success: false, error: 'Erreur lors du rejet', status: 500 }
  }

  logger.info('Claim rejected', {
    claimId,
    providerId: claim.provider_id,
    userId: claim.user_id,
    adminId,
    reason: rejectionReason || null,
  })

  return {
    success: true,
    data: { message: 'Demande rejetée.' },
    message: 'Demande rejetée.',
  }
}

// ---------------------------------------------------------------------------
// Removal Requests
// ---------------------------------------------------------------------------

export async function createRemovalRequest(
  input: CreateRemovalRequestInput
): Promise<ServiceResult<{ message: string }>> {
  const { providerId, siret, requesterName, requesterEmail, reason } = input
  const adminClient = createAdminClient()

  // Check provider exists and has matching SIRET
  const { data: provider, error: providerError } = await adminClient
    .from('providers')
    .select('id, name, siret')
    .eq('id', providerId)
    .single()

  if (providerError || !provider) {
    return { success: false, error: 'Fiche artisan introuvable', status: 404 }
  }

  if (!provider.siret) {
    return {
      success: false,
      error:
        'Impossible de vérifier cette fiche. Contactez support@servicesartisans.fr avec votre extrait Kbis.',
      status: 400,
    }
  }

  // SIRET verification (exact 14-digit match)
  const normalizedInput = siret.replace(/\s/g, '')
  const normalizedStored = provider.siret.replace(/\s/g, '')

  if (normalizedInput !== normalizedStored) {
    logger.warn('Removal request SIRET mismatch', {
      requesterEmail,
      providerId,
      providerName: provider.name,
      inputSiren: normalizedInput.slice(0, 9),
      storedSiren: normalizedStored.slice(0, 9),
    })
    return {
      success: false,
      error:
        'Le SIRET fourni ne correspond pas à cette fiche. Vérifiez votre numéro ou contactez support@servicesartisans.fr.',
      status: 403,
    }
  }

  // Check for existing pending request
  const { data: existingRequests } = await adminClient
    .from('provider_removal_requests')
    .select('id')
    .eq('provider_id', providerId)
    .eq('status', 'pending')
    .limit(1)

  if (existingRequests && existingRequests.length > 0) {
    return {
      success: false,
      error: 'Une demande de suppression est déjà en cours pour cette fiche.',
      status: 409,
    }
  }

  // Create removal request
  const { error: insertError } = await adminClient.from('provider_removal_requests').insert({
    provider_id: providerId,
    requester_name: requesterName.trim(),
    requester_email: requesterEmail.trim().toLowerCase(),
    siret: normalizedInput,
    reason: reason?.trim() || null,
    status: 'pending',
  })

  if (insertError) {
    logger.error('Removal request insert error', { error: insertError, providerId })
    return {
      success: false,
      error: 'Erreur lors de la soumission de la demande',
      status: 500,
    }
  }

  // RGPD good faith: immediately set provider to noindex
  const { error: noindexError } = await adminClient
    .from('providers')
    .update({ noindex: true, updated_at: new Date().toISOString() })
    .eq('id', providerId)

  if (noindexError) {
    logger.error('Failed to set noindex on provider after removal request', {
      error: noindexError,
      providerId,
    })
  }

  logger.info('Removal request submitted (RGPD Art. 21)', {
    requesterEmail: requesterEmail.trim().toLowerCase(),
    providerId,
    providerName: provider.name,
    noindexApplied: !noindexError,
  })

  return {
    success: true,
    data: {
      message:
        "Votre demande de suppression a été enregistrée. La fiche a été immédiatement retirée de l'indexation. Un administrateur traitera votre demande sous 72 heures.",
    },
    message:
      "Votre demande de suppression a été enregistrée. La fiche a été immédiatement retirée de l'indexation. Un administrateur traitera votre demande sous 72 heures.",
  }
}

export async function listRemovalRequests(
  supabase: SupabaseClient,
  params: ListRemovalRequestsParams
): Promise<ServiceResult<PaginatedResult<Record<string, unknown>>>> {
  const { status, page, limit } = params
  const offset = (page - 1) * limit

  let query = supabase
    .from('provider_removal_requests')
    .select(
      `
      id,
      provider_id,
      requester_name,
      requester_email,
      requester_siret,
      reason,
      status,
      admin_notes,
      processed_at,
      processed_by,
      created_at,
      provider:provider_id(id, name, slug, stable_id, specialty, address_city)
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: requests, error, count } = await query

  if (error) {
    logger.error('Error fetching removal requests', { error })
    return {
      success: false,
      error: 'Erreur lors de la recuperation des demandes',
      status: 500,
    }
  }

  return {
    success: true,
    data: {
      data: requests || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    },
  }
}

export async function approveRemovalRequest(
  supabase: SupabaseClient,
  requestId: string,
  adminId: string,
  adminNotes?: string
): Promise<ServiceResult<{ message: string }>> {
  const now = new Date().toISOString()

  const { data: removalRequest, error: fetchError } = await supabase
    .from('provider_removal_requests')
    .select('id, provider_id, status, requester_name, requester_email')
    .eq('id', requestId)
    .single()

  if (fetchError || !removalRequest) {
    return { success: false, error: 'Demande introuvable', status: 404 }
  }

  if (removalRequest.status !== 'pending') {
    return { success: false, error: 'Cette demande a deja ete traitee', status: 409 }
  }

  // 1. Update the request status
  const { error: updateError } = await supabase
    .from('provider_removal_requests')
    .update({
      status: 'approved',
      admin_notes: adminNotes || null,
      processed_at: now,
      processed_by: adminId,
    })
    .eq('id', requestId)

  if (updateError) {
    logger.error('Error approving removal request', { requestId, error: updateError })
    return {
      success: false,
      error: 'Erreur lors de la mise a jour de la demande',
      status: 500,
    }
  }

  // 2. Deactivate and noindex the provider
  const { error: providerError } = await supabase
    .from('providers')
    .update({
      is_active: false,
      noindex: true,
      updated_at: now,
    })
    .eq('id', removalRequest.provider_id)

  if (providerError) {
    logger.error('Error deactivating provider after removal approval', {
      requestId,
      providerId: removalRequest.provider_id,
      error: providerError,
    })
    return {
      success: false,
      error: `Erreur desactivation fiche: ${providerError.message}`,
      status: 500,
    }
  }

  // 3. Revalidate affected pages
  await revalidateProviderPages(supabase, removalRequest.provider_id)

  logger.info('Removal request approved', {
    requestId,
    providerId: removalRequest.provider_id,
    adminId,
    requesterEmail: removalRequest.requester_email,
  })

  return {
    success: true,
    data: { message: 'Demande approuvee. La fiche a ete desactivee et mise en noindex.' },
    message: 'Demande approuvee. La fiche a ete desactivee et mise en noindex.',
  }
}

export async function rejectRemovalRequest(
  supabase: SupabaseClient,
  requestId: string,
  adminId: string,
  adminNotes: string
): Promise<ServiceResult<{ message: string }>> {
  const now = new Date().toISOString()

  const { data: removalRequest, error: fetchError } = await supabase
    .from('provider_removal_requests')
    .select('id, provider_id, status')
    .eq('id', requestId)
    .single()

  if (fetchError || !removalRequest) {
    return { success: false, error: 'Demande introuvable', status: 404 }
  }

  if (removalRequest.status !== 'pending') {
    return { success: false, error: 'Cette demande a deja ete traitee', status: 409 }
  }

  const { error: rejectError } = await supabase
    .from('provider_removal_requests')
    .update({
      status: 'rejected',
      admin_notes: adminNotes,
      processed_at: now,
      processed_by: adminId,
    })
    .eq('id', requestId)

  if (rejectError) {
    logger.error('Error rejecting removal request', { requestId, error: rejectError })
    return { success: false, error: 'Erreur lors du rejet', status: 500 }
  }

  logger.info('Removal request rejected', {
    requestId,
    providerId: removalRequest.provider_id,
    adminId,
    adminNotes,
  })

  return {
    success: true,
    data: { message: 'Demande rejetee.' },
    message: 'Demande rejetee.',
  }
}
