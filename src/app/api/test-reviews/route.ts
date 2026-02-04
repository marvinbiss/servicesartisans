import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const providerId = searchParams.get('providerId') || '6022da8c-4e31-4555-8813-6616e8d46eb2'

  try {
    const supabase = await createClient()
    
    // Test 1: Get provider info
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, name, siret, review_count, rating_average')
      .eq('id', providerId)
      .single()

    // Test 2: Get reviews with correct columns
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        content,
        created_at,
        author_verified,
        author_name,
        has_media,
        booking_id
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      providerId,
      provider: {
        data: provider,
        error: providerError?.message || null,
      },
      reviews: {
        count: reviews?.length || 0,
        data: reviews || [],
        error: reviewsError?.message || null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
    }, { status: 500 })
  }
}
