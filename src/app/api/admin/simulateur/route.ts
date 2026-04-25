/**
 * Admin API — Simulateur aides rénovation
 * Liste paginée + filtres des estimations du simulateur
 * Voir docs/simulateur-architecture.md §7 (traçabilité)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categorie: z.enum(['bleu', 'jaune', 'violet', 'rose']).optional(),
  parcours: z.enum(['geste', 'accompagne']).optional(),
  zone: z.enum(['H1', 'H2', 'H3']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  consent: z.enum(['all', 'true', 'false']).default('all'),
  search: z.string().optional(),
  sortBy: z.enum(['created_at', 'mpr_total', 'reste_a_charge_bas']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export async function GET(request: NextRequest) {
  const auth = await requirePermission('simulateur', 'read')
  if (!auth.success || !auth.admin) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams))
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { page, limit, categorie, parcours, zone, from, to, consent, search, sortBy, sortOrder } =
      parsed.data

    const supabase = createAdminClient()
    let query = supabase.from('simulateur_estimations').select(
      `id, public_id, created_at, categorie_anah, parcours, zone_climatique, code_postal,
       surface_m2, rfr, mpr_total, cee_fourchette_bas, cee_fourchette_haut,
       coup_pouce_estimation, reste_a_charge_bas, reste_a_charge_haut,
       pipedrive_deal_id, consent_rgpd, consent_demarchage, barometre_version`,
      { count: 'exact' }
    )

    if (categorie) query = query.eq('categorie_anah', categorie)
    if (parcours) query = query.eq('parcours', parcours)
    if (zone) query = query.eq('zone_climatique', zone)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)
    if (consent === 'true') query = query.eq('consent_rgpd', true)
    if (consent === 'false') query = query.eq('consent_rgpd', false)
    if (search) query = query.ilike('public_id', `%${search}%`)

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const start = (page - 1) * limit
    query = query.range(start, start + limit - 1)

    const { data, error, count } = await query
    if (error) {
      logger.error('Admin simulateur list error', error as unknown as Error)
      return NextResponse.json(
        { success: false, error: 'Erreur lecture estimations' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    return NextResponse.json({
      success: true,
      data: data ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    logger.error('Admin simulateur list exception', error as Error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
