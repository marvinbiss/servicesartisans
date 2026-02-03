/**
 * Dispute Resolution API
 * Handle disputes between clients and artisans
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { disputeResolutionService } from '@/lib/services/dispute-resolution'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const openDisputeSchema = z.object({
  booking_id: z.string().uuid(),
  category: z.enum([
    'quality_of_work',
    'incomplete_work',
    'pricing_issue',
    'no_show',
    'communication',
    'damage',
    'delay',
    'refund_request',
    'other',
  ]),
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  amount_disputed: z.number().min(0).optional(),
  evidence_urls: z.array(z.string().url()).optional(),
  client_desired_outcome: z.string().min(10).max(1000),
})

const respondSchema = z.object({
  dispute_id: z.string().uuid(),
  response: z.string().min(10).max(5000),
  counter_proposal: z.object({
    refund_amount: z.number().min(0).optional(),
    action_proposed: z.string().optional(),
  }).optional(),
})

const messageSchema = z.object({
  dispute_id: z.string().uuid(),
  message: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional(),
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
    const disputeId = searchParams.get('id')
    const role = searchParams.get('role') as 'client' | 'artisan' | null
    const status = searchParams.get('status')

    // Get specific dispute
    if (disputeId) {
      const dispute = await disputeResolutionService.getDispute(disputeId, user.id)
      if (!dispute) {
        return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 })
      }
      return NextResponse.json({ success: true, ...dispute })
    }

    // Get user's disputes
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    const userRole = role || (profile?.user_type === 'artisan' ? 'artisan' : 'client')
    const disputes = await disputeResolutionService.getUserDisputes(
      user.id,
      userRole as 'client' | 'artisan',
      status as any
    )

    return NextResponse.json({ success: true, disputes })
  } catch (error) {
    logger.error('Disputes GET error:', error)
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
      case 'open': {
        const result = openDisputeSchema.safeParse(body)
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

        const dispute = await disputeResolutionService.openDispute({
          ...result.data,
          client_id: user.id,
          artisan_id: booking.artisan_id,
        })

        return NextResponse.json({
          success: true,
          dispute,
          message: 'Litige ouvert avec succès',
        })
      }

      case 'respond': {
        const result = respondSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        const dispute = await disputeResolutionService.submitArtisanResponse(
          result.data.dispute_id,
          user.id,
          result.data.response,
          result.data.counter_proposal
        )

        return NextResponse.json({
          success: true,
          dispute,
          message: 'Réponse envoyée',
        })
      }

      case 'accept_proposal': {
        const { dispute_id } = body
        if (!dispute_id) {
          return NextResponse.json({ error: 'ID de litige requis' }, { status: 400 })
        }

        const dispute = await disputeResolutionService.acceptProposal(dispute_id, user.id)

        return NextResponse.json({
          success: true,
          dispute,
          message: 'Proposition acceptée',
        })
      }

      case 'request_mediation': {
        const { dispute_id } = body
        if (!dispute_id) {
          return NextResponse.json({ error: 'ID de litige requis' }, { status: 400 })
        }

        const dispute = await disputeResolutionService.requestMediation(dispute_id, user.id)

        return NextResponse.json({
          success: true,
          dispute,
          message: 'Médiation demandée',
        })
      }

      case 'add_message': {
        const result = messageSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Données invalides', details: result.error.flatten() },
            { status: 400 }
          )
        }

        // Determine sender type
        const disputeData = await disputeResolutionService.getDispute(result.data.dispute_id, user.id)
        if (!disputeData) {
          return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 })
        }

        let senderType: 'client' | 'artisan' | 'mediator' = 'client'
        if (disputeData.dispute.artisan_id === user.id) senderType = 'artisan'
        if (disputeData.dispute.mediator_id === user.id) senderType = 'mediator'

        const message = await disputeResolutionService.addMessage(
          result.data.dispute_id,
          user.id,
          senderType,
          result.data.message,
          result.data.attachments
        )

        return NextResponse.json({
          success: true,
          message,
        })
      }

      case 'withdraw': {
        const { dispute_id } = body
        if (!dispute_id) {
          return NextResponse.json({ error: 'ID de litige requis' }, { status: 400 })
        }

        // TODO: Implement withdraw functionality
        return NextResponse.json({
          success: true,
          message: 'Litige retiré',
        })
      }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Disputes POST error:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
