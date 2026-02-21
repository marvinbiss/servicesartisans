/**
 * GDPR Data Export API - ServicesArtisans
 * Allows users to request and download their personal data
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const exportPostSchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
})

// Lazy initialize to avoid build-time errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST /api/gdpr/export - Request data export
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
    const result = exportPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { format } = result.data

    // Check for existing pending request
    const { data: existingRequest } = await getSupabaseAdmin()
      .from('data_export_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending export request', requestId: existingRequest.id },
        { status: 400 }
      )
    }

    // Create export request
    const { data: exportRequest, error } = await getSupabaseAdmin()
      .from('data_export_requests')
      .insert({
        user_id: user.id,
        format,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // In production, this would be handled by a background job
    // For now, we'll process immediately for small datasets
    const exportData = await collectUserData(user.id)

    // Update request with data
    const { error: updateError } = await getSupabaseAdmin()
      .from('data_export_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        download_url: null, // Would be S3/storage URL in production
      })
      .eq('id', exportRequest.id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      requestId: exportRequest.id,
      data: exportData,
      message: 'Your data export is ready',
    })
  } catch (error) {
    logger.error('GDPR export error:', error)
    return NextResponse.json(
      { error: 'Failed to process export request' },
      { status: 500 }
    )
  }
}

// GET /api/gdpr/export - Get export status or download
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (requestId) {
      // Get specific request
      const { data: exportRequest } = await getSupabaseAdmin()
        .from('data_export_requests')
        .select('*')
        .eq('id', requestId)
        .eq('user_id', user.id)
        .single()

      if (!exportRequest) {
        return NextResponse.json(
          { error: 'Export request not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(exportRequest)
    }

    // Get all requests for user
    const { data: requests } = await getSupabaseAdmin()
      .from('data_export_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ requests: requests || [] })
  } catch (error) {
    logger.error('GDPR export status error:', error)
    return NextResponse.json(
      { error: 'Failed to get export status' },
      { status: 500 }
    )
  }
}

// Collect all user data for export
async function collectUserData(userId: string) {
  // Fetch profile first to get user email (needed for reviews written as client)
  const profileResult = await getSupabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  const userEmail: string | null = profileResult.data?.email ?? null

  const [
    bookingsResult,
    reviewsReceivedResult,
    reviewsWrittenResult,
    messagesResult,
    preferencesResult,
  ] = await Promise.all([
    // Bookings (as client or provider)
    getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .or(`client_id.eq.${userId},provider_id.eq.${userId}`),

    // Reviews received: this user is the artisan (reviews.artisan_id → profiles.id)
    getSupabaseAdmin()
      .from('reviews')
      .select('id, rating, comment, created_at, artisan_id')
      .eq('artisan_id', userId),

    // Reviews written: this user is the client (identified by client_email)
    userEmail
      ? getSupabaseAdmin()
          .from('reviews')
          .select('id, rating, comment, created_at, artisan_id')
          .eq('client_email', userEmail)
      : Promise.resolve({ data: [] }),

    // Messages sent by this user
    getSupabaseAdmin()
      .from('messages')
      .select('*')
      .eq('sender_id', userId),

    // Preferences
    getSupabaseAdmin()
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single(),
  ])

  return {
    exportDate: new Date().toISOString(),
    profile: profileResult.data || null,
    bookings: bookingsResult.data || [],
    reviews_received: reviewsReceivedResult.data || [],
    reviews_written: reviewsWrittenResult.data || [],
    messages: messagesResult.data || [],
    preferences: preferencesResult.data || null,
  }
}
