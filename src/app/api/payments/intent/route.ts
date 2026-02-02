/**
 * Payment Intent API - ServicesArtisans
 * Create payment intents with advanced options
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import {
  createAdvancedPaymentIntent,
  createOrUpdateCustomer,
} from '@/lib/stripe/advanced-payments'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// POST request schema
const paymentIntentSchema = z.object({
  amount: z.number().int().positive().max(1000000),
  bookingId: z.string().uuid(),
  artisanId: z.string().uuid(),
  description: z.string().max(500).optional(),
  paymentType: z.enum(['full', 'deposit', 'split']).optional().default('full'),
  depositPercentage: z.number().int().min(10).max(100).optional().default(30),
  splitInstallments: z.number().int().min(2).max(4).optional().default(3),
  customerEmail: z.string().email().optional(),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(20).optional(),
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const validation = paymentIntentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request', details: validation.error.flatten() }, { status: 400 })
    }
    const {
      amount,
      bookingId,
      artisanId,
      description,
      paymentType,
      depositPercentage,
      splitInstallments,
      customerEmail,
      customerName,
      customerPhone,
    } = validation.data

    // Create or get Stripe customer
    let customerId: string | undefined
    if (user || customerEmail) {
      const customer = await createOrUpdateCustomer({
        email: customerEmail || user?.email || '',
        name: customerName || '',
        phone: customerPhone,
        userId: user?.id || 'guest',
      })
      customerId = customer.id
    }

    // Configure payment based on type
    let depositConfig
    let splitConfig

    if (paymentType === 'deposit') {
      depositConfig = {
        depositPercentage,
        refundableUntil: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      }
    } else if (paymentType === 'split') {
      splitConfig = {
        numberOfInstallments: splitInstallments as 2 | 3 | 4,
        intervalDays: 30,
        firstPaymentPercentage: Math.round(100 / splitInstallments),
      }
    }

    // Create payment intent
    const result = await createAdvancedPaymentIntent({
      amount,
      customerId,
      bookingId,
      artisanId,
      description: description || `Reservation #${bookingId}`,
      paymentMethods: {
        applePay: true,
        googlePay: true,
        card: true,
      },
      depositConfig,
      splitConfig,
    })

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      amount: result.amount,
      totalAmount: result.totalAmount,
      paymentType: result.paymentType,
      customerId,
    })
  } catch (error) {
    logger.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
