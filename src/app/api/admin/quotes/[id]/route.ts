import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      logger.error('Quote fetch error', error)
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ quote })
  } catch (error) {
    logger.error('Quote fetch error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

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

    const supabase = await createClient()
    const updates = await request.json()

    // Get old data for audit
    const { data: oldQuote } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single()

    const { data: quote, error } = await supabase
      .from('quotes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      logger.error('Quote operation error', error)
      return NextResponse.json({ error: 'Erreur lors de l\'opération' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'quote_updated', 'booking', params.id, updates)

    return NextResponse.json({ quote })
  } catch (error) {
    logger.error('Quote update error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin()
    if (!authResult.success || !authResult.admin) {
      return authResult.error
    }

    const supabase = await createClient()

    // Get quote data for audit
    const { data: quoteToDelete } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', params.id)

    if (error) {
      logger.error('Quote operation error', error)
      return NextResponse.json({ error: 'Erreur lors de l\'opération' }, { status: 500 })
    }

    // Log audit
    await logAdminAction(authResult.admin.id, 'quote_deleted', 'booking', params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Quote delete error', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
