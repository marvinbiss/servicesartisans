import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Détails d'un utilisateur
export async function GET(
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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: { message: 'Utilisateur non trouvé' } },
          { status: 404 }
        )
      }
      throw error
    }

    // Récupérer les stats associées si c'est un artisan
    let providerData = null
    if (profile.user_type === 'artisan') {
      const { data: provider } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', params.id)
        .single()
      providerData = provider
    }

    // Récupérer le nombre de réservations
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .or(`artisan_id.eq.${params.id},client_email.eq.${profile.email}`)

    // Récupérer le nombre d'avis
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', params.id)

    return NextResponse.json({
      success: true,
      user: {
        ...profile,
        provider: providerData,
        stats: {
          bookings: bookingsCount || 0,
          reviews: reviewsCount || 0,
        },
      },
    })
  } catch (error) {
    console.error('Admin user details error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour un utilisateur
export async function PATCH(
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

    // Champs autorisés à modifier
    const allowedFields = [
      'full_name',
      'phone',
      'user_type',
      'company_name',
      'siret',
      'description',
      'address',
      'city',
      'postal_code',
      'is_verified',
      'subscription_plan',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      user: data,
      message: 'Utilisateur mis à jour',
    })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur (soft delete)
export async function DELETE(
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

    // Soft delete: marquer comme supprimé plutôt que supprimer réellement
    const { error } = await supabase
      .from('profiles')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) throw error

    // Désactiver également le provider si c'est un artisan
    await supabase
      .from('providers')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', params.id)

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé',
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
