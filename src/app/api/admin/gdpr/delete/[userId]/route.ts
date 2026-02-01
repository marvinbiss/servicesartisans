import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Supprimer/Anonymiser les données d'un utilisateur (RGPD)
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
    const body = await request.json()
    const { confirmDelete } = body

    if (confirmDelete !== 'SUPPRIMER') {
      return NextResponse.json(
        { success: false, error: { message: 'Confirmation requise' } },
        { status: 400 }
      )
    }

    // Anonymiser le profil
    const anonymizedData = {
      email: `deleted_${userId.slice(0, 8)}@anonymized.local`,
      full_name: 'Utilisateur supprimé',
      phone: null,
      company_name: null,
      siret: null,
      description: null,
      address: null,
      city: null,
      postal_code: null,
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await supabase
      .from('profiles')
      .update(anonymizedData)
      .eq('id', userId)

    // Anonymiser les avis
    await supabase
      .from('reviews')
      .update({
        client_name: 'Utilisateur supprimé',
        client_email: 'deleted@anonymized.local',
      })
      .eq('client_id', userId)

    // Désactiver le provider si c'est un artisan
    await supabase
      .from('providers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    // Log d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'gdpr.delete',
      entity_type: 'user',
      entity_id: userId,
      new_data: { anonymized: true },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Données utilisateur anonymisées conformément au RGPD',
    })
  } catch (error) {
    console.error('Admin GDPR delete error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
