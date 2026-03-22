import { Shield, FileCheck, Lock, Scale } from 'lucide-react'
import type { ReactNode } from 'react'

interface Guarantee {
  icon: ReactNode
  title: string
  description: string
}

const guarantees: Guarantee[] = [
  {
    icon: <FileCheck className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />,
    title: 'Devis 100% gratuit',
    description: 'Pas de frais cachés, vous ne payez rien pour recevoir des devis.',
  },
  {
    icon: <Shield className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />,
    title: 'Artisans vérifiés SIREN',
    description: 'Chaque artisan est vérifié via les données officielles INSEE.',
  },
  {
    icon: <Lock className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />,
    title: 'Données confidentielles',
    description: 'Vos informations personnelles restent strictement protégées.',
  },
  {
    icon: <Scale className="h-5 w-5 text-accent-600 shrink-0" aria-hidden="true" />,
    title: 'Sans engagement',
    description: 'Comparez librement, choisissez en toute sérénité.',
  },
]

interface GuaranteeCardsProps {
  /** Display as a vertical list instead of a grid */
  variant?: 'grid' | 'list'
  className?: string
}

export default function GuaranteeCards({ variant = 'grid', className = '' }: GuaranteeCardsProps) {
  const isGrid = variant === 'grid'

  return (
    <section aria-label="Nos garanties" className={className}>
      <ul
        className={
          isGrid
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-3'
            : 'flex flex-col gap-2.5'
        }
        role="list"
      >
        {guarantees.map((g) => (
          <li
            key={g.title}
            className="flex items-start gap-3 rounded-xl border border-accent-200 bg-sand-50 px-4 py-3.5 transition-colors hover:border-accent-300"
          >
            <span className="mt-0.5">{g.icon}</span>
            <div className="min-w-0">
              <p className="font-heading text-sm font-semibold text-charcoal-900">
                {g.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-charcoal-500">
                {g.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
