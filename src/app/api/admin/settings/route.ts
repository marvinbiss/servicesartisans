import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Default settings
const DEFAULT_SETTINGS = {
  siteName: 'Services Artisans',
  contactEmail: 'contact@servicesartisans.fr',
  supportEmail: 'support@servicesartisans.fr',
  maintenanceMode: false,
  registrationEnabled: true,
  emailNotifications: true,
  smsNotifications: false,
  maxQuotesPerDay: 10,
  requireEmailVerification: true,
  requirePhoneVerification: false,
  commissionRate: 10,
  minBookingNotice: 24, // hours
  maxBookingAdvance: 90, // days
}

export async function GET() {
  try {
    // Verify admin with settings:read permission
    const authResult = await requirePermission('settings', 'read')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

    // Fetch settings from database
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    if (error || !settings) {
      // Return default settings if none exist
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

    return NextResponse.json({ settings: settings.data || DEFAULT_SETTINGS })
  } catch (error) {
    logger.error('Settings fetch error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin with settings:write permission
    const authResult = await requirePermission('settings', 'write')
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const updates = await request.json()

    // Fetch current settings for audit
    const { data: currentSettings } = await supabase
      .from('platform_settings')
      .select('*')
      .single()

    // Upsert settings
    const { data: settings, error } = await supabase
      .from('platform_settings')
      .upsert({
        id: currentSettings?.id || 1,
        data: {
          ...(currentSettings?.data || DEFAULT_SETTINGS),
          ...updates,
        },
        updated_at: new Date().toISOString(),
        updated_by: authResult.admin.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Settings update error', error)
      return NextResponse.json({ error: 'Erreur lors de la mise à jour des paramètres' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'settings_updated', 'settings', '1', updates)

    return NextResponse.json({ settings: settings?.data })
  } catch (error) {
    logger.error('Settings update error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
