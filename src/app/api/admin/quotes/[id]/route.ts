import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { data: quote, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Quote fetch error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'quote_updated',
      entity_type: 'booking',
      entity_id: params.id,
      old_data: oldQuote,
      new_data: updates,
    })

    return NextResponse.json({ quote })
  } catch (error) {
    console.error('Quote update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action: 'quote_deleted',
      entity_type: 'booking',
      entity_id: params.id,
      old_data: quoteToDelete,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote delete error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
