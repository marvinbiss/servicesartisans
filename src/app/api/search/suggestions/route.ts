/**
 * Search Suggestions API - ServicesArtisans
 * Autocomplete and search suggestions
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { sanitizeSearchQuery, sanitizeUserInput } from '@/lib/sanitize'
import { z } from 'zod'

// GET query params schema
const suggestionsQuerySchema = z.object({
  q: z.string().max(200).optional().default(''),
  type: z.enum(['all', 'service', 'artisan', 'location']).optional().nullable(),
})

// POST request schema
const saveSearchSchema = z.object({
  query: z.string().min(2).max(200),
  filters: z.record(z.string(), z.unknown()).optional(),
  resultsCount: z.number().int().min(0).optional(),
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Popular searches for fallback
const popularSearches = [
  { text: 'Plombier', type: 'service' },
  { text: 'Electricien', type: 'service' },
  { text: 'Serrurier', type: 'service' },
  { text: 'Peintre', type: 'service' },
  { text: 'Menuisier', type: 'service' },
  { text: 'Carreleur', type: 'service' },
  { text: 'Maçon', type: 'service' },
  { text: 'Chauffagiste', type: 'service' },
]

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      q: searchParams.get('q') || '',
      type: searchParams.get('type'),
    }
    const result = suggestionsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const rawQuery = result.data.q
    const type = result.data.type

    if (rawQuery.length < 2) {
      // Return popular searches for empty/short queries
      return NextResponse.json({
        suggestions: popularSearches,
        type: 'popular',
      })
    }

    // Sanitize the search query to prevent injection
    const query = sanitizeSearchQuery(rawQuery)
    if (!query) {
      return NextResponse.json({
        suggestions: popularSearches,
        type: 'popular',
      })
    }

    const suggestions: Array<{ text: string; type: string; id?: string; subtitle?: string }> = []

    // Search services (local array, safe)
    if (!type || type === 'all' || type === 'service') {
      const serviceMatches = popularSearches.filter((s) =>
        s.text.toLowerCase().includes(rawQuery.toLowerCase())
      )
      suggestions.push(...serviceMatches)
    }

    // Search artisan names (sanitized query)
    if (!type || type === 'all' || type === 'artisan') {
      const { data: artisans } = await supabaseAdmin
        .from('profiles')
        .select('id, business_name, city, specialty')
        .eq('is_artisan', true)
        .eq('is_active', true)
        .or(`business_name.ilike.%${query}%,specialty.ilike.%${query}%`)
        .limit(5)

      artisans?.forEach((artisan) => {
        suggestions.push({
          text: artisan.business_name || artisan.specialty,
          type: 'artisan',
          id: artisan.id,
          subtitle: `${artisan.specialty} - ${artisan.city}`,
        })
      })
    }

    // Search locations (sanitized query)
    if (!type || type === 'all' || type === 'location') {
      const { data: locations } = await supabaseAdmin
        .from('profiles')
        .select('city')
        .eq('is_artisan', true)
        .eq('is_active', true)
        .ilike('city', `%${query}%`)
        .limit(5)

      const uniqueCities = Array.from(new Set(locations?.map((l) => l.city).filter(Boolean)))
      uniqueCities.forEach((city) => {
        if (!suggestions.find((s) => s.text === city)) {
          suggestions.push({
            text: city!,
            type: 'location',
          })
        }
      })
    }

    // Get user's recent searches if authenticated
    let recentSearches: string[] = []
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

      if (user && query) {
        const { data: history } = await supabaseAdmin
          .from('search_history')
          .select('query')
          .eq('user_id', user.id)
          .ilike('query', `%${query}%`)
          .order('searched_at', { ascending: false })
          .limit(3)

        recentSearches = history?.map((h) => h.query) || []
      }
    } catch {
      // User not authenticated, skip recent searches
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10),
      recentSearches,
      type: 'search',
    })
  } catch (error) {
    logger.error('Search suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    )
  }
}

// POST - Save search to history
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
      return NextResponse.json({ success: true }) // Silent fail for non-auth users
    }

    const body = await request.json()
    const result = saveSearchSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: true }) // Silent fail for invalid data
    }
    const { query: rawQuery, filters, resultsCount } = result.data

    // Sanitize input before saving
    const query = sanitizeUserInput(rawQuery).slice(0, 200)

    // Save to search history
    await supabaseAdmin.from('search_history').insert({
      user_id: user.id,
      query,
      filters: filters || {},
      results_count: resultsCount || 0,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Save search error:', error)
    return NextResponse.json({ success: true }) // Silent fail
  }
}
