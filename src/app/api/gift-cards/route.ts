import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@/lib/logger'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluded similar chars
  let code = ''
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-'
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST /api/gift-cards - Create/purchase a gift card
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      amount, // In euros
      senderName,
      senderEmail,
      recipientName,
      recipientEmail,
      message,
      artisanId, // Optional: for a specific artisan
    } = body

    if (!amount || !senderEmail || !recipientEmail) {
      return NextResponse.json(
        { error: 'Montant et emails requis' },
        { status: 400 }
      )
    }

    if (amount < 10 || amount > 500) {
      return NextResponse.json(
        { error: 'Montant entre 10 et 500 EUR' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Generate unique code
    const code = generateGiftCardCode()

    // Create Stripe checkout session for payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Carte Cadeau ServicesArtisans',
              description: `Pour ${recipientName} - ${amount} EUR`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: 'gift_card',
        code,
        amount: amount.toString(),
        sender_name: senderName || 'Anonyme',
        sender_email: senderEmail,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        message: message || '',
        artisan_id: artisanId || '',
      },
      success_url: `${SITE_URL}/carte-cadeau/confirmation?code=${code}`,
      cancel_url: `${SITE_URL}/carte-cadeau?cancelled=true`,
    })

    // Create pending gift card entry
    const { error } = await supabase
      .from('gift_cards')
      .insert({
        code,
        amount: amount * 100, // Store in cents
        balance: amount * 100,
        sender_name: senderName,
        sender_email: senderEmail,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        message,
        artisan_id: artisanId || null,
        status: 'pending',
        stripe_session_id: session.id,
      })

    if (error) throw error

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      code, // Return code for confirmation page
    })
  } catch (error) {
    logger.error('Error creating gift card:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// GET /api/gift-cards - Check gift card balance or validate
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Code requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: card, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error || !card) {
      return NextResponse.json(
        { error: 'Carte cadeau invalide' },
        { status: 404 }
      )
    }

    if (card.status !== 'active') {
      return NextResponse.json(
        { error: card.status === 'pending' ? 'Paiement en attente' : 'Carte expirée ou utilisée' },
        { status: 400 }
      )
    }

    // Check expiration (1 year)
    const expirationDate = new Date(card.created_at)
    expirationDate.setFullYear(expirationDate.getFullYear() + 1)
    if (new Date() > expirationDate) {
      return NextResponse.json(
        { error: 'Carte cadeau expirée' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: card.code,
      originalAmount: card.amount / 100,
      balance: card.balance / 100,
      recipientName: card.recipient_name,
      expiresAt: expirationDate.toISOString(),
      artisanId: card.artisan_id,
    })
  } catch (error) {
    logger.error('Error checking gift card:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}

// PUT /api/gift-cards - Redeem gift card for booking
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { code, bookingId, amountToRedeem } = body

    if (!code || !bookingId || !amountToRedeem) {
      return NextResponse.json(
        { error: 'Code, booking et montant requis' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get gift card
    const { data: card, error: cardError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Carte cadeau invalide' },
        { status: 404 }
      )
    }

    const amountInCents = amountToRedeem * 100

    if (card.balance < amountInCents) {
      return NextResponse.json(
        { error: 'Solde insuffisant' },
        { status: 400 }
      )
    }

    // Deduct from balance
    const newBalance = card.balance - amountInCents
    const newStatus = newBalance === 0 ? 'used' : 'active'

    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        balance: newBalance,
        status: newStatus,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', card.id)

    if (updateError) throw updateError

    // Log redemption
    await supabase
      .from('gift_card_transactions')
      .insert({
        gift_card_id: card.id,
        booking_id: bookingId,
        amount: amountInCents,
        type: 'redemption',
      })

    return NextResponse.json({
      success: true,
      amountRedeemed: amountToRedeem,
      remainingBalance: newBalance / 100,
    })
  } catch (error) {
    logger.error('Error redeeming gift card:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'utilisation' },
      { status: 500 }
    )
  }
}
