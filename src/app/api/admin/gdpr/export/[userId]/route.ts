import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Exporter les données d'un utilisateur (RGPD)
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Non autorisé' } },
        { status: 401 }
      )
    }

    const userId = params.userId

    // Récupérer toutes les données de l'utilisateur
    const [
      { data: profile },
      { data: bookings },
      { data: reviews },
      { data: conversations },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('bookings').select('*').or(`artisan_id.eq.${userId},client_email.eq.${userId}`),
      supabase.from('reviews').select('*').eq('client_id', userId),
      supabase.from('conversations').select('*').or(`client_id.eq.${userId},provider_id.eq.${userId}`),
    ])

    const exportData = {
      profile,
      bookings: bookings || [],
      reviews: reviews || [],
      conversations: conversations || [],
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
    }

    // Log d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'gdpr.export',
      entity_type: 'user',
      entity_id: userId,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: exportData,
      message: 'Export RGPD généré',
    })
  } catch (error) {
    console.error('Admin GDPR export error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
