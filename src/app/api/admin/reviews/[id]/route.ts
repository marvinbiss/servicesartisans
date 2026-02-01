import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// PATCH - Moderate review
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
      .from('reviews')
      .update({
        moderation_status: body.moderation_status,
        is_visible: body.is_visible,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin review moderation error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
