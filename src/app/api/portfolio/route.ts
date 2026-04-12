/**
 * Portfolio API
 * GET: List portfolio items for authenticated artisan
 * POST: Create new portfolio item
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { listPortfolioItems, createPortfolioItem } from '@/lib/services/portfolio-service'

const createPortfolioSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(100),
  description: z.string().max(500).optional().nullable(),
  image_url: z.string().url("URL de l'image invalide"),
  thumbnail_url: z.string().url().optional().nullable(),
  video_url: z.string().url().optional().nullable(),
  before_image_url: z.string().url().optional().nullable(),
  after_image_url: z.string().url().optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(30)).max(10).optional().nullable(),
  media_type: z.enum(['image', 'video', 'before_after']).default('image'),
  is_featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
})

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const mediaType = searchParams.get('media_type')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await listPortfolioItems(supabase, {
      artisanId: user.id,
      mediaType,
      category,
      limit,
      offset,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    logger.error('Portfolio GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const validation = createPortfolioSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Validate media_type specific fields
    if (data.media_type === 'video' && !data.video_url) {
      return NextResponse.json(
        { error: "L'URL de la vidéo est requise pour les éléments vidéo" },
        { status: 400 }
      )
    }

    if (data.media_type === 'before_after' && (!data.before_image_url || !data.after_image_url)) {
      return NextResponse.json(
        { error: 'Les images avant et après sont requises' },
        { status: 400 }
      )
    }

    const result = await createPortfolioItem(supabase, user.id, data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      item: result.data,
      message: 'Élément ajouté au portfolio',
    })
  } catch (error) {
    logger.error('Portfolio POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
