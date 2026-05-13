/**
 * PriorityBadge — badge colore affichant le tier de priorite d'un dossier CEE.
 *
 * S = accent-600 bg, "Priorite haute"
 * A = primary-500 bg, "Priorite moyenne"
 * B = amber-500 bg, "Standard"
 * C = charcoal-400 bg, "Faible valeur"
 *
 * Server Component — pas de hook.
 */

import type { CeeDossierTier } from '@/lib/cee/scoring'

interface PriorityBadgeProps {
  tier: CeeDossierTier
  /** Affiche le score numerique a cote du tier (ex: "S · 85"). */
  score?: number | null
}

const TIER_CONFIG: Record<
  CeeDossierTier,
  { label: string; ariaLabel: string; bg: string; text: string }
> = {
  S: {
    label: 'Priorite haute',
    ariaLabel: 'Priorité S — dossier haute valeur',
    bg: 'bg-accent-600',
    text: 'text-white',
  },
  A: {
    label: 'Priorite moyenne',
    ariaLabel: 'Priorité A — dossier valeur moyenne',
    bg: 'bg-primary-500',
    text: 'text-white',
  },
  B: {
    label: 'Standard',
    ariaLabel: 'Priorité B — dossier standard',
    bg: 'bg-amber-500',
    text: 'text-charcoal-900',
  },
  C: {
    label: 'Faible valeur',
    ariaLabel: 'Priorité C — dossier faible valeur',
    bg: 'bg-charcoal-400',
    text: 'text-white',
  },
}

export default function PriorityBadge({ tier, score }: PriorityBadgeProps) {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.C

  return (
    <span
      role="status"
      aria-label={score != null ? `${config.ariaLabel}, score ${score} sur 100` : config.ariaLabel}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
      title={score != null ? `Score ${score}/100 — ${config.label}` : config.label}
    >
      <span aria-hidden="true">{tier}</span>
      <span className="sr-only">{config.label}</span>
      <span>{config.label}</span>
      {score != null && <span className="opacity-75">· {score}</span>}
    </span>
  )
}
