/**
 * Admin Priority Pages API — ServicesArtisans
 * GET  : Liste toutes les pages prioritaires avec leur statut
 * POST : Import de pages depuis un export Search Console (CSV/JSON)
 * PUT  : Marquer une page comme enrichie (enhanced)
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import {
  isEligibleForPriority,
  invalidatePriorityCache,
  PRIORITY_POSITION_MIN,
  PRIORITY_POSITION_MAX,
  PRIORITY_IMPRESSIONS_MIN,
} from '@/lib/seo/priority-pages'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// GET — Lister les pages prioritaires
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const enhanced = searchParams.get('enhanced') // 'true' | 'false' | null (all)
    const sortBy = searchParams.get('sortBy') || 'position'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    const supabase = createAdminClient()
    let query = supabase
      .from('seo_priority_pages')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })

    if (enhanced === 'true') query = query.eq('enhanced', true)
    if (enhanced === 'false') query = query.eq('enhanced', false)

    const { data, error } = await query

    if (error) throw error

    // Stats résumé
    const total = (data || []).length
    const enhancedCount = (data || []).filter(p => p.enhanced).length
    const avgPosition = total > 0
      ? Math.round(((data || []).reduce((sum, p) => sum + p.position, 0) / total) * 10) / 10
      : 0

    return NextResponse.json({
      success: true,
      data: data || [],
      stats: {
        total,
        enhanced: enhancedCount,
        pending: total - enhancedCount,
        avgPosition,
      },
    })
  } catch (error) {
    logger.error('Priority pages GET error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// POST — Import depuis Search Console (JSON array)
// ---------------------------------------------------------------------------

interface GscRow {
  /** URL complète ou path relatif */
  page?: string
  /** Position moyenne */
  position?: number
  /** Nombre d'impressions */
  impressions?: number
  /** Nombre de clics */
  clicks?: number
  /** Requête principale */
  query?: string
}

export async function POST(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const rows: GscRow[] = Array.isArray(body) ? body : body.rows || body.data || []

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucune donnée à importer. Envoyez un tableau JSON.' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    let imported = 0
    let skipped = 0
    let updated = 0
    const errors: Array<{ row: number; reason: string }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      // Extraire le path depuis l'URL complète ou le path relatif
      let path = row.page || ''
      if (path.startsWith('http')) {
        try {
          path = new URL(path).pathname
        } catch {
          errors.push({ row: i, reason: `URL invalide: ${row.page}` })
          continue
        }
      }

      // Normaliser : toujours commencer par /
      if (!path.startsWith('/')) path = '/' + path
      // Retirer le trailing slash (sauf pour la racine)
      if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)

      const position = typeof row.position === 'number' ? row.position : parseFloat(String(row.position || '0'))
      const impressions = typeof row.impressions === 'number' ? row.impressions : parseInt(String(row.impressions || '0'), 10)
      const clicks = typeof row.clicks === 'number' ? row.clicks : parseInt(String(row.clicks || '0'), 10)
      const query = row.query || ''

      // Vérifier l'éligibilité
      if (!isEligibleForPriority(position, impressions)) {
        skipped++
        continue
      }

      // Upsert (conflit sur path + query)
      const { error: upsertError, data: upsertData } = await supabase
        .from('seo_priority_pages')
        .upsert(
          {
            path,
            position: Math.round(position * 10) / 10,
            impressions,
            clicks,
            query,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'path,query' }
        )
        .select('id')

      if (upsertError) {
        errors.push({ row: i, reason: upsertError.message })
        continue
      }

      if (upsertData && upsertData.length > 0) {
        imported++
      } else {
        updated++
      }
    }

    // Invalider le cache après import
    invalidatePriorityCache()

    logger.info('Priority pages import completed', {
      imported,
      updated,
      skipped,
      errors: errors.length,
      adminId: authResult.admin.id,
    })

    return NextResponse.json({
      success: true,
      stats: {
        imported,
        updated,
        skipped,
        errors: errors.length,
        thresholds: {
          positionRange: `${PRIORITY_POSITION_MIN}-${PRIORITY_POSITION_MAX}`,
          minImpressions: PRIORITY_IMPRESSIONS_MIN,
        },
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    logger.error('Priority pages POST error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// PUT — Marquer une page comme enrichie
// ---------------------------------------------------------------------------

export async function PUT(request: Request) {
  try {
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const { path, enhanced } = body as { path?: string; enhanced?: boolean }

    if (!path) {
      return NextResponse.json(
        { success: false, error: { message: 'Le champ "path" est requis' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const isEnhanced = enhanced !== false // Par défaut, marquer comme enhanced

    const { data, error } = await supabase
      .from('seo_priority_pages')
      .update({
        enhanced: isEnhanced,
        enhanced_at: isEnhanced ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('path', path)
      .select('*')

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: `Page non trouvée: ${path}` } },
        { status: 404 }
      )
    }

    // Invalider le cache après update
    invalidatePriorityCache()

    logger.info('Priority page marked as enhanced', {
      path,
      enhanced: isEnhanced,
      adminId: authResult.admin.id,
    })

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error) {
    logger.error('Priority pages PUT error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
