'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Données réalistes ──────────────────────────────────────────────
const PRENOMS = [
  'Sophie',
  'Thomas',
  'Marie',
  'Pierre',
  'Nathalie',
  'Marc',
  'Julie',
  'Laurent',
  'Isabelle',
  'Nicolas',
  'Céline',
  'David',
  'Sandrine',
  'Julien',
  'Valérie',
  'Stéphane',
  'Caroline',
  'Christophe',
  'Aurélie',
  'Sébastien',
  'Émilie',
  'Philippe',
  'Camille',
  'François',
  'Élise',
]

const VILLES = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Nantes',
  'Strasbourg',
  'Lille',
  'Montpellier',
  'Rennes',
  'Nice',
  'Grenoble',
  'Rouen',
  'Toulon',
  'Dijon',
  'Angers',
  'Metz',
  'Reims',
  'Orléans',
  'Clermont-Ferrand',
  'Tours',
  'Caen',
  'Perpignan',
  'Brest',
]

// Pivot full RGE 2026-05-03 : labels d'affichage social proof — serrurier,
// carreleur, vitrier retirés (commodity hors RGE), plaquiste→plâtrier (slug
// canonique). Liste enrichie avec gravity hubs RGE pour cohérence pivot.
const METIERS = [
  'plombier',
  'électricien',
  'peintre',
  'maçon',
  'couvreur',
  'menuisier',
  'chauffagiste',
  'climaticien',
  'plâtrier',
  'charpentier',
  'pompe-a-chaleur',
  'isolation-thermique',
  'panneaux-solaires',
]

function hashSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface Activity {
  prenom: string
  ville: string
  metier: string
  minutesAgo: number
}

function generateActivity(index: number): Activity {
  const now = Math.floor(Date.now() / 60_000) // minutes since epoch
  const seed = hashSeed(`activity-${now}-${index}`)

  return {
    prenom: PRENOMS[seed % PRENOMS.length],
    ville: VILLES[(seed >> 4) % VILLES.length],
    metier: METIERS[(seed >> 8) % METIERS.length],
    minutesAgo: 2 + (seed % 28), // 2-29 min ago
  }
}

function formatMinutes(m: number): string {
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  return `il y a ${h}h`
}

// ── Composant ──────────────────────────────────────────────────────

interface SocialProofToastProps {
  /** Délai avant 1ère apparition (ms) */
  initialDelay?: number
  /** Durée d'affichage de chaque toast (ms) */
  displayDuration?: number
  /** Intervalle entre les toasts (ms) */
  interval?: number
  /** Nombre max de toasts à afficher avant d'arrêter */
  maxToasts?: number
}

export default function SocialProofToast({
  initialDelay = 5000,
  displayDuration = 5000,
  interval = 12000,
  maxToasts = 5,
}: SocialProofToastProps) {
  const [activity, setActivity] = useState<Activity | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [shown, setShown] = useState(0)

  const showNext = useCallback(() => {
    setShown((prev) => {
      const next = prev + 1
      if (next > maxToasts) return prev
      setActivity(generateActivity(next))
      setVisible(true)
      return next
    })
  }, [maxToasts])

  useEffect(() => {
    if (dismissed) return

    // Premier toast après le délai initial
    const initialTimer = setTimeout(showNext, initialDelay)
    return () => clearTimeout(initialTimer)
  }, [dismissed, initialDelay, showNext])

  useEffect(() => {
    if (!visible || dismissed) return

    // Masquer après displayDuration
    const hideTimer = setTimeout(() => setVisible(false), displayDuration)
    return () => clearTimeout(hideTimer)
  }, [visible, dismissed, displayDuration])

  useEffect(() => {
    if (visible || dismissed || shown === 0 || shown >= maxToasts) return

    // Prochain toast après l'intervalle
    const nextTimer = setTimeout(showNext, interval)
    return () => clearTimeout(nextTimer)
  }, [visible, dismissed, shown, maxToasts, interval, showNext])

  if (dismissed || !activity) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm pointer-events-none md:bottom-6 md:left-6">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-sand-200 px-4 py-3.5 flex items-start gap-3"
          >
            {/* Icône ville */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-600" />
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal-900 leading-snug">
                {activity.prenom} a demandé un devis {activity.metier}
              </p>
              <p className="text-xs text-charcoal-500 mt-0.5">
                à {activity.ville} · {formatMinutes(activity.minutesAgo)}
              </p>
            </div>

            {/* Fermer */}
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-sand-100 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
