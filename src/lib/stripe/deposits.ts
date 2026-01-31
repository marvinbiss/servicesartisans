import Stripe from 'stripe'
import { stripe } from './server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export interface DepositConfig {
  // Percentage of total service price as deposit (e.g., 30 for 30%)
  depositPercentage: number
  // Minimum deposit amount in cents
  minDepositAmount: number
  // Maximum deposit amount in cents (optional)
  maxDepositAmount?: number
}

export const DEFAULT_DEPOSIT_CONFIG: DepositConfig = {
  depositPercentage: 30,
  minDepositAmount: 1000, // 10 EUR minimum
  maxDepositAmount: 50000, // 500 EUR maximum
}

export function calculateDepositAmount(
  servicePriceInCents: number,
  config: DepositConfig = DEFAULT_DEPOSIT_CONFIG
): number {
  let depositAmount = Math.round((servicePriceInCents * config.depositPercentage) / 100)

  // Apply minimum
  if (depositAmount < config.minDepositAmount) {
    depositAmount = config.minDepositAmount
  }

  // Apply maximum if configured
  if (config.maxDepositAmount && depositAmount > config.maxDepositAmount) {
    depositAmount = config.maxDepositAmount
  }

  return depositAmount
}

export interface CreateDepositSessionParams {
  bookingId: string
  artisanId: string
  artisanName: string
  clientEmail: string
  clientName: string
  serviceName: string
  serviceDescription?: string
  servicePriceInCents?: number
  depositAmountInCents: number
  bookingDate: string
  bookingTime: string
  metadata?: Record<string, string>
}

export async function createDepositCheckoutSession({
  bookingId,
  artisanId,
  artisanName,
  clientEmail,
  clientName,
  serviceName,
  serviceDescription,
  servicePriceInCents,
  depositAmountInCents,
  bookingDate,
  bookingTime,
  metadata = {},
}: CreateDepositSessionParams): Promise<{
  sessionId: string
  url: string
}> {
  // Create or retrieve customer
  const customers = await stripe.customers.list({
    email: clientEmail,
    limit: 1,
  })

  let customer: Stripe.Customer
  if (customers.data.length > 0) {
    customer = customers.data[0]
  } else {
    customer = await stripe.customers.create({
      email: clientEmail,
      name: clientName,
      metadata: {
        type: 'booking_client',
      },
    })
  }

  // Create checkout session for one-time deposit payment
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Acompte - ${serviceName}`,
            description: `Réservation avec ${artisanName}\n${bookingDate} - ${bookingTime}${
              serviceDescription ? `\n${serviceDescription}` : ''
            }`,
            metadata: {
              type: 'booking_deposit',
              booking_id: bookingId,
              artisan_id: artisanId,
            },
          },
          unit_amount: depositAmountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'booking_deposit',
      booking_id: bookingId,
      artisan_id: artisanId,
      client_email: clientEmail,
      service_name: serviceName,
      booking_date: bookingDate,
      booking_time: bookingTime,
      ...metadata,
    },
    success_url: `${SITE_URL}/booking/${bookingId}?payment=success`,
    cancel_url: `${SITE_URL}/booking/${bookingId}?payment=cancelled`,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes
    payment_intent_data: {
      metadata: {
        type: 'booking_deposit',
        booking_id: bookingId,
        artisan_id: artisanId,
      },
      receipt_email: clientEmail,
      description: `Acompte pour ${serviceName} - ${artisanName}`,
    },
  })

  return {
    sessionId: session.id,
    url: session.url!,
  }
}

export async function createRefund(
  paymentIntentId: string,
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer',
  amount?: number // Optional partial refund amount in cents
): Promise<Stripe.Refund> {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason,
  }

  if (amount) {
    refundParams.amount = amount
  }

  return stripe.refunds.create(refundParams)
}

export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId)
}
