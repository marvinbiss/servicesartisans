/**
 * API Admin Provider - CRUD complet
 * GET: Récupérer un provider avec toutes ses relations
 * PATCH: Mise à jour complète
 * DELETE: Hard delete
 *
 * SLA-99.9 : rate-limit + timeout Supabase + audit_logs sur mutation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { isValidUuid } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
import { captureError } from '@/lib/monitoring/sentry'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { z } from 'zod'
import {
  getProviderById,
  updateProvider,
  deleteProvider,
  buildProviderUpdateData,
} from '@/lib/services/admin-crud-service'

const updateProviderSchema = z.object({
  name: z.string().max(200).optional(),
  full_name: z.string().max(200).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .union([z.string().email(), z.literal('')])
    .optional()
    .nullable(),
  siret: z.string().max(20).optional().nullable(),
  specialty: z.string().max(200).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  address_street: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
  address_postal_code: z.string().max(10).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  address_region: z.string().max(100).optional().nullable(),
  is_verified: z.boolean().optional(),
  is_active: z.boolean().optional(),
})

export const dynamic = 'force-dynamic'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
}

// SLA-99.9 : timeout 5s appliqué à toute opération Supabase.
const SUPABASE_TIMEOUT_MS = 5_000

function withSupabaseTimeout<T>(p: PromiseLike<T>): Promise<T> {
  return Promise.race<T>([
    Promise.resolve(p),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('supabase_timeout')), SUPABASE_TIMEOUT_MS)
    ),
  ])
}

// GET - Récupérer un provider complet
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    // SLA-99.9 : rate limit lecture 60/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-providers-get:${ip}`, {
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

    const authResult = await requirePermission('providers', 'read')
    if (!authResult.success || !authResult.admin) return authResult.error

    const providerId = params.id
    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    // SLA-99.9 : Promise.race timeout 5s.
    const serviceResult = await withSupabaseTimeout(getProviderById(supabase, providerId))

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    const response = NextResponse.json({ success: true, ...serviceResult.data })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    return response
  } catch (error) {
    logger.error('admin-providers-get: error', error)
    captureError(error, {
      tags: { route: 'admin/providers/[id]', method: 'GET', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la récupération du profil' } },
      { status: 500 }
    )
  }
}

// PATCH - Mise à jour complète du provider
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const providerId = params.id

  try {
    // SLA-99.9 : rate limit mutation 30/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-providers-patch:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('providers', 'write')
    if (!authResult.success || !authResult.admin) return authResult.error

    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: { message: 'JSON invalide dans le body' } },
        { status: 400 }
      )
    }

    const validationResult = updateProviderSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: validationResult.error.flatten() },
        },
        { status: 400 }
      )
    }

    const updateData = buildProviderUpdateData(body)
    const supabase = createAdminClient()

    // SLA-99.9 : récupère snapshot avant mutation pour audit_logs.old_value (timeout 5s).
    const { data: oldValue } = await withSupabaseTimeout(
      supabase
        .from('providers')
        .select('id, name, email, phone, is_verified, is_active, address_city, address_region')
        .eq('id', providerId)
        .single()
    )

    // SLA-99.9 : Promise.race timeout 5s sur l'update.
    const serviceResult = await withSupabaseTimeout(
      updateProvider(supabase, providerId, updateData)
    )

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur mutation, avec old_value + new_value.
    try {
      await logAdminAction(
        authResult.admin.id,
        'provider.update',
        'provider',
        providerId,
        { ...updateData, updated_at: new Date().toISOString() },
        oldValue ?? {}
      )
    } catch (auditError) {
      logger.warn('admin-providers-patch: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/providers/[id]', method: 'PATCH', audit: 'failed' },
      })
    }

    return NextResponse.json(
      { success: true, data: serviceResult.data.data, message: 'Artisan mis à jour avec succès' },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    logger.error('admin-providers-patch: error', error)
    captureError(error, {
      tags: { route: 'admin/providers/[id]', method: 'PATCH', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur inattendue lors de la mise à jour' } },
      { status: 500 }
    )
  }
}

// DELETE - Hard delete (suppression définitive)
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const providerId = params.id

  try {
    // SLA-99.9 : rate limit destructif 30/min/IP fail-open.
    const ip = getClientIp(request.headers)
    const rl = await checkRateLimit(`admin-providers-delete:${ip}`, {
      window: 60_000,
      max: 30,
      failOpen: true,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: { message: 'Trop de requêtes' } },
        { status: 429 }
      )
    }

    const authResult = await requirePermission('providers', 'delete')
    if (!authResult.success || !authResult.admin) return authResult.error

    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // SLA-99.9 : snapshot pré-delete pour audit_logs.old_value.
    const { data: oldValue } = await withSupabaseTimeout(
      supabase
        .from('providers')
        .select('id, name, slug, email, phone, siret, address_city, address_region, is_active')
        .eq('id', providerId)
        .single()
    )

    // SLA-99.9 : Promise.race timeout 5s. Note : deleteProvider effectue plusieurs
    // suppressions séquentielles (claims, reviews, lead_assignments, bookings, provider).
    // Le timeout couvre l'opération complète — si dépassement, on bascule en 500.
    const serviceResult = await withSupabaseTimeout(deleteProvider(supabase, providerId))

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    // SLA-99.9 : audit_logs OBLIGATOIRE sur DELETE.
    try {
      await logAdminAction(
        authResult.admin.id,
        'provider.hard_delete',
        'provider',
        providerId,
        {},
        oldValue ?? {}
      )
    } catch (auditError) {
      logger.warn('admin-providers-delete: audit log failed', { error: String(auditError) })
      captureError(auditError, {
        tags: { route: 'admin/providers/[id]', method: 'DELETE', audit: 'failed' },
      })
    }

    return NextResponse.json({ success: true, message: serviceResult.data.message })
  } catch (error) {
    logger.error('admin-providers-delete: error', error)
    captureError(error, {
      tags: { route: 'admin/providers/[id]', method: 'DELETE', critical: 'true' },
    })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la suppression' } },
      { status: 500 }
    )
  }
}
