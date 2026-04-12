/**
 * GDPR Account Deletion API - ServicesArtisans
 * Allows users to request account deletion
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limiter'
import {
  deletePostSchema,
  requestDeletion,
  cancelDeletion,
  getDeletionStatus,
} from '@/lib/services/gdpr-service'

// POST /api/gdpr/delete - Request account deletion
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    // Rate limiting (1 request per 24 hours per user ID)
    const rl = await checkRateLimit(`gdpr-delete:${user.id}`, { window: 86_400_000, max: 1 })
    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              'Vous avez déjà fait une demande de suppression récemment. Veuillez réessayer dans 24 heures.',
          },
        },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) },
        }
      )
    }

    const body = await request.json()
    const result = deletePostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Requête invalide', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { reason, password, confirmText: _confirmText } = result.data

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      email: user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { success: false, error: { message: 'Mot de passe invalide' } },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const deletionResult = await requestDeletion(supabase, adminSupabase, user.id, reason)

    if (deletionResult.error === 'EXISTING_REQUEST') {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Vous avez déjà une demande de suppression en cours' },
        },
        { status: 400 }
      )
    }

    if (deletionResult.error === 'PENDING_BOOKINGS') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              'Vous avez des réservations en cours. Veuillez les annuler ou les terminer avant de supprimer votre compte.',
          },
          pendingBookingsCount: deletionResult.pendingBookingsCount,
        },
        { status: 400 }
      )
    }

    if (deletionResult.error) throw new Error(deletionResult.error)

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      requestId: deletionResult.data!.requestId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      scheduledDate: deletionResult.data!.scheduledDate,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      message: deletionResult.data!.message,
    })
  } catch (error) {
    logger.error('GDPR deletion error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Échec du traitement de la demande de suppression' } },
      { status: 500 }
    )
  }
}

// DELETE /api/gdpr/delete - Cancel deletion request
export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const result = await cancelDeletion(adminSupabase, user.id)

    if (result.error === 'NO_PENDING_REQUEST') {
      return NextResponse.json(
        { success: false, error: { message: 'Aucune demande de suppression en cours trouvée' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Votre demande de suppression a été annulée',
    })
  } catch (error) {
    logger.error('GDPR cancel deletion error:', error)
    return NextResponse.json(
      { success: false, error: { message: "Échec de l'annulation de la demande de suppression" } },
      { status: 500 }
    )
  }
}

// GET /api/gdpr/delete - Get deletion status
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const result = await getDeletionStatus(adminSupabase, user.id)

    return NextResponse.json({
      deletionRequest: result.data || null,
    })
  } catch (error) {
    logger.error('GDPR deletion status error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Échec de la récupération du statut de suppression' } },
      { status: 500 }
    )
  }
}
