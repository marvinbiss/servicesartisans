'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const DAYS_ORDER = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
] as const

function getCurrentDayKey(): string {
  const jsDay = new Date().getDay()
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1
  return DAYS_ORDER[dayIndex].key
}

export function ArtisanOpeningHours() {
  const now = new Date()
  const currentHour = now.getHours()
  const openNow = currentHour >= 8 && currentHour < 20
  const todayKey = getCurrentDayKey()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-soft border border-sand-200 overflow-hidden"
    >
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-charcoal-900 font-heading flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-primary-400" aria-hidden="true" />
            </div>
            Horaires ServicesArtisans
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              openNow
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-charcoal-50 text-charcoal-600 border-charcoal-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {openNow && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${openNow ? 'bg-green-500' : 'bg-charcoal-400'}`} />
            </span>
            {openNow ? 'Ouvert' : 'Fermé'}
          </span>
        </div>
      </div>

      <div className="px-6 pb-2 pt-1">
        <p className="text-xs text-charcoal-500">Disponibilité de notre service de mise en relation</p>
      </div>
      <div className="px-6 pb-6 pt-1">
        <div className="space-y-1" role="list" aria-label="Horaires ServicesArtisans">
          {DAYS_ORDER.map(({ key, label }) => {
            const isToday = key === todayKey

            return (
              <div
                key={key}
                role="listitem"
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                  isToday ? 'bg-primary-50 border border-primary-100' : ''
                }`}
              >
                <span className={`text-sm ${isToday ? 'font-bold text-charcoal-900' : 'font-medium text-charcoal-700'}`}>
                  {label}
                  {isToday && <span className="text-xs text-primary-500 ml-1.5">aujourd&apos;hui</span>}
                </span>
                <span className="text-sm text-charcoal-900 font-medium">
                  08:00 – 20:00
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
