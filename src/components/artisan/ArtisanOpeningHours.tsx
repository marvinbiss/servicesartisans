'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { LegacyArtisan } from '@/types/legacy'

interface ArtisanOpeningHoursProps {
  artisan: LegacyArtisan
}

const DAYS_ORDER = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'samedi', label: 'Samedi' },
  { key: 'dimanche', label: 'Dimanche' },
] as const

function isOpenNow(hours: NonNullable<LegacyArtisan['opening_hours']>): boolean {
  const now = new Date()
  // JS getDay: 0=Sunday, 1=Monday, ...
  const jsDay = now.getDay()
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1
  const dayKey = DAYS_ORDER[dayIndex].key

  const slot = hours[dayKey]
  if (!slot || !slot.ouvert) return false

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [startH, startM] = slot.debut.split(':').map(Number)
  const [endH, endM] = slot.fin.split(':').map(Number)
  const start = startH * 60 + (startM || 0)
  const end = endH * 60 + (endM || 0)

  return currentMinutes >= start && currentMinutes <= end
}

function getCurrentDayKey(): string {
  const jsDay = new Date().getDay()
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1
  return DAYS_ORDER[dayIndex].key
}

export function ArtisanOpeningHours({ artisan }: ArtisanOpeningHoursProps) {
  if (!artisan.opening_hours || Object.keys(artisan.opening_hours).length === 0) {
    return null
  }

  const hours = artisan.opening_hours
  const openNow = isOpenNow(hours)
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
            Horaires
          </h2>
          {/* Badge ouvert/fermé */}
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

      <div className="px-6 pb-6 pt-3">
        <div className="space-y-1" role="list" aria-label="Horaires d'ouverture">
          {DAYS_ORDER.map(({ key, label }) => {
            const slot = hours[key]
            const isOpen = slot?.ouvert
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
                <span className={`text-sm ${isOpen ? 'text-charcoal-900 font-medium' : 'text-charcoal-400'}`}>
                  {isOpen ? `${slot.debut} – ${slot.fin}` : 'Fermé'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
