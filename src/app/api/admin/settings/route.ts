import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { getSettings, updateSettings } from '@/lib/services/admin-crud-service'

// PATCH request schema
const updateSettingsSchema = z.object({
  siteName: z.string().max(100).optional(),
  contactEmail: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  maxQuotesPerDay: z.number().int().min(1).max(100).optional(),
  requireEmailVerification: z.boolean().optional(),
  requirePhoneVerification: z.boolean().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  minBookingNotice: z.number().int().min(0).max(168).optional(),
  maxBookingAdvance: z.number().int().min(1).max(365).optional(),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const serviceResult = await getSettings(supabase)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    return NextResponse.json(serviceResult.data)
  } catch (error) {
    logger.error('Settings fetch error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const body = await request.json()
    const result = updateSettingsSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Erreur de validation', details: result.error.flatten() },
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const serviceResult = await updateSettings(supabase, result.data, authResult.admin.id)

    if (serviceResult.error) {
      return NextResponse.json(
        { success: false, error: { message: serviceResult.error.message } },
        { status: serviceResult.error.status }
      )
    }

    await logAdminAction(authResult.admin.id, 'settings_updated', 'settings', '1', result.data)

    return NextResponse.json(serviceResult.data)
  } catch (error) {
    logger.error('Settings update error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
