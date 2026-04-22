/**
 * Artisan Lead Funnel API — conversion visibility on dashboard.
 *
 * GET /api/artisan/funnel?days=30
 *
 * Retourne le funnel 30 jours (par défaut) côté artisan.
 * public.lead_assignments.status ∈ {'pending', 'viewed', 'quoted', 'declined'}
 * (migration 103 + contrainte jamais étendue côté public — cf. audit 2026-04).
 *
 *   attribué (pending+viewed+quoted+declined)
 *     → consulté (viewed_at not null)
 *       → devis envoyé (status='quoted', terminal positif)
 *       → refusé (status='declined', terminal négatif)
 *
 * Rates :
 *   - responseRate   : viewed / assigned (signal repris par dispatch 461+462)
 *   - quoteRate      : quoted / viewed
 *   - responseMedianMinutes : temps médian entre assigned_at et viewed_at
 *
 * responseRate alimente `weight_response_rate` du RPC dispatch : plus il est
 * élevé, plus l'artisan reçoit de leads. L'exposer au dashboard rend le signal
 * visible → l'artisan comprend pourquoi il en reçoit plus ou moins.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type FunnelPayload = {
  days: number
  counts: {
    assigned: number
    viewed: number
    quoted: number
    declined: number
    pending: number
  }
  rates: {
    responseRate: number | null // viewed / assigned
    quoteRate: number | null // quoted / viewed
    declineRate: number | null // declined / viewed
  }
  responseMedianMinutes: number | null
  previousPeriod: {
    assigned: number
    responseRate: number | null
  }
}

function medianOf(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 7), 365)

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: providerRows } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    const provider = providerRows?.[0]
    if (!provider) {
      return NextResponse.json(
        { error: 'Profil artisan introuvable ou désactivé' },
        { status: 403 }
      )
    }

    const providerId = provider.id as string
    const currentStart = new Date(Date.now() - days * 86400000).toISOString()
    const previousStart = new Date(Date.now() - 2 * days * 86400000).toISOString()

    const [currentRows, previousRows] = await Promise.all([
      supabase
        .from('lead_assignments')
        .select('status, assigned_at, viewed_at')
        .eq('provider_id', providerId)
        .gte('assigned_at', currentStart),
      supabase
        .from('lead_assignments')
        .select('status, viewed_at')
        .eq('provider_id', providerId)
        .gte('assigned_at', previousStart)
        .lt('assigned_at', currentStart),
    ])

    if (currentRows.error) {
      logger.error('artisan/funnel: current period query failed', currentRows.error)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    const rows = currentRows.data ?? []
    const prevRowsData = previousRows.data ?? []

    const counts = {
      assigned: rows.length,
      viewed: rows.filter((r) => r.viewed_at != null).length,
      quoted: rows.filter((r) => r.status === 'quoted').length,
      declined: rows.filter((r) => r.status === 'declined').length,
      pending: rows.filter((r) => r.status === 'pending').length,
    }

    const responseRate =
      counts.assigned > 0 ? Math.round((counts.viewed / counts.assigned) * 1000) / 10 : null

    const quoteRate =
      counts.viewed > 0 ? Math.round((counts.quoted / counts.viewed) * 1000) / 10 : null

    const declineRate =
      counts.viewed > 0 ? Math.round((counts.declined / counts.viewed) * 1000) / 10 : null

    // Response time median (in minutes) over rows where viewed_at exists
    const responseDurationsMin = rows
      .filter((r) => r.assigned_at && r.viewed_at)
      .map(
        (r) =>
          (new Date(r.viewed_at as string).getTime() -
            new Date(r.assigned_at as string).getTime()) /
          60000
      )
      .filter((n) => n >= 0 && Number.isFinite(n))

    const responseMedianMinutes = medianOf(responseDurationsMin)

    const previousViewed = prevRowsData.filter((r) => r.viewed_at != null).length
    const previousAssigned = prevRowsData.length
    const previousResponseRate =
      previousAssigned > 0 ? Math.round((previousViewed / previousAssigned) * 1000) / 10 : null

    const payload: FunnelPayload = {
      days,
      counts,
      rates: {
        responseRate,
        quoteRate,
        declineRate,
      },
      responseMedianMinutes:
        responseMedianMinutes != null ? Math.round(responseMedianMinutes) : null,
      previousPeriod: {
        assigned: previousAssigned,
        responseRate: previousResponseRate,
      },
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
    })
  } catch (err) {
    logger.error('artisan/funnel GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
