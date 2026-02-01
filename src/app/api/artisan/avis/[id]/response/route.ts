import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// POST - Respond to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentification requise' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { response } = body

    if (!response || response.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: { message: 'La réponse doit contenir au moins 10 caractères' } },
        { status: 400 }
      )
    }

    // Get provider for this user
    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!provider) {
      return NextResponse.json(
        { success: false, error: { message: 'Profil artisan non trouvé' } },
        { status: 404 }
      )
    }

    // Check review belongs to this provider and has no response yet
    const { data: review } = await supabase
      .from('reviews')
      .select('id, provider_id, response')
      .eq('id', params.id)
      .eq('provider_id', provider.id)
      .single()

    if (!review) {
      return NextResponse.json(
        { success: false, error: { message: 'Avis non trouvé' } },
        { status: 404 }
      )
    }

    if (review.response) {
      return NextResponse.json(
        { success: false, error: { message: 'Cet avis a déjà une réponse' } },
        { status: 400 }
      )
    }

    // Update review with response
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        response: response.trim(),
        response_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review response error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erreur serveur' } },
      { status: 500 }
    )
  }
}
