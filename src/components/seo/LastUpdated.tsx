import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LastUpdatedProps {
  /** Label before the date. Default: "Tarifs vérifiés et mis à jour le" */
  label?: string
  className?: string
  /**
   * Date à afficher. Accepte un `Date`, une string ISO ou `null`/`undefined`.
   * Si absente, invalide ou null → fallback sur la date de rendu serveur
   * (comportement historique).
   *
   * Fail-open strict : ne jamais afficher "Invalid Date" — on retombe toujours
   * sur `new Date()` si la valeur est inexploitable.
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
 * Server component — displays the ISR generation date for freshness signals.
 * Uses <time datetime="..."> for SEO structured data.
 *
 * La date est calculée au moment du rendu serveur (build ou ISR revalidation).
 * Elle ne cause PAS de mismatch d'hydratation car c'est un Server Component pur.
 */
/**
 * Convertit une entrée hétérogène en Date valide, ou null si impossible.
 * Centralise la logique fail-open pour ne jamais propager une Invalid Date.
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
  // Fail-open : si `date` est invalide ou absente, on retombe sur `new Date()`.
  const resolved = toValidDate(date) ?? new Date()
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
