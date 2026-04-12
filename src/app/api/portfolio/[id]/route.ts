/**
 * Portfolio Item API
 * GET: Get single portfolio item
 * PUT: Update portfolio item
 * DELETE: Delete portfolio item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation/uuid'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  getPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '@/lib/services/portfolio-service'

const updatePortfolioSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  video_url: z.string().url().optional().nullable(),
  before_image_url: z.string().url().optional().nullable(),
  after_image_url: z.string().url().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional().nullable(),
  media_type: z.enum(['image', 'video', 'before_after']).optional(),
  is_featured: z.boolean().optional(),
  is_visible: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
})

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    const result = await getPortfolioItem(supabase, id, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ item: result.data })
  } catch (error) {
    logger.error('Portfolio item GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updatePortfolioSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const result = await updatePortfolioItem(supabase, id, user.id, validation.data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      item: result.data,
      message: 'Élément mis à jour',
    })
  } catch (error) {
    logger.error('Portfolio item PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })
    }

    const result = await deletePortfolioItem(supabase, id, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      message: result.data.message,
    })
  } catch (error) {
    logger.error('Portfolio item DELETE error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
