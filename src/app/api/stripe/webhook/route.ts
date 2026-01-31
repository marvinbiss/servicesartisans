import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, PLANS } from '@/lib/stripe/server'
import { logger } from '@/lib/logger'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { sendPaymentFailedNotification } from '@/lib/notifications/unified-notification-service'
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

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    logger.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
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

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Webhook handler error:', error)
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

  // Update user's subscription in database
  await getSupabaseAdmin()
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_status: 'active',
      stripe_subscription_id: session.subscription as string,
      subscription_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', userId)

  logger.info(`Subscription activated for user ${userId}: ${planId}`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Get user by customer ID
  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  // Determine plan from price
  const priceId = subscription.items.data[0]?.price.id
  let planId = 'gratuit'

  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      planId = key
      break
    }
  }

  await getSupabaseAdmin()
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_status: subscription.status,
      subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', profile.id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  await getSupabaseAdmin()
    .from('profiles')
    .update({
      subscription_plan: 'gratuit',
      subscription_status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('id', profile.id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  // Record the payment
  await getSupabaseAdmin().from('invoices').insert({
    profile_id: profile.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'paid',
    invoice_url: invoice.hosted_invoice_url,
    created_at: new Date(invoice.created * 1000).toISOString(),
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: profile } = await getSupabaseAdmin()
    .from('profiles')
    .select('id, email, first_name, last_name, business_name')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) return

  // Update subscription status
  await getSupabaseAdmin()
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('id', profile.id)

  // Send email notification about failed payment
  const displayName = profile.business_name ||
    (profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : 'Client')

  await sendPaymentFailedNotification({
    bookingId: invoice.id || 'payment',
    clientName: displayName,
    clientEmail: profile.email || '',
    artisanName: 'ServicesArtisans',
    serviceName: 'Abonnement',
    date: new Date().toLocaleDateString('fr-FR'),
    startTime: '',
    message: `Montant: ${(invoice.amount_due / 100).toFixed(2)}€`,
  }).catch((err) => logger.error('Payment failed notification error', err))
}
