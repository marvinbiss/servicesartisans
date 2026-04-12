import { Clock } from 'lucide-react'

interface FreshnessSignalProps {
  lastModified: string | null
  label?: string
}

/**
 * Mois en français — hardcodés pour éviter les problèmes de locale.
 */
const MOIS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

function formatDateFR(date: Date): string {
  const day = date.getDate()
  const month = MOIS_FR[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Tiny inline component showing when the page data was last updated.
 * Server component — no 'use client'.
 *
 * Shows only if lastModified is valid and within the last 365 days.
 * Displays a colored dot based on recency:
 * - Green: within last 7 days
 * - Yellow: within last 30 days
 * - No dot: older
 */
export default function FreshnessSignal({
  lastModified,
  label = 'Données mises à jour',
}: FreshnessSignalProps) {
  if (!lastModified) return null

  const date = new Date(lastModified)
  if (Number.isNaN(date.getTime())) return null

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // Don't show if older than 365 days
  if (diffDays > 365) return null

  const isRecent = diffDays <= 7
  const isModerate = diffDays > 7 && diffDays <= 30

  const formatted = formatDateFR(date)
  const iso = date.toISOString().split('T')[0]

  return (
    <p className="text-xs text-charcoal-400 flex items-center gap-1.5">
      <Clock className="h-3 w-3 flex-shrink-0" />
      {isRecent && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />}
      {isModerate && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />}
      <span>
        {isRecent ? (
          <>
            Mis à jour récemment — <time dateTime={iso}>{formatted}</time>
          </>
        ) : (
          <>
            {label} le <time dateTime={iso}>{formatted}</time>
          </>
        )}
      </span>
    </p>
  )
}
