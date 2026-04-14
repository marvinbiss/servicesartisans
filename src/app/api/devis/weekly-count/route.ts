import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/devis/weekly-count
 *
 * Retourne le nombre de demandes de devis créées dans les 7 derniers jours.
 * Paramètres query optionnels :
 *   - specialty : slug du service (ex: "plombier")
 *   - city : slug de la ville (ex: "paris", "aix-en-provence")
 *
 * Utilisé par le badge social proof sur les fiches artisan.
 * Fail-safe : retourne { count: 0 } en cas d'erreur DB.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const specialty = searchParams.get('specialty')
    const city = searchParams.get('city')

    const supabase = createAdminClient()

    // Date il y a 7 jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const since = sevenDaysAgo.toISOString()

    // Construction de la requête
    // On filtre par service via un join sur services.slug
    // et par ville via ILIKE sur devis_requests.city
    let query = supabase
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since)

    // Filtrer par specialty (slug du service)
    if (specialty) {
      // Récupérer le service_id correspondant au slug
      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('slug', specialty)
        .single()

      if (service) {
        query = query.eq('service_id', service.id)
      } else {
        // Slug inconnu → aucun devis ne matche
        return NextResponse.json({ count: 0 }, { headers: cacheHeaders() })
      }
    }

    // Filtrer par ville (slug → nom approximatif via ILIKE)
    if (city) {
      // Convertir le slug en pattern : "aix-en-provence" → "%aix%en%provence%"
      const cityPattern = `%${city.replace(/-/g, '%')}%`
      query = query.ilike('city', cityPattern)
    }

    const { count, error } = await query

    if (error) {
      logger.error('weekly-count: Supabase query failed', { error: error.message, specialty, city })
      return NextResponse.json({ count: 0 }, { headers: cacheHeaders() })
    }

    return NextResponse.json({ count: count ?? 0 }, { headers: cacheHeaders() })
  } catch (err) {
    logger.error('weekly-count: Unexpected error', { error: String(err) })
    return NextResponse.json({ count: 0 }, { headers: cacheHeaders() })
  }
}

function cacheHeaders(): HeadersInit {
  return {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  }
}
