/**
 * User Preferences API - ServicesArtisans
 * Manages user notification and display preferences
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PUT request schema
const preferencesSchema = z.object({
  preferences: z.record(z.string(), z.unknown()),
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/user/preferences - Get user preferences
export const dynamic = 'force-dynamic'

export async function GET() {
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

    const { data: preferences } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      userId: user.id,
      preferences: preferences?.preferences || null,
    })
  } catch (error) {
    logger.error('Get preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(request: Request) {
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
    const result = preferencesSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { preferences } = result.data

    // Upsert preferences
    const { error } = await supabaseAdmin
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Update preferences error:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
