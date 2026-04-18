import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LastUpdatedProps {
  /** Label before the date. Default: "Tarifs vérifiés et mis à jour le" */
  label?: string
  className?: string
  /**
   * Date à afficher. Accepte un `Date`, une string ISO ou `null`/`undefined`.
   * Si absente, invalide ou null → le composant retourne `null` (ne rend rien).
   *
   * Fail-closed strict : ne JAMAIS inventer une date de fraîcheur.
   * Google classe "changer la date des pages pour les faire paraître fraîches"
   * comme signal search-engine-first (helpful content).
   * Source : developers.google.com/search/docs/fundamentals/creating-helpful-content
   */
  date?: Date | string | null
}

/**
 * Mois en français — hardcodés pour éviter les problèmes de locale sur
 * certains environnements de build (Edge, Node minimal sans ICU complet).
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

/**
 * Formate une date en français (ex : "22 mars 2026").
 * Ne dépend PAS de toLocaleDateString pour éviter les bugs de locale.
 */
function formatDateFR(date: Date): string {
  const day = date.getDate()
  const month = MOIS_FR[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Server component — displays a real freshness date when available, or nothing.
 * Uses <time datetime="..."> for SEO structured data.
 *
 * Fail-closed : renvoie `null` si la date est absente/invalide. L'absence est
 * neutre pour Google ; une fausse date est activement trompeuse.
 */
function toValidDate(input: Date | string | null | undefined): Date | null {
  if (input == null) return null
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export default function LastUpdated({
  label = 'Tarifs vérifiés et mis à jour le',
  className,
  date,
}: LastUpdatedProps) {
  const resolved = toValidDate(date)
  if (!resolved) return null

  const formatted = formatDateFR(resolved)
  const iso = resolved.toISOString().split('T')[0]

  return (
    <p className={cn('text-sm flex items-center gap-1.5', className)}>
      <Clock className="h-3.5 w-3.5" />
      <span>
        {label} <time dateTime={iso}>{formatted}</time>
      </span>
    </p>
  )
}
