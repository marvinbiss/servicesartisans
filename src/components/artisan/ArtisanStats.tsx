'use client'

import { motion } from 'framer-motion'
import { Calendar, MessageCircle, Award } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanStatsProps {
  artisan: LegacyArtisan
}

export function ArtisanStats({ artisan }: ArtisanStatsProps) {
  // Only show stats that have real data
  const stats: { icon: typeof Calendar; label: string; value: string; color: string; bgColor: string }[] = []

  if (artisan.experience_years && artisan.experience_years > 0) {
    stats.push({ icon: Calendar, label: 'Expérience', value: `${artisan.experience_years} ans`, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' })
  }
  if (artisan.member_since) {
    stats.push({ icon: MessageCircle, label: 'Membre depuis', value: artisan.member_since, color: 'text-secondary-600', bgColor: 'bg-secondary-50 border-secondary-100' })
  }
  if (artisan.creation_date) {
    const year = new Date(artisan.creation_date).getFullYear()
    if (!artisan.member_since) {
      stats.push({ icon: Calendar, label: 'Entreprise créée', value: year.toString(), color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' })
    }
  }

  // Don't render section if no real stats
  if (stats.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-xl font-semibold text-gray-900 font-heading flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
            <Award className="w-4.5 h-4.5 text-primary-600" aria-hidden="true" />
          </div>
          Statistiques
        </h2>
      </div>

      {/* Stats grid */}
      <div className="px-6 pb-6 pt-4">
        <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'md:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-3`} role="list" aria-label="Statistiques de l'artisan">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              role="listitem"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.08 }}
              className={`text-center p-4 rounded-xl border ${stat.bgColor}`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} bg-white/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm`} aria-hidden="true">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900" aria-label={`${stat.label}: ${stat.value}`}>{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1 font-medium" aria-hidden="true">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

    </motion.div>
  )
}
