/**
 * Artisan Devis (Quotes) API
 * POST: Send a quote to a client
 * GET: Get quotes sent by the artisan
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const createDevisSchema = z.object({
  devis_request_id: z.string().uuid(),
  amount: z.number().positive().max(1000000),
  description: z.string().max(2000).optional(),
  validity_days: z.number().int().min(1).max(365).optional().default(30),
  items: z.array(z.object({
    description: z.string().max(500),
    quantity: z.number().positive(),
    unit_price: z.number().positive(),
  })).optional(),
})

// PUT request schema
const updateDevisSchema = z.object({
  devis_id: z.string().uuid(),
  status: z.enum(['sent', 'accepted', 'refused', 'completed', 'cancelled']),
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Fetch devis sent by this artisan
    const { data: devis, error: devisError } = await supabase
      .from('devis')
      .select(`
        *,
        request:devis_requests(id, service_name, client_name, client_email, client_phone, city, postal_code, description)
      `)
      .eq('artisan_id', user.id)
      .order('created_at', { ascending: false })

    if (devisError) {
      logger.error('Error fetching devis:', devisError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ devis: devis || [] })
  } catch (error) {
    logger.error('Artisan devis GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Check subscription limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single()

    const planLimits: Record<string, number> = {
      gratuit: 5,
      pro: 30,
      premium: 9999,
    }

    const currentPlan = profile?.subscription_plan || 'gratuit'
    const limit = planLimits[currentPlan] || 5

    // Check current month devis count
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: devisCount } = await supabase
      .from('devis')
      .select('*', { count: 'exact', head: true })
      .eq('artisan_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    if ((devisCount || 0) >= limit) {
      return NextResponse.json(
        { error: 'Limite de devis mensuelle atteinte. Passez à un plan supérieur.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = createDevisSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { devis_request_id, amount, description, validity_days, items } = result.data

    // Verify the devis_request exists
    const { data: devisRequest } = await supabase
      .from('devis_requests')
      .select('id, client_id, client_email, client_name, service_name')
      .eq('id', devis_request_id)
      .single()

    if (!devisRequest) {
      return NextResponse.json(
        { error: 'Demande de devis non trouvée' },
        { status: 404 }
      )
    }

    // Calculate validity date
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + validity_days)

    // Create the devis
    const { data: devis, error: insertError } = await supabase
      .from('devis')
      .insert({
        artisan_id: user.id,
        devis_request_id,
        amount: Math.round(amount * 100), // Store in cents
        description: description || null,
        items: items || null,
        valid_until: validUntil.toISOString(),
        status: 'sent',
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error inserting devis:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du devis' },
        { status: 500 }
      )
    }

    // Update the devis_request status
    await supabase
      .from('devis_requests')
      .update({ status: 'sent' })
      .eq('id', devis_request_id)

    // Create a message to notify the client
    if (devisRequest.client_id) {
      await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: devisRequest.client_id,
          content: `Bonjour ${devisRequest.client_name}, je vous envoie mon devis pour ${devisRequest.service_name}. Montant: ${amount}EUR. ${description || ''}`,
          devis_request_id,
          is_read: false,
        })
    }

    return NextResponse.json({
      success: true,
      devis,
      message: 'Devis envoyé avec succès',
    })
  } catch (error) {
    logger.error('Artisan devis POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = updateDevisSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { devis_id, status } = result.data

    // Verify the devis belongs to this artisan
    const { data: existingDevis } = await supabase
      .from('devis')
      .select('artisan_id, devis_request_id')
      .eq('id', devis_id)
      .single()

    if (!existingDevis || existingDevis.artisan_id !== user.id) {
      return NextResponse.json(
        { error: 'Devis non trouvé ou non autorisé' },
        { status: 403 }
      )
    }

    // Update the devis status
    const { error: updateError } = await supabase
      .from('devis')
      .update({ status })
      .eq('id', devis_id)

    if (updateError) {
      logger.error('Error updating devis:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du devis' },
        { status: 500 }
      )
    }

    // If the status changes, update the request status too
    if (status === 'accepted' || status === 'refused' || status === 'completed') {
      await supabase
        .from('devis_requests')
        .update({ status })
        .eq('id', existingDevis.devis_request_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Devis mis à jour',
    })
  } catch (error) {
    logger.error('Artisan devis PUT error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
