/**
 * API Admin — Cours de marché CEE
 * GET  : liste les cours récents (20 derniers)
 * POST : ajoute un nouveau cours (classique ou précarité)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermission } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { invalidateCeePricesCache } from '@/lib/cee/market-prices'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ---------- GET ----------

export async function GET() {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('cee_market_prices')
      .select('id, price_type, eur_per_mwhc, source, effective_date, created_at, created_by')
      .order('effective_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      logger.error('cee-market-prices GET error', { message: error.message })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors du chargement des cours' } },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (err) {
    logger.error('cee-market-prices GET exception', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur interne' } },
      { status: 500 }
    )
  }
}

// ---------- POST ----------

const createPriceSchema = z.object({
  price_type: z.enum(['classique', 'precarite']),
  eur_per_mwhc: z
    .number()
    .positive('Le montant doit être positif')
    .max(100, 'Le montant semble anormalement élevé (>100 €/MWhc)'),
  source: z.string().max(200).optional(),
  effective_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)')
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const result = createPriceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Données invalides',
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      )
    }

    const { price_type, eur_per_mwhc, source, effective_date } = result.data

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('cee_market_prices')
      .insert({
        price_type,
        eur_per_mwhc,
        source: source || 'admin_manual',
        effective_date: effective_date || new Date().toISOString().slice(0, 10),
        created_by: authResult.admin.id,
      })
      .select('id, price_type, eur_per_mwhc, source, effective_date, created_at')
      .single()

    if (error) {
      logger.error('cee-market-prices POST error', { message: error.message })
      return NextResponse.json(
        { success: false, error: { message: 'Erreur lors de la création' } },
        { status: 500 }
      )
    }

    // Invalider le cache mémoire pour que le prochain appel lise la DB
    invalidateCeePricesCache()

    logger.info('cee-market-prices: nouveau cours ajouté', {
      action: 'cee-market-price-create',
      price_type,
      eur_per_mwhc,
      effective_date: effective_date || 'today',
      admin_id: authResult.admin.id,
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    logger.error('cee-market-prices POST exception', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur interne' } },
      { status: 500 }
    )
  }
}
