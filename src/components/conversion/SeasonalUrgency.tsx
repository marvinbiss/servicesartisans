'use client'

import { Calendar, TrendingUp, Snowflake, Sun } from 'lucide-react'

interface SeasonalUrgencyProps {
  service?: string
  className?: string
}

/** Real seasonal BTP urgency messages — based on actual French construction market seasonality */
const SEASONAL_MESSAGES: Record<string, { icon: typeof Calendar; message: string; color: string }> =
  {
    // Spring: high season for outdoor work
    'spring-default': {
      icon: Sun,
      message: 'Haute saison travaux — les carnets des artisans se remplissent vite au printemps',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    // Summer: renovation season
    'summer-default': {
      icon: TrendingUp,
      message: 'Période idéale pour les travaux de rénovation — profitez des longs jours',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    // Fall: prepare for winter
    'fall-default': {
      icon: Snowflake,
      message: "Préparez votre logement avant l'hiver — isolation, chauffage, toiture",
      color: 'text-primary-600 bg-primary-50 border-primary-200',
    },
    // Winter: best prices
    'winter-default': {
      icon: Calendar,
      message: "Période creuse = meilleurs tarifs — idéal pour vos travaux d'intérieur",
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  }

/** Service-specific overrides */
const SERVICE_OVERRIDES: Record<string, Record<string, string>> = {
  plomberie: {
    spring: 'Dégel et remise en route — les plombiers sont très sollicités au printemps',
    winter: 'Risques de gel sur les canalisations — anticipez vos réparations',
  },
  chauffage: {
    fall: "Révision de chauffage avant l'hiver — prenez rendez-vous avant la ruée",
    winter: "Forte demande en dépannage chauffage — les délais s'allongent en hiver",
  },
  isolation: {
    fall: "Dernière ligne droite avant l'hiver pour isoler votre logement",
    spring: "MaPrimeRénov' : lancez vos travaux d'isolation avant la fin des aides",
  },
  toiture: {
    spring: "Saison idéale pour la toiture — vérifiez les dégâts de l'hiver",
    fall: 'Dernières semaines pour réparer votre toiture avant les intempéries',
  },
  peinture: {
    spring: 'Saison idéale pour la peinture extérieure — conditions optimales',
    winter: 'Meilleurs tarifs pour la peinture intérieure en basse saison',
  },
  jardin: {
    spring: "Haute saison jardinage — les paysagistes sont pris d'assaut",
    fall: "Préparez votre jardin pour l'hiver — dernières interventions avant le gel",
  },
}

function getSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth() // 0-11
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'fall'
  return 'winter'
}

export default function SeasonalUrgency({ service, className = '' }: SeasonalUrgencyProps) {
  const season = getSeason()

  // Check for service-specific message
  let message: string | null = null
  if (service) {
    const slug = service.toLowerCase().replace(/[^a-z]/g, '')
    const overrides = SERVICE_OVERRIDES[slug]
    if (overrides?.[season]) {
      message = overrides[season]
    }
  }

  // Fall back to default seasonal message
  const defaultEntry = SEASONAL_MESSAGES[`${season}-default`]
  if (!message) {
    message = defaultEntry.message
  }

  const Icon = defaultEntry.icon

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${defaultEntry.color} ${className}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
