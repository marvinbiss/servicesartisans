/**
 * Artisan RGE Status API — exposes RGE qualifications + expiry for dashboard.
 *
 * GET /api/artisan/rge
 *
 * Retourne pour l'artisan connecté :
 *   - qualifications[] : code, domaine, organisme, expiry date (from rge_qualifications JSONB)
 *   - rgeValidUntil    : date la plus proche d'expiration (providers.rge_valid_until)
 *   - daysUntilExpiry  : jours avant expiration (négatif si déjà expiré)
 *   - status           : 'none' | 'expired' | 'expiring_soon' (<30j) | 'active'
 *   - lastSyncedAt     : providers.rge_last_synced_at (rassure l'artisan)
 *
 * Critique : si RGE expire, l'artisan sort de toutes les pages /rge/* (cliff
 * revenue). Le dashboard doit alerter ≥ 30 jours avant.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

type RgeQualification = {
  code?: string | null
  domaine?: string | null
  organisme?: string | null
  sous_domaine?: string | null
  date_debut?: string | null
  date_fin?: string | null
}

type RgeStatus = 'none' | 'expired' | 'expiring_soon' | 'active'

type RgePayload = {
  hasRge: boolean
  status: RgeStatus
  rgeValidUntil: string | null
  daysUntilExpiry: number | null
  qualifications: RgeQualification[]
  lastSyncedAt: string | null
  sourceUrl: string | null
}

const EXPIRING_SOON_DAYS = 30

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: providerRows, error: providerErr } = await supabase
      .from('providers')
      .select(
        'rge_qualifications, rge_valid_until, rge_last_synced_at, rge_source_url, rge_organismes'
      )
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)

    if (providerErr) {
      logger.error('artisan/rge provider query failed', providerErr)
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
    }

    const provider = providerRows?.[0]
    if (!provider) {
      return NextResponse.json(
        { error: 'Profil artisan introuvable ou désactivé' },
        { status: 403 }
      )
    }

    const rawQualifications = Array.isArray(provider.rge_qualifications)
      ? (provider.rge_qualifications as RgeQualification[])
      : []

    const validUntilStr = provider.rge_valid_until as string | null
    const validUntilDate = validUntilStr ? new Date(validUntilStr) : null
    const daysUntilExpiry = validUntilDate
      ? Math.ceil((validUntilDate.getTime() - Date.now()) / 86400000)
      : null

    let status: RgeStatus = 'none'
    if (rawQualifications.length === 0) {
      status = 'none'
    } else if (daysUntilExpiry == null) {
      status = 'active' // qualifications présentes mais pas de date d'expiration agrégée (edge case sync)
    } else if (daysUntilExpiry < 0) {
      status = 'expired'
    } else if (daysUntilExpiry <= EXPIRING_SOON_DAYS) {
      status = 'expiring_soon'
    } else {
      status = 'active'
    }

    const payload: RgePayload = {
      hasRge: rawQualifications.length > 0,
      status,
      rgeValidUntil: validUntilStr,
      daysUntilExpiry,
      qualifications: rawQualifications,
      lastSyncedAt: (provider.rge_last_synced_at as string | null) ?? null,
      sourceUrl: (provider.rge_source_url as string | null) ?? null,
    }

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
    })
  } catch (err) {
    logger.error('artisan/rge GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
