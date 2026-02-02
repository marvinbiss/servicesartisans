/**
 * Payment Methods API - ServicesArtisans
 * Manage saved payment methods
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import {
  getPaymentMethods,
  savePaymentMethod,
} from '@/lib/stripe/advanced-payments'
import Stripe from 'stripe'
import { z } from 'zod'

// POST request schema
const saveMethodSchema = z.object({
  paymentMethodId: z.string().min(1).max(100),
  setAsDefault: z.boolean().optional().default(true),
})

// DELETE request query params schema
const deleteMethodSchema = z.object({
  id: z.string().min(1).max(100),
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get user's saved payment methods
export const dynamic = 'force-dynamic'

export async function GET() {
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get Stripe customer ID from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ paymentMethods: [] })
    }

    const paymentMethods = await getPaymentMethods(profile.stripe_customer_id)

    return NextResponse.json({ paymentMethods })
  } catch (error) {
    logger.error('Get payment methods error:', error)
    return NextResponse.json(
      { error: 'Failed to get payment methods' },
      { status: 500 }
    )
  }
}

// POST - Save a new payment method
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = saveMethodSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const { paymentMethodId, setAsDefault } = result.data

    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
        metadata: { userId: user.id },
      })
      customerId = customer.id

      // Save to profile
      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Save payment method
    const paymentMethod = await savePaymentMethod({
      customerId,
      paymentMethodId,
      setAsDefault,
    })

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        expMonth: paymentMethod.card?.exp_month,
        expYear: paymentMethod.card?.exp_year,
      },
    })
  } catch (error) {
    logger.error('Save payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to save payment method' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a payment method
export async function DELETE(request: Request) {
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const queryParams = { id: searchParams.get('id') }
    const result = deleteMethodSchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request', details: result.error.flatten() }, { status: 400 })
    }
    const paymentMethodId = result.data.id

    // Verify payment method belongs to user
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No payment methods found' },
        { status: 404 }
      )
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Delete payment method error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}
