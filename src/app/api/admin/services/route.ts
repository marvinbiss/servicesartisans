import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { listServices, createService } from '@/lib/services/admin-crud-service'

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
    const authResult = await requirePermission('services', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const supabase = createAdminClient()
    const serviceResult = await listServices(supabase, { search, includeInactive })

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, ...serviceResult.data })
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
    const authResult = await requirePermission('services', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const result = createServiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }
    const {
      name: rawName,
      description: rawDescription,
      icon,
      parent_id,
      meta_title: rawMetaTitle,
      meta_description: rawMetaDescription,
    } = result.data

    // Strip HTML tags from text fields
    const name = rawName.replace(/<[^>]*>/g, '').trim()
    const description = rawDescription?.replace(/<[^>]*>/g, '').trim()
    const meta_title = rawMetaTitle?.replace(/<[^>]*>/g, '').trim()
    const meta_description = rawMetaDescription?.replace(/<[^>]*>/g, '').trim()

    // Générer le slug
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const supabase = createAdminClient()
    const serviceResult = await createService(supabase, {
      name,
      slug,
      description,
      icon,
      parent_id,
      meta_title,
      meta_description,
    })

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // Log d'audit with actual admin ID
    const serviceId = (serviceResult.data.service as Record<string, unknown>).id as string
    await logAdminAction(authResult.admin.id, 'service.create', 'service', serviceId, {
      name,
      slug,
    })

    return NextResponse.json({
      success: true,
      service: serviceResult.data.service,
      message: serviceResult.data.message,
    })
  } catch (error) {
    logger.error('Admin service create error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
