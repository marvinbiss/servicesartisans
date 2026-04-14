'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  Building2,
  FileText,
  Phone,
  Mail,
  CreditCard,
  Camera,
  MapPin,
  Wrench,
  Euro,
  Clock,
  Globe,
  ChevronRight,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

/** Minimal provider shape needed for completeness calculation. */
export interface CompletenessProvider {
  name?: string | null
  description?: string | null
  bio?: string | null
  phone?: string | null
  email?: string | null
  siret?: string | null
  avatar_url?: string | null
  address_city?: string | null
  address_postal_code?: string | null
  services_offered?: string[] | null
  service_prices?: unknown[] | null
  opening_hours?: Record<string, unknown> | null
  website?: string | null
}

interface FieldDef {
  key: string
  label: string
  weight: number
  icon: React.ReactNode
  /** Tab id on /espace-artisan/profil */
  tab: string
  check: (p: CompletenessProvider) => boolean
}

// ─── Field definitions ──────────────────────────────────────────────────────

const FIELDS: FieldDef[] = [
  {
    key: 'name',
    label: 'Nom de l’entreprise',
    weight: 10,
    icon: <Building2 className="w-4 h-4" aria-hidden="true" />,
    tab: 'identite',
    check: (p) => !!p.name?.trim(),
  },
  {
    key: 'description',
    label: 'Description / présentation',
    weight: 15,
    icon: <FileText className="w-4 h-4" aria-hidden="true" />,
    tab: 'presentation',
    check: (p) => !!(p.description?.trim() || p.bio?.trim()),
  },
  {
    key: 'phone',
    label: 'Téléphone',
    weight: 10,
    icon: <Phone className="w-4 h-4" aria-hidden="true" />,
    tab: 'contact',
    check: (p) => !!p.phone?.trim(),
  },
  {
    key: 'email',
    label: 'Email professionnel',
    weight: 5,
    icon: <Mail className="w-4 h-4" aria-hidden="true" />,
    tab: 'contact',
    check: (p) => !!p.email?.trim(),
  },
  {
    key: 'siret',
    label: 'Numéro SIRET',
    weight: 10,
    icon: <CreditCard className="w-4 h-4" aria-hidden="true" />,
    tab: 'identite',
    check: (p) => !!p.siret?.trim(),
  },
  {
    key: 'avatar',
    label: 'Photo de profil',
    weight: 10,
    icon: <Camera className="w-4 h-4" aria-hidden="true" />,
    tab: 'avatar',
    check: (p) => !!p.avatar_url?.trim(),
  },
  {
    key: 'address',
    label: 'Ville et code postal',
    weight: 5,
    icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
    tab: 'localisation',
    check: (p) => !!(p.address_city?.trim() && p.address_postal_code?.trim()),
  },
  {
    key: 'services',
    label: 'Services proposés',
    weight: 10,
    icon: <Wrench className="w-4 h-4" aria-hidden="true" />,
    tab: 'services',
    check: (p) => Array.isArray(p.services_offered) && p.services_offered.length > 0,
  },
  {
    key: 'prices',
    label: 'Tarifs',
    weight: 10,
    icon: <Euro className="w-4 h-4" aria-hidden="true" />,
    tab: 'services',
    check: (p) => Array.isArray(p.service_prices) && p.service_prices.length > 0,
  },
  {
    key: 'hours',
    label: 'Horaires d’ouverture',
    weight: 10,
    icon: <Clock className="w-4 h-4" aria-hidden="true" />,
    tab: 'disponibilite',
    check: (p) =>
      !!p.opening_hours &&
      typeof p.opening_hours === 'object' &&
      Object.keys(p.opening_hours).length > 0,
  },
  {
    key: 'website',
    label: 'Site web',
    weight: 5,
    icon: <Globe className="w-4 h-4" aria-hidden="true" />,
    tab: 'contact',
    check: (p) => !!p.website?.trim(),
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeScore(provider: CompletenessProvider) {
  let filled = 0
  let total = 0
  const missing: FieldDef[] = []
  const completed: FieldDef[] = []

  for (const field of FIELDS) {
    total += field.weight
    if (field.check(provider)) {
      filled += field.weight
      completed.push(field)
    } else {
      missing.push(field)
    }
  }

  const score = total > 0 ? Math.round((filled / total) * 100) : 0
  return { score, missing, completed }
}

function getScoreColor(score: number): { bar: string; bg: string; text: string } {
  if (score < 40) return { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' }
  if (score < 70)
    return { bar: 'bg-secondary-400', bg: 'bg-secondary-50', text: 'text-secondary-700' }
  return { bar: 'bg-accent-500', bg: 'bg-accent-50', text: 'text-accent-700' }
}

function getMessage(score: number): string {
  if (score >= 100) return 'Parfait ! Votre profil est complet.'
  if (score >= 80) return 'Excellent ! Plus que quelques détails.'
  if (score >= 50) return 'Bon début ! Continuez à compléter.'
  return 'Complétez votre profil pour plus de visibilité.'
}

// ─── Component ──────────────────────────────────────────────────────────────

interface ProfileCompletenessProps {
  provider: CompletenessProvider
}

const ProfileCompleteness = React.memo(function ProfileCompleteness({
  provider,
}: ProfileCompletenessProps) {
  const { score, missing, completed } = useMemo(() => computeScore(provider), [provider])

  // Ne rien afficher si le profil est complet
  if (score >= 100) return null

  const colors = getScoreColor(score)
  const message = getMessage(score)

  return (
    <div className="bg-white rounded-xl border border-charcoal-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-charcoal-900">Complétude du profil</h3>
        <span className={`text-sm font-bold ${colors.text}`}>{score}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-charcoal-100 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
          style={{ width: `${score}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Complétude du profil : ${score}%`}
        />
      </div>

      {/* Encouraging message */}
      <p className={`text-sm font-medium mb-5 ${colors.text}`}>{message}</p>

      {/* Missing fields */}
      {missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 mb-2">
            À compléter
          </p>
          <ul className="space-y-1.5">
            {missing.map((field) => (
              <li key={field.key}>
                <Link
                  href={`/espace-artisan/profil?tab=${field.tab}`}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-100 transition-colors"
                >
                  <span className="text-charcoal-400 group-hover:text-primary-500 transition-colors">
                    <Circle className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="flex items-center gap-1.5 flex-1">
                    {field.icon}
                    {field.label}
                  </span>
                  <ChevronRight
                    className="w-4 h-4 text-charcoal-300 group-hover:text-primary-500 transition-colors"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completed fields (collapsed) */}
      {completed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-charcoal-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400 mb-2">
            Complété ({completed.length}/{FIELDS.length})
          </p>
          <ul className="space-y-1">
            {completed.map((field) => (
              <li
                key={field.key}
                className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-charcoal-400"
              >
                <CheckCircle2 className="w-4 h-4 text-accent-500" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                  {field.icon}
                  {field.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

export default ProfileCompleteness
