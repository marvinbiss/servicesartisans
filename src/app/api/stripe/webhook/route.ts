import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy create admin client to avoid build-time errors
let supabaseAdminInstance: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured')
    }
    supabaseAdminInstance = createClient(url, key)
  }
  return supabaseAdminInstance
}

export const dynamic = 'force-dynamic'

/**
 * IDEMPOTENCY: Check if webhook event was already processed
 * Returns true if event should be skipped (already processed)
 */
async function checkIdempotency(eventId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  // Try to insert the event - will fail if already exists due to UNIQUE constraint
  const { error } = await supabase
    .from('webhook_events')
    .insert({
      stripe_event_id: eventId,
      type: 'stripe_webhook',
      status: 'processing',
      created_at: new Date().toISOString(),
    })

  if (error) {
    // Event already exists - check its status
    if (error.code === '23505') { // Unique violation
      const { data: existing } = await supabase
        .from('webhook_events')
        .select('status')
        .eq('stripe_event_id', eventId)
        .single()

      if (existing?.status === 'completed') {
        logger.info(`Webhook event ${eventId} already processed, skipping`)
        return true // Skip processing
      }
      // Event exists but not completed - might be a retry, allow processing
    }
  }

  return false // Proceed with processing
}

/**
 * Mark webhook event as completed
 */
async function markEventCompleted(eventId: string, eventType: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase
    .from('webhook_events')
    .update({
      type: eventType,
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
}

/**
 * Mark webhook event as failed
 */
async function markEventFailed(eventId: string, error: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase
    .from('webhook_events')
    .update({
      status: 'failed',
      error: error.slice(0, 1000), // Limit error message length
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_event_id', eventId)
}

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    logger.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    logger.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // IDEMPOTENCY CHECK: Skip if already processed
  const shouldSkip = await checkIdempotency(event.id)
  if (shouldSkip) {
    return NextResponse.json({ received: true, status: 'already_processed' })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        logger.debug(`Unhandled event type: ${event.type}`)
    }

    // Mark event as successfully processed
    await markEventCompleted(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook handler error:', error)

    // Mark event as failed for debugging
    await markEventFailed(event.id, errorMessage)

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id

  if (!userId || !planId) return

  logger.info(`Checkout completed for user ${userId}: plan=${planId}, subscription=${session.subscription}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info(`Subscription updated: id=${subscription.id}, customer=${subscription.customer}, status=${subscription.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info(`Subscription deleted: id=${subscription.id}, customer=${subscription.customer}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info(`Invoice payment succeeded: id=${invoice.id}, customer=${invoice.customer}, amount=${invoice.amount_paid}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.info(`Invoice payment failed: id=${invoice.id}, customer=${invoice.customer}, amount_due=${invoice.amount_due}`)
}
