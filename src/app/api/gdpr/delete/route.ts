/**
 * GDPR Account Deletion API - ServicesArtisans
 * Allows users to request account deletion
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const deletePostSchema = z.object({
  reason: z.string().max(500).optional(),
  password: z.string().min(1),
  confirmText: z.literal('SUPPRIMER MON COMPTE'),
})

// Lazy initialize to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/gdpr/delete - Request account deletion
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = deletePostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { reason, password, confirmText: _confirmText } = result.data

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    })

    if (signInError) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Check for existing pending request
    const { data: existingRequest } = await getSupabaseAdmin()
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'scheduled'])
      .single()

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'You already have a pending deletion request',
          scheduledDate: existingRequest.scheduled_deletion_at,
        },
        { status: 400 }
      )
    }

    // Check for pending bookings
    const { data: pendingBookings } = await getSupabaseAdmin()
      .from('bookings')
      .select('id')
      .eq('provider_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .gte('date', new Date().toISOString().split('T')[0])

    if (pendingBookings && pendingBookings.length > 0) {
      return NextResponse.json(
        {
          error: 'You have pending bookings. Please cancel or complete them before deleting your account.',
          pendingBookingsCount: pendingBookings.length,
        },
        { status: 400 }
      )
    }

    // Schedule deletion for 30 days (GDPR grace period)
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + 30)

    const { data: deletionRequest, error } = await getSupabaseAdmin()
      .from('deletion_requests')
      .insert({
        user_id: user.id,
        reason,
        status: 'scheduled',
        scheduled_deletion_at: scheduledDate.toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Send confirmation email (would integrate with email service)
    // await sendDeletionConfirmationEmail(user.email, scheduledDate)

    return NextResponse.json({
      success: true,
      requestId: deletionRequest.id,
      scheduledDate: scheduledDate.toISOString(),
      message: `Your account is scheduled for deletion on ${scheduledDate.toLocaleDateString('fr-FR')}. You can cancel this request before that date.`,
    })
  } catch (error) {
    logger.error('GDPR deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}

// DELETE /api/gdpr/delete - Cancel deletion request
export async function DELETE(_request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Cancel pending deletion request
    const { data: deletionRequest, error } = await getSupabaseAdmin()
      .from('deletion_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .select()
      .single()

    if (error || !deletionRequest) {
      return NextResponse.json(
        { error: 'No pending deletion request found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Your deletion request has been cancelled',
    })
  } catch (error) {
    logger.error('GDPR cancel deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel deletion request' },
      { status: 500 }
    )
  }
}

// GET /api/gdpr/delete - Get deletion status
export async function GET(_request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: deletionRequest } = await getSupabaseAdmin()
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      deletionRequest: deletionRequest || null,
    })
  } catch (error) {
    logger.error('GDPR deletion status error:', error)
    return NextResponse.json(
      { error: 'Failed to get deletion status' },
      { status: 500 }
    )
  }
}
