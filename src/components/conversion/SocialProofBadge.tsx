import { Star } from 'lucide-react'

/**
 * Mini-badge ★ + count affiché sous le H1 sur les templates pSEO majeurs
 * pour faire remonter le social proof above-fold.
 *
 * Règles anti-fake (memory `feedback_legal_data_quality.md` + Google rich-snippet abuse policy) :
 *   - Si `count < 3` → le composant retourne `null` (jamais afficher "0 avis" ni "1 avis").
 *   - Le rating est arrondi visuellement (`Math.round`) mais affiché à 1 décimale.
 *   - Toutes les valeurs proviennent de la DB Supabase, jamais inventées.
 *
 * Composant pur (pas de fetch interne) — la data est fournie par
 * `src/lib/conversion/social-proof.ts` côté server.
 */
export type SocialProofBadgeProps = {
  average: number
  count: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'inline' | 'block'
  className?: string
}

const MIN_COUNT = 3

export function SocialProofBadge({
  average,
  count,
  label = 'avis vérifiés',
  size = 'md',
  variant = 'inline',
  className = '',
}: SocialProofBadgeProps) {
  if (!Number.isFinite(average) || !Number.isFinite(count)) return null
  if (count < MIN_COUNT) return null
  if (average <= 0 || average > 5) return null

  const sizeCls = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14

  const layoutCls =
    variant === 'block' ? 'flex flex-col items-start gap-1' : 'flex flex-wrap items-center gap-2'

  const rounded = Math.round(average)

  return (
    <div
      className={`${layoutCls} ${sizeCls} ${className}`.trim()}
      role="img"
      aria-label={`${average.toFixed(1)} sur 5 — ${count.toLocaleString('fr-FR')} ${label}`}
      data-testid="social-proof-badge"
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={iconSize}
            className={
              i < rounded ? 'fill-amber-400 text-amber-400' : 'fill-none text-charcoal-300'
            }
          />
        ))}
      </div>
      <span className="font-semibold text-charcoal-900">{average.toFixed(1)}/5</span>
      <span className="text-charcoal-600">
        — {count.toLocaleString('fr-FR')} {label}
      </span>
    </div>
  )
}

export default SocialProofBadge
