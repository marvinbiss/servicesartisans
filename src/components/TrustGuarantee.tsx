import { Shield, CheckCircle, Lock, Clock } from 'lucide-react'
import Link from 'next/link'

interface TrustGuaranteeProps {
  /** 'banner' for inline display, 'compact' for minimal */
  variant?: 'banner' | 'compact'
}

const guarantees = [
  {
    icon: Shield,
    title: 'Artisans vérifiés',
    description: 'SIRET contrôlé, assurance vérifiée',
  },
  {
    icon: CheckCircle,
    title: 'Devis 100% gratuits',
    description: 'Sans engagement, sans frais cachés',
  },
  {
    icon: Lock,
    title: 'Données protégées',
    description: 'Vos informations restent confidentielles',
  },
  {
    icon: Clock,
    title: 'Réponse rapide',
    description: "Jusqu'à 3 artisans vous contactent",
  },
]

export default function TrustGuarantee({ variant = 'banner' }: TrustGuaranteeProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-charcoal-500">
        {guarantees.map((g) => (
          <span key={g.title} className="flex items-center gap-1.5">
            <g.icon className="w-3.5 h-3.5 text-green-500" />
            {g.title}
          </span>
        ))}
        <Link href="/garantie" className="text-primary-500 hover:underline">
          Détails de la garantie
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-accent-600" />
        <h3 className="font-heading text-lg font-bold text-charcoal-900">
          La garantie ServicesArtisans
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {guarantees.map((g) => (
          <div key={g.title} className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <g.icon className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal-900">{g.title}</p>
              <p className="text-xs text-charcoal-500 mt-0.5">{g.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href="/garantie"
          className="text-sm text-accent-700 hover:text-green-900 font-medium hover:underline"
        >
          Découvrir notre engagement qualité
        </Link>
      </div>
    </div>
  )
}
