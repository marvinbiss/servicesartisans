'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Calendar, MessageCircle, Shield, Award } from 'lucide-react'
import { Artisan } from './types'

interface ArtisanStatsProps {
  artisan: Artisan
}

export function ArtisanStats({ artisan }: ArtisanStatsProps) {
  const stats = [
    {
      icon: Clock,
      label: 'Temps de reponse',
      value: artisan.response_time || '< 2h',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Taux de reponse',
      value: artisan.response_rate ? `${artisan.response_rate}%` : '95%',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: Calendar,
      label: 'Reservations cette semaine',
      value: artisan.bookings_this_week?.toString() || '-',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: MessageCircle,
      label: 'Membre depuis',
      value: artisan.member_since || '-',
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-600" />
        Statistiques
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
            className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Trust indicators */}
      {(artisan.certifications?.length || artisan.insurance?.length) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            {artisan.certifications?.map((cert, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm"
              >
                <Shield className="w-4 h-4" />
                {cert}
              </span>
            ))}
            {artisan.insurance?.map((ins, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm"
              >
                <Shield className="w-4 h-4" />
                {ins}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
