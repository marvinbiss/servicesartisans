import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// GET /api/loyalty - Get client's loyalty points
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientEmail = searchParams.get('email')
    const artisanId = searchParams.get('artisanId')

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    let query = supabase
      .from('loyalty_points')
      .select('*')
      .eq('client_email', clientEmail)

    if (artisanId) {
      query = query.eq('artisan_id', artisanId)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate total points
    const totalPoints = data?.reduce((sum, entry) => sum + entry.points, 0) || 0

    // Define rewards thresholds
    const rewards = [
      { points: 100, reward: '10% de réduction', unlocked: totalPoints >= 100 },
      { points: 250, reward: '20% de réduction', unlocked: totalPoints >= 250 },
      { points: 500, reward: 'Service gratuit', unlocked: totalPoints >= 500 },
    ]

    return NextResponse.json({
      totalPoints,
      pointsHistory: data,
      rewards,
      nextReward: rewards.find(r => !r.unlocked),
    })
  } catch (error) {
    logger.error('Error fetching loyalty points:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement' },
      { status: 500 }
    )
  }
}

// POST /api/loyalty - Add loyalty points
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      artisanId,
      clientEmail,
      clientName,
      bookingId,
      points,
      reason,
    } = body

    if (!artisanId || !clientEmail || !points) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Add points
    const { data, error } = await supabase
      .from('loyalty_points')
      .insert({
        artisan_id: artisanId,
        client_email: clientEmail,
        client_name: clientName,
        booking_id: bookingId,
        points,
        reason: reason || 'Réservation',
      })
      .select()
      .single()

    if (error) throw error

    // Get total points
    const { data: allPoints } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('client_email', clientEmail)
      .eq('artisan_id', artisanId)

    const totalPoints = allPoints?.reduce((sum, p) => sum + p.points, 0) || 0

    return NextResponse.json({
      success: true,
      pointsAdded: points,
      totalPoints,
    })
  } catch (error) {
    logger.error('Error adding loyalty points:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout' },
      { status: 500 }
    )
  }
}

// PUT /api/loyalty - Redeem points for reward
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { artisanId, clientEmail, pointsToRedeem, rewardType } = body

    if (!artisanId || !clientEmail || !pointsToRedeem) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get current total points
    const { data: allPoints } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('client_email', clientEmail)
      .eq('artisan_id', artisanId)

    const totalPoints = allPoints?.reduce((sum, p) => sum + p.points, 0) || 0

    if (totalPoints < pointsToRedeem) {
      return NextResponse.json(
        { error: 'Points insuffisants' },
        { status: 400 }
      )
    }

    // Deduct points (negative entry)
    const { error } = await supabase
      .from('loyalty_points')
      .insert({
        artisan_id: artisanId,
        client_email: clientEmail,
        points: -pointsToRedeem,
        reason: `Récompense: ${rewardType}`,
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      pointsRedeemed: pointsToRedeem,
      remainingPoints: totalPoints - pointsToRedeem,
    })
  } catch (error) {
    logger.error('Error redeeming points:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'échange' },
      { status: 500 }
    )
  }
}
