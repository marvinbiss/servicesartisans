'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users } from 'lucide-react'

// ---------------------------------------------------------------------------
// Hook — useWeeklyDevisCount
// Retourne un nombre déterministe de demandes de devis pour un métier+ville.
// Le résultat est stable (pas de Math.random) pour éviter les mismatches SSR.
// TODO: remplacer par un vrai fetch API quand l'endpoint existera.
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0 // (hash * 33) + char
  }
  return Math.abs(hash)
}

export function useWeeklyDevisCount(specialtySlug: string, citySlug: string): number {
  const seed = hashString(`${specialtySlug}:${citySlug}`)
  // Range 5–45 (réaliste pour une ville moyenne)
  return (seed % 41) + 5
}

// ---------------------------------------------------------------------------
// Composant — SocialProofBadge
// Bandeau compact de social proof affiché sur les fiches artisan non revendiquées.
// ---------------------------------------------------------------------------

interface SocialProofBadgeProps {
  specialty: string
  specialtySlug: string
  city: string
  citySlug: string
}

export function SocialProofBadge({
  specialty,
  specialtySlug,
  city,
  citySlug,
}: SocialProofBadgeProps) {
  const count = useWeeklyDevisCount(specialtySlug, citySlug)

  if (count === 0) return null

  const isHot = count > 10
  const Icon = isHot ? TrendingUp : Users

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-3 flex items-center gap-3"
    >
      <Icon className="h-4 w-4 flex-shrink-0 text-accent-600" />

      <p className="text-sm font-medium text-accent-800 leading-snug">
        <span className="font-semibold">{count} demandes</span> de {specialty.toLowerCase()} à {city} cette semaine
      </p>

      {isHot && (
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          En ce moment
        </span>
      )}
    </motion.div>
  )
}
