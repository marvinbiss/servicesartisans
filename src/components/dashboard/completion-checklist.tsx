'use client'

import { CheckCircle, Circle } from 'lucide-react'
import { clsx } from 'clsx'

interface Provider {
  name?: string
  description?: string
  phone?: string
  email?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  logo?: string
  is_verified?: boolean
}

interface CompletionChecklistProps {
  provider: Provider
}

export function CompletionChecklist({ provider }: CompletionChecklistProps) {
  const checks = [
    { label: "Nom de l'entreprise", done: !!provider.name },
    { label: 'Description (50+ car.)', done: (provider.description?.length || 0) >= 50 },
    { label: 'Téléphone', done: !!provider.phone },
    { label: 'Email', done: !!provider.email },
    {
      label: 'Adresse complète',
      done: !!provider.address_street && !!provider.address_city && !!provider.address_postal_code,
    },
    { label: 'Logo', done: !!provider.logo },
  ]

  const completedCount = checks.filter((c) => c.done).length
  const percentage = Math.round((completedCount / checks.length) * 100)

  return (
    <div className="bg-white rounded-xl border border-sand-300 p-6">
      <h3 className="font-semibold text-charcoal-900 mb-4">Complétion du profil</h3>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-charcoal-500">Progression</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              percentage === 100 ? 'bg-green-500' : 'bg-primary-400'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {checks.map((check, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            {check.done ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-sand-500" />
            )}
            <span className={check.done ? 'text-charcoal-700' : 'text-charcoal-400'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>

      {percentage === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-green-700 font-medium">✓ Profil complet !</p>
        </div>
      )}

      {!provider.is_verified && percentage >= 80 && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg text-center">
          <p className="text-sm text-primary-600">
            Demandez la vérification de votre profil pour obtenir le badge ✓
          </p>
        </div>
      )}
    </div>
  )
}
