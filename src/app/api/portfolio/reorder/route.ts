/**
 * Portfolio Reorder API
 * PUT: Update display_order for multiple portfolio items
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { reorderPortfolioItems } from '@/lib/services/portfolio-service'

const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        display_order: z.number().int().min(0),
      })
    )
    .min(1)
    .max(100),
})

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Verify user is an artisan
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'artisan') {
      return NextResponse.json({ error: 'Accès réservé aux artisans' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = reorderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const result = await reorderPortfolioItems(supabase, user.id, validation.data.items)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      message: result.data.message,
    })
  } catch (error) {
    logger.error('Portfolio reorder error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
