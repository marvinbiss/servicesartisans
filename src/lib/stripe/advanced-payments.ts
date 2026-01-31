/**
 * Advanced Payments - ServicesArtisans
 * Apple Pay, Google Pay, Split Payments, Deposits
 */

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export interface PaymentMethodConfig {
  applePay: boolean
  googlePay: boolean
  card: boolean
  sepaDebit: boolean
  bancontact: boolean
  ideal: boolean
}

export interface SplitPaymentConfig {
  numberOfInstallments: 2 | 3 | 4
  intervalDays: number
  firstPaymentPercentage: number
}

export interface DepositConfig {
  depositPercentage: number
  refundableUntil: Date
  nonRefundableAfter?: Date
}

// Create Payment Intent with multiple payment methods
export async function createAdvancedPaymentIntent({
  amount,
  currency = 'eur',
  customerId,
  bookingId,
  artisanId,
  description,
  paymentMethods = { applePay: true, googlePay: true, card: true, sepaDebit: false, bancontact: false, ideal: false },
  splitConfig,
  depositConfig,
  metadata = {},
}: {
  amount: number
  currency?: string
  customerId?: string
  bookingId: string
  artisanId: string
  description: string
  paymentMethods?: Partial<PaymentMethodConfig>
  splitConfig?: SplitPaymentConfig
  depositConfig?: DepositConfig
  metadata?: Record<string, string>
}) {
  // Determine payment amount (deposit or full)
  let paymentAmount = amount
  if (depositConfig) {
    paymentAmount = Math.round(amount * (depositConfig.depositPercentage / 100))
  } else if (splitConfig) {
    paymentAmount = Math.round(amount * (splitConfig.firstPaymentPercentage / 100))
  }

  // Build payment method types array
  const paymentMethodTypes: string[] = []
  if (paymentMethods.card) paymentMethodTypes.push('card')
  if (paymentMethods.sepaDebit) paymentMethodTypes.push('sepa_debit')
  if (paymentMethods.bancontact) paymentMethodTypes.push('bancontact')
  if (paymentMethods.ideal) paymentMethodTypes.push('ideal')

  // Create the payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: paymentAmount,
    currency,
    customer: customerId,
    payment_method_types: paymentMethodTypes,
    metadata: {
      bookingId,
      artisanId,
      paymentType: depositConfig ? 'deposit' : splitConfig ? 'split_first' : 'full',
      totalAmount: amount.toString(),
      ...metadata,
    },
    description,
    // Apple Pay and Google Pay work through the card payment method
    // with the payment_method_options
    payment_method_options: {
      card: {
        request_three_d_secure: 'automatic',
      },
    },
  })

  // If split payment, schedule future payments
  if (splitConfig && splitConfig.numberOfInstallments > 1) {
    await scheduleInstallments({
      bookingId,
      customerId,
      totalAmount: amount,
      firstPaymentIntentId: paymentIntent.id,
      config: splitConfig,
    })
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: paymentAmount,
    totalAmount: amount,
    paymentType: depositConfig ? 'deposit' : splitConfig ? 'split' : 'full',
  }
}

// Schedule future installments
async function scheduleInstallments({
  bookingId,
  customerId,
  totalAmount,
  firstPaymentIntentId,
  config,
}: {
  bookingId: string
  customerId?: string
  totalAmount: number
  firstPaymentIntentId: string
  config: SplitPaymentConfig
}) {
  const remainingAmount = totalAmount - Math.round(totalAmount * (config.firstPaymentPercentage / 100))
  const installmentAmount = Math.round(remainingAmount / (config.numberOfInstallments - 1))

  const installments = []
  for (let i = 1; i < config.numberOfInstallments; i++) {
    const scheduledDate = new Date()
    scheduledDate.setDate(scheduledDate.getDate() + config.intervalDays * i)

    installments.push({
      bookingId,
      customerId,
      amount: installmentAmount,
      installmentNumber: i + 1,
      totalInstallments: config.numberOfInstallments,
      scheduledDate: scheduledDate.toISOString(),
      firstPaymentIntentId,
      status: 'scheduled',
    })
  }

  // In production, save to database and use cron job to process
  return installments
}

// Create Stripe Customer with payment methods
export async function createOrUpdateCustomer({
  email,
  name,
  phone,
  userId,
}: {
  email: string
  name: string
  phone?: string
  userId: string
}) {
  // Check for existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    // Update existing customer
    return await stripe.customers.update(existingCustomers.data[0].id, {
      name,
      phone,
      metadata: { userId },
    })
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name,
    phone,
    metadata: { userId },
  })
}

// Save payment method for future use
export async function savePaymentMethod({
  customerId,
  paymentMethodId,
  setAsDefault = true,
}: {
  customerId: string
  paymentMethodId: string
  setAsDefault?: boolean
}) {
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })

  if (setAsDefault) {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
  }

  return await stripe.paymentMethods.retrieve(paymentMethodId)
}

// Get customer's saved payment methods
export async function getPaymentMethods(customerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })

  return paymentMethods.data.map((pm) => ({
    id: pm.id,
    type: pm.type,
    brand: pm.card?.brand,
    last4: pm.card?.last4,
    expMonth: pm.card?.exp_month,
    expYear: pm.card?.exp_year,
    isDefault: false, // Would need to check customer default
  }))
}

// Process refund
export async function processRefund({
  paymentIntentId,
  amount,
  reason = 'requested_by_customer',
}: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // Omit for full refund
    reason,
  })

  return {
    refundId: refund.id,
    amount: refund.amount,
    status: refund.status,
  }
}

// Create invoice for artisan
export async function createInvoice({
  customerId,
  artisanId,
  items,
  dueDate,
}: {
  customerId: string
  artisanId: string
  items: Array<{ description: string; amount: number; quantity?: number }>
  dueDate?: Date
}) {
  // Create invoice items
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: item.amount,
      currency: 'eur',
      description: item.description,
      quantity: item.quantity || 1,
    })
  }

  // Create and finalize invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true,
    collection_method: 'send_invoice',
    due_date: dueDate ? Math.floor(dueDate.getTime() / 1000) : undefined,
    metadata: { artisanId },
  })

  // Finalize and send
  await stripe.invoices.finalizeInvoice(invoice.id)
  await stripe.invoices.sendInvoice(invoice.id)

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    invoiceUrl: invoice.hosted_invoice_url,
    pdfUrl: invoice.invoice_pdf,
    total: invoice.total,
    status: invoice.status,
  }
}

// Get invoice history
export async function getInvoiceHistory(customerId: string) {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 50,
  })

  return invoices.data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    date: new Date(inv.created * 1000),
    dueDate: inv.due_date ? new Date(inv.due_date * 1000) : null,
    total: inv.total,
    status: inv.status,
    paidAt: inv.status_transitions.paid_at
      ? new Date(inv.status_transitions.paid_at * 1000)
      : null,
    invoiceUrl: inv.hosted_invoice_url,
    pdfUrl: inv.invoice_pdf,
  }))
}

// Calculate platform fee (for artisan payouts)
export function calculatePlatformFee(amount: number, feePercentage: number = 10) {
  const fee = Math.round(amount * (feePercentage / 100))
  return {
    totalAmount: amount,
    platformFee: fee,
    artisanPayout: amount - fee,
  }
}

// Create Stripe Connect payout to artisan
export async function createArtisanPayout({
  connectedAccountId,
  amount,
  bookingId,
}: {
  connectedAccountId: string
  amount: number
  bookingId: string
}) {
  const transfer = await stripe.transfers.create({
    amount,
    currency: 'eur',
    destination: connectedAccountId,
    metadata: { bookingId },
  })

  return {
    transferId: transfer.id,
    amount: transfer.amount,
    status: 'pending',
  }
}
