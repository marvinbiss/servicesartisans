/**
 * Escrow API
 * Secure payment holding for large transactions
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { escrowService } from '@/lib/services/escrow-service'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const createEscrowSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.number().min(500), // Minimum 500€
  description: z.string().min(10).max(500),
  milestones: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    amount: z.number().min(1),
    due_date: z.string().optional(),
  })).optional(),
})

const fundEscrowSchema = z.object({
  escrow_id: z.string().uuid(),
  payment_method_id: z.string().min(1),
})

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const escrowId = searchParams.get('id')
    const role = searchParams.get('role') as 'client' | 'artisan' | null

    // Get specific escrow
    if (escrowId) {
      const escrow = await escrowService.getEscrow(escrowId, user.id)
      if (!escrow) {
        return NextResponse.json({ error: 'Escrow non trouvé' }, { status: 404 })
      }
      return NextResponse.json({ success: true, ...escrow })
    }

    // Get user's escrows
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const userRole = role || (profile?.user_type === 'artisan' ? 'artisan' : 'client')
    const escrows = await escrowService.getUserEscrows(user.id, userRole as 'client' | 'artisan')

    return NextResponse.json({ success: true, escrows })
  } catch (error) {
    logger.error('Escrow GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const result = createEscrowSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        // Get artisan ID from booking
        const { data: booking } = await supabase
          .from('bookings')
          .select('artisan_id')
          .eq('id', result.data.booking_id)
          .single()

        if (!booking) {
          return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
        }

        const escrow = await escrowService.createEscrow({
          ...result.data,
          client_id: user.id,
          artisan_id: booking.artisan_id,
        })

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Escrow créé. Procédez au paiement pour activer la protection.',
        })
      }

      case 'fund': {
        const result = fundEscrowSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const escrow = await escrowService.fundEscrow(
          result.data.escrow_id,
          result.data.payment_method_id,
          user.id
        )

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Escrow financé. Les fonds sont sécurisés.',
        })
      }

      case 'work_started': {
        const { escrow_id } = body
        if (!escrow_id) {
          return NextResponse.json({ error: 'ID escrow requis' }, { status: 400 })
        }

        const escrow = await escrowService.markWorkStarted(escrow_id, user.id)

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Travaux marqués comme commencés',
        })
      }

      case 'work_completed': {
        const { escrow_id, completion_notes } = body
        if (!escrow_id) {
          return NextResponse.json({ error: 'ID escrow requis' }, { status: 400 })
        }

        const escrow = await escrowService.markWorkCompleted(escrow_id, user.id, completion_notes)

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Travaux marqués comme terminés. Le client a 3 jours pour inspecter.',
        })
      }

      case 'release': {
        const { escrow_id } = body
        if (!escrow_id) {
          return NextResponse.json({ error: 'ID escrow requis' }, { status: 400 })
        }

        const escrow = await escrowService.releaseFunds(escrow_id, user.id)

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Fonds libérés vers l\'artisan',
        })
      }

      case 'dispute': {
        const { escrow_id, reason } = body
        if (!escrow_id || !reason) {
          return NextResponse.json({ error: 'ID escrow et raison requis' }, { status: 400 })
        }

        const escrow = await escrowService.disputeEscrow(escrow_id, user.id, reason)

        return NextResponse.json({
          success: true,
          escrow,
          message: 'Litige ouvert. Un médiateur va examiner le cas.',
        })
      }

      case 'complete_milestone': {
        const { milestone_id } = body
        if (!milestone_id) {
          return NextResponse.json({ error: 'ID étape requis' }, { status: 400 })
        }

        const milestone = await escrowService.completeMilestone(milestone_id, user.id)

        return NextResponse.json({
          success: true,
          milestone,
          message: 'Étape marquée comme terminée',
        })
      }

      case 'approve_milestone': {
        const { milestone_id } = body
        if (!milestone_id) {
          return NextResponse.json({ error: 'ID étape requis' }, { status: 400 })
        }

        const milestone = await escrowService.approveMilestone(milestone_id, user.id)

        return NextResponse.json({
          success: true,
          milestone,
          message: 'Étape approuvée. Paiement libéré.',
        })
      }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Escrow POST error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
