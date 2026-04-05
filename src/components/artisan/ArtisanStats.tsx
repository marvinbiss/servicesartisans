'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Award,
  Shield,
  Users,
  Clock,
  Navigation,
  CheckCircle,
} from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanStatsProps {
  artisan: LegacyArtisan
}

interface StatConfig {
  icon: typeof Calendar
  label: string
  value: string
  subValue?: string
  color: string
  bgColor: string
}

export function ArtisanStats({ artisan }: ArtisanStatsProps) {
  const stats: StatConfig[] = []
  const currentYear = new Date().getFullYear()


  // Company creation year
  if (artisan.creation_date) {
    const year = new Date(artisan.creation_date).getFullYear()
    const age = currentYear - year
    stats.push({
      icon: Calendar,
      label: age > 1 ? `${age} ans d'expérience` : 'Entreprise créée',
      value: year.toString(),
      color: 'text-charcoal-700',
      bgColor: 'bg-sand-100 border-sand-200',
    })
  } else if (artisan.member_since && parseInt(artisan.member_since, 10) < currentYear) {
    stats.push({
      icon: Calendar,
      label: 'Membre depuis',
      value: artisan.member_since,
      color: 'text-charcoal-700',
      bgColor: 'bg-sand-100 border-sand-200',
    })
  }

  // SIRET verified
  if (artisan.is_verified) {
    stats.push({
      icon: Shield,
      label: 'Identité vérifiée',
      value: 'SIRET',
      color: 'text-accent-700',
      bgColor: 'bg-accent-50 border-accent-200',
    })
  }

  // Available 24h/7j
  if (artisan.available_24h) {
    stats.push({
      icon: Clock,
      label: 'Disponibilité',
      value: '24h/7j',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50 border-primary-100',
    })
  }

  // Free quote
  if (artisan.free_quote) {
    stats.push({
      icon: CheckCircle,
      label: 'Devis',
      value: 'Gratuit',
      color: 'text-accent-700',
      bgColor: 'bg-accent-50 border-accent-200',
    })
  }

  // Team size
  if (artisan.team_size && artisan.team_size > 1) {
    stats.push({
      icon: Users,
      label: 'Équipe',
      value: artisan.team_size.toString(),
      subValue: 'pers.',
      color: 'text-charcoal-700',
      bgColor: 'bg-sand-100 border-sand-200',
    })
  }

  // Intervention radius
  if (artisan.intervention_radius_km) {
    stats.push({
      icon: Navigation,
      label: "Zone d'action",
      value: artisan.intervention_radius_km.toString(),
      subValue: 'km',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50 border-primary-100',
    })
  }

  if (stats.length === 0) return null

  const gridCols =
    stats.length >= 4
      ? 'md:grid-cols-4'
      : stats.length === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-2'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-soft border border-sand-200 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold text-charcoal-900 font-heading flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <Award className="w-4.5 h-4.5 text-primary-400" aria-hidden="true" />
          </div>
          En bref
        </h2>
      </div>

      {/* Stats grid */}
      <div className="px-6 pb-6 pt-4">
        <div
          className={`grid grid-cols-2 ${gridCols} gap-3`}
          role="list"
          aria-label="Informations clés de l'artisan"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              role="listitem"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
              className={`text-center p-4 rounded-xl border ${stat.bgColor}`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} bg-white/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm`}
                aria-hidden="true"
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div
                className="text-2xl font-bold text-charcoal-900 leading-none"
                aria-label={`${stat.label} : ${stat.value}${stat.subValue ? ' ' + stat.subValue : ''}`}
              >
                {stat.value}
                {stat.subValue && (
                  <span className="text-sm font-normal text-charcoal-500 ml-0.5">{stat.subValue}</span>
                )}
              </div>
              <div className="text-xs text-charcoal-500 mt-1.5 font-medium leading-tight" aria-hidden="true">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
