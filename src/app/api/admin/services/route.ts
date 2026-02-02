import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const createServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  meta_title: z.string().max(100).optional(),
  meta_description: z.string().max(200).optional(),
})

export const dynamic = 'force-dynamic'

// GET - Liste des services
export async function GET(request: NextRequest) {
  try {
    // Verify admin with services:read permission
    const authResult = await requirePermission('services', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: services, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      services: services || [],
    })
  } catch (error) {
    logger.error('Admin services list error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// POST - Créer un service
export async function POST(request: NextRequest) {
  try {
    // Verify admin with services:write permission
    const authResult = await requirePermission('services', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const result = createServiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }
    const { name, description, icon, parent_id, meta_title, meta_description } = result.data

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const { data, error } = await supabase
      .from('services')
      .insert({
        name,
        slug,
        description,
        icon,
        parent_id,
        meta_title: meta_title || name,
        meta_description: meta_description || description,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Log d'audit with actual admin ID
    await logAdminAction(
      authResult.admin.id,
      'service.create',
      'service',
      data.id,
      { name, slug }
    )

    return NextResponse.json({
      success: true,
      service: data,
      message: 'Service créé avec succès',
    })
  } catch (error) {
    logger.error('Admin service create error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
