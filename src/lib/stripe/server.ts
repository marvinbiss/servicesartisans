import Stripe from 'stripe'

// Lazy initialize Stripe to avoid build-time errors
let stripeInstance: Stripe | null = null

function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  return stripeInstance
}

// Export getter function instead of direct instance
export const stripe = new Proxy({} as Stripe, {
  get(_, prop: keyof Stripe) {
    return getStripeInstance()[prop]
  }
})

export const PLANS = {
  gratuit: {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    priceId: null,
    features: [
      'Profil basique',
      '5 demandes/mois',
      'Messagerie',
      'Support email',
    ],
    limits: {
      demandesParMois: 5,
      photos: 3,
      priorite: 0,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Profil complet',
      '30 demandes/mois',
      'Messagerie prioritaire',
      'Badge référencé',
      'Statistiques de base',
      'Support prioritaire',
    ],
    limits: {
      demandesParMois: 30,
      photos: 10,
      priorite: 1,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Profil premium',
      'Demandes illimitées',
      'Messagerie prioritaire',
      'Badge Premium',
      'Position prioritaire',
      'Statistiques avancées',
      'Support dédié 24/7',
      'Formation gratuite',
    ],
    limits: {
      demandesParMois: -1, // unlimited
      photos: 50,
      priorite: 2,
    },
  },
} as const

export type PlanId = keyof typeof PLANS
