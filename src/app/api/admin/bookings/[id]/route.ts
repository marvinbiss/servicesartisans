import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// PATCH request schema
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().max(1000).optional(),
  client_name: z.string().max(100).optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().max(20).optional(),
  service_description: z.string().max(500).optional(),
})

export const dynamic = 'force-dynamic'

// GET - Détails d'une réservation
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()

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
    logger.error('Admin booking details error', error)
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
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const result = updateBookingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { message: 'Validation error', details: result.error.flatten() } },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...result.data,
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
    logger.error('Admin booking update error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}

// DELETE - Annuler une réservation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = createAdminClient()
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
    await logAdminAction(authResult.admin.id, 'booking.cancel', 'booking', params.id)

    return NextResponse.json({
      success: true,
      message: 'Réservation annulée',
    })
  } catch (error) {
    logger.error('Admin booking cancel error', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
