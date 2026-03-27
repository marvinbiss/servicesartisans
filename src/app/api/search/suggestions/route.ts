import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeSearchQuery } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const suggestionsQuerySchema = z.object({
  q: z.string().min(1).max(200),
})

/**
 * GET /api/search/suggestions?q=...
 * Retourne des suggestions de recherche (artisans + services)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = { q: searchParams.get('q') || '' }

    const result = suggestionsQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { suggestions: [], recentSearches: [] },
        { status: 200 }
      )
    }

    const sanitized = sanitizeSearchQuery(result.data.q)
    if (!sanitized || sanitized.length < 2) {
      return NextResponse.json(
        { suggestions: [], recentSearches: [] },
        { status: 200 }
      )
    }

    const supabase = createAdminClient()

    // Recherche en parallèle : providers + services
    const [providersResult, servicesResult] = await Promise.all([
      supabase
        .from('providers')
        .select('id, name, slug, specialty, address_city, is_verified')
        .eq('is_active', true)
        .ilike('name', `%${sanitized}%`)
        .order('is_verified', { ascending: false })
        .limit(5),
      supabase
        .from('services')
        .select('id, name, slug, icon, category')
        .eq('is_active', true)
        .ilike('name', `%${sanitized}%`)
        .order('sort_order', { ascending: true })
        .limit(5),
    ])

    const suggestions: Array<{
      type: 'provider' | 'service'
      id: string
      label: string
      slug: string
      subtitle?: string
      icon?: string
      verified?: boolean
    }> = []

    // Ajouter les services en premier (plus pertinent pour la recherche)
    if (servicesResult.data) {
      for (const service of servicesResult.data) {
        suggestions.push({
          type: 'service',
          id: service.id,
          label: service.name,
          slug: service.slug,
          subtitle: service.category || undefined,
          icon: service.icon || undefined,
        })
      }
    }

    // Ajouter les artisans
    if (providersResult.data) {
      for (const provider of providersResult.data) {
        suggestions.push({
          type: 'provider',
          id: provider.id,
          label: provider.name,
          slug: provider.slug,
          subtitle: [provider.specialty, provider.address_city]
            .filter(Boolean)
            .join(' — ') || undefined,
          verified: provider.is_verified || false,
        })
      }
    }

    return NextResponse.json(
      { suggestions, recentSearches: [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    logger.error('Search suggestions API error', error)
    return NextResponse.json(
      { suggestions: [], recentSearches: [] },
      { status: 200 }
    )
  }
}

/**
 * POST /api/search/suggestions
 * Sauvegarde de l'historique de recherche (stub — retourne 200)
 */
export async function POST() {
  return NextResponse.json({ success: true })
}
