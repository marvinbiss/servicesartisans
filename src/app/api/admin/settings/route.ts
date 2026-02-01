import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check admin access
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      // Return default settings if user is not admin but is authenticated
      return NextResponse.json({ settings: DEFAULT_SETTINGS })
    }

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
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check admin write access
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('user_id', user.id)
      .single()

    if (!adminUser || (adminUser.permissions && !adminUser.permissions?.settings?.write)) {
      return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 })
    }

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
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Settings update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'settings_updated',
      entity_type: 'settings',
      entity_id: '1',
      old_data: currentSettings?.data,
      new_data: updates,
    })

    return NextResponse.json({ settings: settings?.data })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
