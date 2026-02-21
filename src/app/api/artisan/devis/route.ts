/**
 * Artisan Devis (Quotes) API
 * GET: Get quotes sent by the artisan (from `quotes` table)
 * POST: Send a quote to a client for a given devis_request
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createQuoteSchema = z.object({
  request_id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).max(5000),
  valid_until: z.string().datetime().optional().nullable(),
})

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get provider linked to this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 })
    }

    // Fetch quotes sent by this provider
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select(`
        id,
        request_id,
        provider_id,
        amount,
        description,
        valid_until,
        status,
        created_at,
        request:devis_requests!request_id(id, service_name, city, postal_code, description, status, created_at)
      `)
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })

    if (quotesError) {
      logger.error('Error fetching quotes:', quotesError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ devis: quotes || [] })
  } catch (error) {
    logger.error('Artisan devis GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get provider linked to this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const result = createQuoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { request_id, amount, description, valid_until } = result.data

    // Verify the devis_request exists
    const { data: devisRequest } = await supabase
      .from('devis_requests')
      .select('id, status')
      .eq('id', request_id)
      .single()

    if (!devisRequest) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    // Insert quote
    const { data: quote, error: insertError } = await supabase
      .from('quotes')
      .insert({
        request_id,
        provider_id: provider.id,
        amount,
        description,
        valid_until: valid_until || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      logger.error('Error inserting quote:', insertError)
      return NextResponse.json(
        { error: 'Erreur lors de la création du devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      devis: quote,
      message: 'Devis envoyé avec succès',
    })
  } catch (error) {
    logger.error('Artisan devis POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json({ error: 'Profil artisan non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const { id, amount, description, valid_until } = body

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const { data: quote, error: updateError } = await supabase
      .from('quotes')
      .update({ amount, description, valid_until })
      .eq('id', id)
      .eq('provider_id', provider.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Error updating quote:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du devis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, devis: quote })
  } catch (error) {
    logger.error('Artisan devis PUT error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
