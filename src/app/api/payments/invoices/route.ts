/**
 * Invoices API - ServicesArtisans
 * Manage user invoices and payment history
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { getInvoiceHistory } from '@/lib/stripe/advanced-payments'
import { logger } from '@/lib/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Get user's invoice history
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

    // Get Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] })
    }

    // Get invoices from Stripe
    const invoices = await getInvoiceHistory(profile.stripe_customer_id)

    // Also get payment records from database for local bookings
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        booking:bookings (
          id,
          date,
          service_description,
          artisan:profiles!artisan_id (
            business_name,
            first_name,
            last_name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const localPayments = (payments || []).map((p) => ({
      id: p.id,
      type: 'booking',
      date: new Date(p.created_at),
      amount: p.amount,
      status: p.status,
      description: p.booking?.service_description || 'Reservation',
      artisanName: p.booking?.artisan?.business_name ||
        `${p.booking?.artisan?.first_name || ''} ${p.booking?.artisan?.last_name || ''}`.trim(),
      bookingDate: p.booking?.date,
      stripePaymentIntentId: p.stripe_payment_intent_id,
    }))

    return NextResponse.json({
      invoices,
      payments: localPayments,
    })
  } catch (error) {
    logger.error('Get invoices error:', error)
    return NextResponse.json(
      { error: 'Failed to get invoices' },
      { status: 500 }
    )
  }
}
