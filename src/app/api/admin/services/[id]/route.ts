import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isValidUuid } from '@/lib/sanitize'
import { z } from 'zod'
import { getServiceById, updateService, deleteService } from '@/lib/services/admin-crud-service'

// SLA-99.9 : timeout dur Supabase 5s
const SUPABASE_TIMEOUT_MS = 5_000

// PATCH request schema
const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  meta_title: z.string().max(100).optional(),
  meta_description: z.string().max(200).optional(),
  is_active: z.boolean().optional(),
  slug: z.string().max(100).optional(),
})

export const dynamic = 'force-dynamic'

// GET - Détails d'un service
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // SLA-99.9 : rate-limit lecture 60/min/IP
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-services-detail:${ip}`, {
      window: 60_000,
      max: 60,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('services', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    // SLA-99.9 : timeout 5s
    const serviceResult = await Promise.race([
      getServiceById(supabase, params.id),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, ...serviceResult.data })
  } catch (error) {
    logger.error('admin-services-detail: error', error)
    captureError(error, {
      tags: { route: 'admin/services/[id]', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un service
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // SLA-99.9 : rate-limit mutation 20/min — tolerance basse
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-services-update:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('services', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = updateServiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    // Strip HTML tags from text fields before storing
    const sanitizedData = { ...result.data }
    const textFields = ['name', 'description', 'meta_title', 'meta_description'] as const
    for (const field of textFields) {
      if (typeof sanitizedData[field] === 'string') {
        sanitizedData[field] = (sanitizedData[field] as string).replace(/<[^>]*>/g, '').trim()
      }
    }

    const supabase = createAdminClient()
    // SLA-99.9 : timeout 5s sur la mutation
    const serviceResult = await Promise.race([
      updateService(supabase, params.id, sanitizedData),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE
    await logAdminAction(authResult.admin.id, 'service.update', 'service', params.id, result.data)

    return NextResponse.json({
      success: true,
      service: serviceResult.data.service,
      message: serviceResult.data.message,
    })
  } catch (error) {
    logger.error('admin-services-update: error', error)
    captureError(error, {
      tags: { route: 'admin/services/[id]', method: 'PATCH', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer/désactiver un service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // SLA-99.9 : rate-limit destructif 20/min — anti-mass-delete
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-services-delete:${ip}`, {
      window: 60_000,
      max: 20,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('services', 'delete')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    if (!isValidUuid(params.id)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    // SLA-99.9 : audit_logs AVANT suppression — capture intent même si DELETE échoue
    await logAdminAction(authResult.admin.id, 'service.delete', 'service', params.id)

    const supabase = createAdminClient()
    // SLA-99.9 : timeout 5s
    const serviceResult = await Promise.race([
      deleteService(supabase, params.id),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
      ),
    ])

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json({ success: true, message: serviceResult.data.message })
  } catch (error) {
    logger.error('admin-services-delete: error', error)
    captureError(error, {
      tags: { route: 'admin/services/[id]', method: 'DELETE', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
