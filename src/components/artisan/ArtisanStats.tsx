'use client'

import { motion } from 'framer-motion'
import { Calendar, MessageCircle, Shield, Award } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanStatsProps {
  artisan: LegacyArtisan
}

export function ArtisanStats({ artisan }: ArtisanStatsProps) {
  // Only show stats that have real data
  const stats: { icon: typeof Calendar; label: string; value: string; color: string; bgColor: string }[] = []

  if (artisan.experience_years && artisan.experience_years > 0) {
    stats.push({ icon: Calendar, label: 'Exp\u00e9rience', value: `${artisan.experience_years} ans`, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' })
  }
  if (artisan.member_since) {
    stats.push({ icon: MessageCircle, label: 'Membre depuis', value: artisan.member_since, color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-100' })
  }
  if (artisan.creation_date) {
    const year = new Date(artisan.creation_date).getFullYear()
    if (!artisan.member_since) {
      stats.push({ icon: Calendar, label: 'Entreprise cr\u00e9\u00e9e', value: year.toString(), color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-100' })
    }
  }

  // Don't render section if no real stats
  if (stats.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Section header */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-lg font-semibold text-gray-900 font-heading flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Award className="w-4 h-4 text-blue-600" aria-hidden="true" />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className={`text-center p-4 rounded-xl border ${stat.bgColor} transition-all duration-200 hover:scale-[1.02] hover:shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} bg-white/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm`} aria-hidden="true">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-xl font-bold text-gray-900" aria-label={`${stat.label}: ${stat.value}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium" aria-hidden="true">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust indicators */}
      {((artisan.certifications?.length ?? 0) > 0 || (artisan.insurance?.length ?? 0) > 0) && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <h3 className="sr-only">Certifications et assurances</h3>
          <div className="flex flex-wrap gap-2 pt-4" role="list" aria-label="Certifications et assurances">
            {artisan.certifications?.map((cert, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100 transition-colors hover:bg-blue-100"
              >
                <Shield className="w-4 h-4" aria-hidden="true" />
                {cert}
              </span>
            ))}
            {artisan.insurance?.map((ins, i) => (
              <span
                key={i}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-100 transition-colors hover:bg-green-100"
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
