/**
 * Saved Searches API - ServicesArtisans
 * Manage user's saved searches
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { logger } from '@/lib/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get user's saved searches
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

    const { data: savedSearches } = await supabaseAdmin
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      savedSearches: savedSearches || [],
    })
  } catch (error) {
    logger.error('Get saved searches error:', error)
    return NextResponse.json(
      { error: 'Failed to get saved searches' },
      { status: 500 }
    )
  }
}

// POST - Save a search
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
    const { name, query, filters, notifyNewResults } = body

    if (!name || !query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      )
    }

    // Check for duplicates
    const { data: existing } = await supabaseAdmin
      .from('saved_searches')
      .select('id')
      .eq('user_id', user.id)
      .eq('query', query)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This search is already saved' },
        { status: 400 }
      )
    }

    // Limit saved searches per user
    const { count } = await supabaseAdmin
      .from('saved_searches')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= 20) {
      return NextResponse.json(
        { error: 'Maximum saved searches limit reached (20)' },
        { status: 400 }
      )
    }

    const { data: savedSearch, error } = await supabaseAdmin
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name,
        query,
        filters: filters || {},
        notify_new_results: notifyNewResults || false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      savedSearch,
    })
  } catch (error) {
    logger.error('Save search error:', error)
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a saved search
export async function DELETE(request: Request) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Search ID required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('saved_searches')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete saved search error:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    )
  }
}
