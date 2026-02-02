import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// GET query params schema
const loyaltyGetSchema = z.object({
  email: z.string().email(),
  artisanId: z.string().uuid().optional().nullable(),
})

// POST request schema
const loyaltyPostSchema = z.object({
  artisanId: z.string().uuid(),
  clientEmail: z.string().email(),
  clientName: z.string().max(100).optional(),
  bookingId: z.string().uuid().optional(),
  points: z.number().int().min(1).max(10000),
  reason: z.string().max(200).optional(),
})

// PUT request schema
const loyaltyPutSchema = z.object({
  artisanId: z.string().uuid(),
  clientEmail: z.string().email(),
  pointsToRedeem: z.number().int().positive(),
  rewardType: z.string().max(100).optional(),
})

// GET /api/loyalty - Get client's loyalty points
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      email: searchParams.get('email'),
      artisanId: searchParams.get('artisanId'),
    }
    const result = loyaltyGetSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { email: clientEmail, artisanId } = result.data

    const supabase = await createClient()

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
    const result = loyaltyPostSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const {
      artisanId,
      clientEmail,
      clientName,
      bookingId,
      points,
      reason,
    } = result.data

    const supabase = await createClient()

    // Add points
    const { error } = await supabase
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
    const result = loyaltyPutSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation error', details: result.error.flatten() },
        { status: 400 }
      )
    }
    const { artisanId, clientEmail, pointsToRedeem, rewardType } = result.data

    const supabase = await createClient()

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
