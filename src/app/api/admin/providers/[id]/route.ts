/**
 * API Admin Provider - CRUD complet
 * GET: Récupérer un provider avec toutes ses relations
 * PATCH: Mise à jour complète
 * DELETE: Hard delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { isValidUuid } from '@/lib/sanitize'
import { logger } from '@/lib/logger'
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

// GET - Récupérer un provider complet
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    const serviceResult = await getProviderById(supabase, providerId)

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
    logger.error('Admin provider GET error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la récupération du profil' } },
      { status: 500 }
    )
  }
}

// PATCH - Mise à jour complète du provider
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const providerId = params.id

  try {
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
    const serviceResult = await updateProvider(supabase, providerId, updateData)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    try {
      await logAdminAction(
        authResult.admin.id,
        'provider.update',
        'provider',
        providerId,
        updateData
      )
    } catch {
      logger.warn('Audit log failed')
    }

    return NextResponse.json(
      { success: true, data: serviceResult.data.data, message: 'Artisan mis à jour avec succès' },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error) {
    const err = error as Error
    logger.error('Unexpected PATCH error', { message: err.message })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur inattendue lors de la mise à jour' } },
      { status: 500 }
    )
  }
}

// DELETE - Hard delete (suppression définitive)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const providerId = params.id

  try {
    const authResult = await requirePermission('providers', 'delete')
    if (!authResult.success || !authResult.admin) return authResult.error

    if (!isValidUuid(providerId)) {
      return NextResponse.json(
        { success: false, error: { message: 'Identifiant invalide' } },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const serviceResult = await deleteProvider(supabase, providerId)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    try {
      await logAdminAction(authResult.admin.id, 'provider.hard_delete', 'provider', providerId)
    } catch {
      logger.warn('Audit log failed')
    }

    return NextResponse.json({ success: true, message: serviceResult.data.message })
  } catch (error) {
    const err = error as Error
    logger.error('Unexpected DELETE error', { message: err.message })
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de la suppression' } },
      { status: 500 }
    )
  }
}
