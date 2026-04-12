import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { quoteCreateSchema, listQuotes, createQuote } from '@/lib/services/quotes-service'

export const dynamic = 'force-dynamic'

// GET - List quotes for authenticated user
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'client'
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const result = await listQuotes(supabase, {
      userId: user.id,
      role,
      status,
      page,
      limit,
    })

    if (result.error === 'PROVIDER_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1003, message: 'Profil artisan non trouve' },
        },
        { status: 404 }
      )
    }

    if (result.error) throw new Error(result.error)

    return NextResponse.json({
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data: result.data!.quotes,
      pagination: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        page: result.data!.page,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        limit: result.data!.limit,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        total: result.data!.total,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        pages: result.data!.pages,
      },
    })
  } catch (error) {
    logger.error('Quotes fetch error', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 9999, message: 'Erreur serveur' },
      },
      { status: 500 }
    )
  }
}

// POST - Create a new quote (provider only)
export async function POST(request: NextRequest) {
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
    const validation = quoteCreateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 2001,
            message: 'Données invalides',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const result = await createQuote(supabase, user.id, validation.data)

    if (result.error === 'NOT_A_PROVIDER') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 1003, message: 'Seuls les artisans peuvent creer des devis' },
        },
        { status: 403 }
      )
    }

    if (result.error === 'BOOKING_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 2002, message: 'Reservation non trouvee' },
        },
        { status: 404 }
      )
    }

    if (result.error) throw new Error(result.error)

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Quote creation error', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 9999, message: 'Erreur serveur' },
      },
      { status: 500 }
    )
  }
}
