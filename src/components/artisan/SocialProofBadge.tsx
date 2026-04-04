'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import useSWR from 'swr'

// ---------------------------------------------------------------------------
// Hook — useWeeklyDevisCount
// Fetch réel du nombre de demandes de devis sur les 7 derniers jours.
// Retourne 0 si aucune donnée ou en cas d'erreur (Art. L121-2 Code conso).
// ---------------------------------------------------------------------------

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useWeeklyDevisCount(specialtySlug: string, citySlug: string): number {
  const params = new URLSearchParams()
  if (specialtySlug) params.set('specialty', specialtySlug)
  if (citySlug) params.set('city', citySlug)
  const qs = params.toString()
  const url = `/api/devis/weekly-count${qs ? `?${qs}` : ''}`

  const { data } = useSWR<{ count: number }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
    fallbackData: { count: 0 },
  })

  return data?.count ?? 0
}

// ---------------------------------------------------------------------------
// Composant — SocialProofBadge
// Bandeau de confiance affiché sur les fiches artisan non revendiquées.
// Affiche un message statique (pas de faux compteurs).
// ---------------------------------------------------------------------------

interface SocialProofBadgeProps {
  specialty: string
  city: string
}

export function SocialProofBadge({
  specialty,
  city,
}: SocialProofBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 flex items-center gap-3"
    >
      <Users className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />

      <p className="text-sm font-medium text-accent-800 leading-snug">
        Des <span className="font-semibold">{specialty.toLowerCase()}s à {city}</span> sont disponibles pour vos travaux
      </p>
    </motion.div>
  )
}
