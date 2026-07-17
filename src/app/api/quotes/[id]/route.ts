import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { quoteUpdateActionSchema, getQuoteById, updateQuote } from '@/lib/services/quotes-service'

export const dynamic = 'force-dynamic'

// GET - Get single quote
export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1001, message: 'Authentification requise' },
        },
        { status: 401 }
      )
    }

    const result = await getQuoteById(supabase, params.id, user.id)

    if (result.error === 'QUOTE_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 2002, message: 'Devis non trouve' },
        },
        { status: 404 }
      )
    }

    if (result.error === 'UNAUTHORIZED') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1002, message: 'Acces non autorise' },
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    logger.error('Quote fetch error', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 9999, message: 'Erreur serveur' },
      },
      { status: 500 }
    )
  }
}

// PATCH - Update quote status
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1001, message: 'Authentification requise' },
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = quoteUpdateActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 2001, message: 'Validation error', details: validation.error.flatten() },
        },
        { status: 400 }
      )
    }

    const result = await updateQuote(supabase, params.id, user.id, validation.data.action)

    if (result.error === 'QUOTE_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 2002, message: 'Devis non trouve' },
        },
        { status: 404 }
      )
    }

    if (result.error === 'ONLY_CLIENT_CAN_ACCEPT') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1002, message: 'Seul le client peut accepter le devis' },
        },
        { status: 403 }
      )
    }

    if (result.error === 'ONLY_CLIENT_CAN_REJECT') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1002, message: 'Seul le client peut refuser le devis' },
        },
        { status: 403 }
      )
    }

    if (result.error === 'ONLY_PROVIDER_CAN_CANCEL') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1002, message: "Seul l'artisan peut annuler le devis" },
        },
        { status: 403 }
      )
    }

    if (result.error) throw new Error(result.error)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    logger.error('Quote update error', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 9999, message: 'Erreur serveur' },
      },
      { status: 500 }
    )
  }
}
