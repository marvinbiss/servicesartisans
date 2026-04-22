/**
 * Artisan Trends API — 30-day daily series for dashboard sparklines.
 *
 * GET /api/artisan/trends?days=30
 *
 * Retourne pour l'artisan connecté les séries journalières (UTC) sur la fenêtre :
 *   - profileViews   : analytics_events.event_type = 'artisan_profile_view'
 *   - phoneReveals   : analytics_events.event_type = 'phone_reveal'
 *   - phoneClicks    : analytics_events.event_type = 'phone_click'
 *   - demandesRecues : lead_assignments (count par assigned_at)
 *
 * Chaque série : { day: 'YYYY-MM-DD', count: number }[] de `days` points,
 * y compris les jours à 0 pour que le sparkline conserve un X axis régulier.
 *
 * Le but est de rendre visible la tendance (croissance, pattern hebdo, pic/creux)
 * au-delà du "current + %change" des stats cards — un artisan qui comprend sa
 * courbe adapte son comportement (horaires, relances).
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type DayPoint = { day: string; count: number }

type TrendsPayload = {
  days: number
  series: {
    profileViews: DayPoint[]
    phoneReveals: DayPoint[]
    phoneClicks: DayPoint[]
    demandesRecues: DayPoint[]
  }
  totals: {
    profileViews: number
    phoneReveals: number
    phoneClicks: number
    demandesRecues: number
  }
}

function toDayKey(iso: string): string {
  // YYYY-MM-DD in UTC — stable, no TZ drift
  return iso.slice(0, 10)
}

function buildDayAxis(days: number): string[] {
  const out: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function bucketRows(
  rows: { created_at?: string | null; assigned_at?: string | null }[]
): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows) {
    const iso = r.created_at ?? r.assigned_at
    if (!iso) continue
    const key = toDayKey(iso)
    m.set(key, (m.get(key) ?? 0) + 1)
  }
  return m
}

function fillSeries(axis: string[], bucket: Map<string, number>): DayPoint[] {
  return axis.map((day) => ({ day, count: bucket.get(day) ?? 0 }))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30', 10) || 30, 7), 90)

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
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const axis = buildDayAxis(days)

    const admin = createAdminClient()

    // ─── Parallel : 3 analytics event types + lead_assignments ─────────────
    const [viewsRes, revealsRes, clicksRes, leadsRes] = await Promise.all([
      admin
        .from('analytics_events')
        .select('created_at')
        .eq('provider_id', providerId)
        .eq('event_type', 'artisan_profile_view')
        .gte('created_at', since),
      admin
        .from('analytics_events')
        .select('created_at')
        .eq('provider_id', providerId)
        .eq('event_type', 'phone_reveal')
        .gte('created_at', since),
      admin
        .from('analytics_events')
        .select('created_at')
        .eq('provider_id', providerId)
        .eq('event_type', 'phone_click')
        .gte('created_at', since),
      supabase
        .from('lead_assignments')
        .select('assigned_at')
        .eq('provider_id', providerId)
        .gte('assigned_at', since),
    ])

    if (viewsRes.error)
      logger.warn('trends: profile_view query failed', { error: viewsRes.error.message })
    if (revealsRes.error)
      logger.warn('trends: phone_reveal query failed', { error: revealsRes.error.message })
    if (clicksRes.error)
      logger.warn('trends: phone_click query failed', { error: clicksRes.error.message })
    if (leadsRes.error)
      logger.warn('trends: lead_assignments query failed', { error: leadsRes.error.message })

    const views = fillSeries(axis, bucketRows(viewsRes.data ?? []))
    const reveals = fillSeries(axis, bucketRows(revealsRes.data ?? []))
    const clicks = fillSeries(axis, bucketRows(clicksRes.data ?? []))
    const leads = fillSeries(axis, bucketRows(leadsRes.data ?? []))

    const sum = (s: DayPoint[]): number => s.reduce((acc, p) => acc + p.count, 0)

    const payload: TrendsPayload = {
      days,
      series: {
        profileViews: views,
        phoneReveals: reveals,
        phoneClicks: clicks,
        demandesRecues: leads,
      },
      totals: {
        profileViews: sum(views),
        phoneReveals: sum(reveals),
        phoneClicks: sum(clicks),
        demandesRecues: sum(leads),
      },
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
    })
  } catch (err) {
    logger.error('artisan/trends GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
