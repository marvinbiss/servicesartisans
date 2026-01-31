/**
 * Search Suggestions API - ServicesArtisans
 * Autocomplete and search suggestions
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') // 'all', 'service', 'artisan', 'location'

    if (query.length < 2) {
      // Return popular searches for empty/short queries
      return NextResponse.json({
        suggestions: popularSearches,
        type: 'popular',
      })
    }

    const suggestions: Array<{ text: string; type: string; id?: string; subtitle?: string }> = []

    // Search services
    if (!type || type === 'all' || type === 'service') {
      const serviceMatches = popularSearches.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase())
      )
      suggestions.push(...serviceMatches)
    }

    // Search artisan names
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

    // Search locations
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

      if (user) {
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
    const { query, filters, resultsCount } = body

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true })
    }

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
