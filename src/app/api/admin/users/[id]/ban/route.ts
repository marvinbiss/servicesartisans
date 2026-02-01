import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Bannir ou débannir un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json()
    const { action, reason } = body // action: 'ban' ou 'unban'

    if (!action || !['ban', 'unban'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { message: "Action invalide. Utilisez 'ban' ou 'unban'" } },
        { status: 400 }
      )
    }

    const isBanning = action === 'ban'

    // Mettre à jour le profil
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_banned: isBanning,
        ban_reason: isBanning ? reason : null,
        banned_at: isBanning ? new Date().toISOString() : null,
        banned_by: isBanning ? user.id : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Si c'est un artisan, désactiver/réactiver également le provider
    if (data?.user_type === 'artisan') {
      await supabase
        .from('providers')
        .update({
          is_active: !isBanning,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', params.id)
    }

    // Enregistrer l'action dans les logs d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: isBanning ? 'user.ban' : 'user.unban',
      entity_type: 'user',
      entity_id: params.id,
      new_data: { is_banned: isBanning, reason },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      user: data,
      message: isBanning ? 'Utilisateur banni' : 'Utilisateur débanni',
    })
  } catch (error) {
    console.error('Admin user ban error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
