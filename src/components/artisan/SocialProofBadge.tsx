'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

// ---------------------------------------------------------------------------
// Hook — useWeeklyDevisCount
// Retourne 0 tant qu'il n'y a pas d'endpoint réel pour compter les demandes.
// Conservé pour compatibilité des imports existants.
// ---------------------------------------------------------------------------

export function useWeeklyDevisCount(_specialtySlug: string, _citySlug: string): number {
  // Retourne 0 — pas de faux chiffres (Art. L121-2 Code de la consommation)
  return 0
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
