import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET - Détails d'une réservation
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

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles:artisan_id (
          id,
          full_name,
          email,
          company_name,
          phone
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Admin booking details error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// PATCH - Mettre à jour une réservation
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

    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Réservation mise à jour',
    })
  } catch (error) {
    console.error('Admin booking update error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Annuler une réservation
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

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: 'admin',
        cancellation_reason: 'Annulé par administrateur',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) throw error

    // Log d'audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'booking.cancel',
      entity_type: 'booking',
      entity_id: params.id,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée',
    })
  } catch (error) {
    console.error('Admin booking cancel error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
