'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Calendar, MessageCircle, Shield, Award } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanStatsProps {
  artisan: LegacyArtisan
}

export function ArtisanStats({ artisan }: ArtisanStatsProps) {
  // Only show stats that have real data
  const stats: { icon: typeof Clock; label: string; value: string; color: string }[] = []

  if (artisan.response_time) {
    stats.push({ icon: Clock, label: 'Temps de réponse', value: artisan.response_time, color: 'text-blue-600 bg-blue-50' })
  }
  if (artisan.response_rate) {
    stats.push({ icon: TrendingUp, label: 'Taux de réponse', value: `${artisan.response_rate}%`, color: 'text-green-600 bg-green-50' })
  }
  if (artisan.experience_years && artisan.experience_years > 0) {
    stats.push({ icon: Calendar, label: 'Expérience', value: `${artisan.experience_years} ans`, color: 'text-purple-600 bg-purple-50' })
  }
  if (artisan.member_since) {
    stats.push({ icon: MessageCircle, label: 'Membre depuis', value: artisan.member_since, color: 'text-amber-600 bg-amber-50' })
  }
  if (artisan.creation_date) {
    const year = new Date(artisan.creation_date).getFullYear()
    if (!artisan.member_since) {
      stats.push({ icon: Calendar, label: 'Entreprise créée', value: year.toString(), color: 'text-purple-600 bg-purple-50' })
    }
  }

  // Don't render section if no real stats
  if (stats.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-600" aria-hidden="true" />
        Statistiques
      </h2>

      <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'md:grid-cols-4' : stats.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`} role="list" aria-label="Statistiques de l'artisan">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            role="listitem"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`} aria-hidden="true">
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900" aria-label={`${stat.label}: ${stat.value}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1" aria-hidden="true">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Trust indicators */}
      {((artisan.certifications?.length ?? 0) > 0 || (artisan.insurance?.length ?? 0) > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h3 className="sr-only">Certifications et assurances</h3>
          <div className="flex flex-wrap gap-3" role="list" aria-label="Certifications et assurances">
            {artisan.certifications?.map((cert, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                {cert}
              </span>
            ))}
            {artisan.insurance?.map((ins, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                {ins}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
