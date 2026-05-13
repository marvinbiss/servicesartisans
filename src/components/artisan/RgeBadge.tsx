'use client'

import { Leaf } from 'lucide-react'
import { RgeTracking, type RgeBadgeClickProps } from '@/lib/analytics/tracking'
import { cleanAdemeText } from '@/lib/ademe/text'

/**
 * RgeBadge — affiche le badge "Certifié RGE" pour les artisans revendiqués
 * dont les certifications ADEME sont actives.
 *
 * Source : dataset data.gouv.fr `liste-des-entreprises-rge-2`
 * Licence: Etalab 2.0 — attribution "Source : ADEME — France Rénov'" requise
 * Alim   : cron hebdomadaire /api/cron/rge-sync (cf. src/lib/rge/sync.ts)
 *
 * N'utilise PAS @/components/ui/tooltip (n'existe pas dans le projet).
 * Le détail s'affiche en expand via <details>/<summary> — accessible,
 * zéro JS, pas de dépendance.
 */

export interface RgeQualificationProp {
  code: string
  nom: string
  organisme: string
  domaine: string | null
  meta_domaine: string | null
  date_debut: string
  date_fin: string
  url: string | null
}

interface RgeBadgeProps {
  qualifications: RgeQualificationProp[] | null | undefined
  validUntil: string | null | undefined
  organismes: string[] | null | undefined
  sourceUrl: string | null | undefined
  /**
   * Compact mode — petite pastille "RGE" pour listings/cards.
   * Pas de <details>, pas de dropdown : juste un pill + title natif.
   */
  compact?: boolean
  /**
   * Contexte analytics — si fourni, le badge devient cliquable et
   * dispatche `rge_badge_click` au clic (surface/provider_id/service/city).
   */
  trackingContext?: RgeBadgeClickProps
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function RgeBadge({
  qualifications,
  validUntil,
  organismes,
  sourceUrl,
  compact = false,
  trackingContext,
}: RgeBadgeProps) {
  const handleTrackedClick = () => {
    if (trackingContext) RgeTracking.badgeClick(trackingContext)
  }
  // Guard: pas de RGE actif → rien
  if (!qualifications || qualifications.length === 0 || !validUntil) return null

  const today = new Date().toISOString().slice(0, 10)
  if (validUntil < today) return null

  const count = qualifications.length
  const organismesLabel =
    organismes && organismes.length > 0 ? organismes.map(cleanAdemeText).join(', ') : '—'

  if (compact) {
    // Pastille compacte pour ProviderCard / listings — pas de dropdown, juste un pill statique.
    // Détail visible au hover via attribut title natif (accessible, zéro JS).
    const titleLines = [
      `Certifié RGE — ${count} qualification${count > 1 ? 's' : ''} active${count > 1 ? 's' : ''}`,
      `Valide jusqu'au ${formatDate(validUntil)}`,
      `Organisme${(organismes?.length ?? 0) > 1 ? 's' : ''} : ${organismesLabel}`,
      '',
      ...qualifications
        .slice(0, 5)
        .map((q) => `• ${cleanAdemeText(q.nom)} (${cleanAdemeText(q.organisme)})`),
      qualifications.length > 5
        ? `… +${qualifications.length - 5} autre${qualifications.length - 5 > 1 ? 's' : ''}`
        : '',
      '',
      "Source : ADEME — France Rénov'",
    ]
      .filter(Boolean)
      .join('\n')

    const compactClasses =
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 text-[11px] font-semibold border border-accent-200'
    const compactAria = `Certifié RGE — ${count} qualification${count > 1 ? 's' : ''} active${count > 1 ? 's' : ''}, valide jusqu'au ${formatDate(validUntil)}`
    const compactInner = (
      <>
        <Leaf className="w-3 h-3 text-accent-600" aria-hidden="true" />
        RGE
        {count > 1 && <span className="text-[10px] font-normal text-accent-600">×{count}</span>}
      </>
    )

    if (trackingContext) {
      return (
        <button
          type="button"
          className={`${compactClasses} cursor-pointer hover:bg-accent-100 transition-colors`}
          title={titleLines}
          aria-label={compactAria}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            handleTrackedClick()
          }}
        >
          {compactInner}
        </button>
      )
    }

    return (
      <span className={compactClasses} title={titleLines} aria-label={compactAria}>
        {compactInner}
      </span>
    )
  }

  return (
    <details className="group inline-block mb-3">
      <summary
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-700 text-sm font-semibold border border-accent-200 cursor-pointer list-none hover:bg-accent-100 transition-colors"
        aria-label={`Certifié RGE — ${count} qualification${count > 1 ? 's' : ''} active${count > 1 ? 's' : ''}`}
        onClick={handleTrackedClick}
      >
        <Leaf className="w-4 h-4 text-accent-600" aria-hidden="true" />
        Certifié RGE
        <span className="ml-1 text-xs font-normal text-accent-600">
          ({count} qualif{count > 1 ? 's' : ''})
        </span>
        <svg
          className="w-3 h-3 ml-0.5 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="mt-3 p-4 rounded-lg bg-white border border-accent-200 shadow-sm max-w-md">
        <div className="mb-3 pb-3 border-b border-accent-100">
          <div className="text-xs uppercase tracking-wide text-accent-600 font-semibold mb-1">
            Reconnu Garant de l&apos;Environnement
          </div>
          <div className="text-sm text-charcoal-700">
            Valide jusqu&apos;au <strong>{formatDate(validUntil)}</strong>
          </div>
          <div className="text-xs text-charcoal-500 mt-0.5">Organismes : {organismesLabel}</div>
        </div>

        <ul className="space-y-2 text-sm">
          {qualifications.map((q) => (
            <li key={`${q.code}-${q.organisme}`} className="flex items-start gap-2">
              <Leaf
                className="w-3.5 h-3.5 text-accent-500 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal-900 truncate">
                  {cleanAdemeText(q.nom)}
                </div>
                <div className="text-xs text-charcoal-500">
                  {cleanAdemeText(q.organisme)}
                  {q.meta_domaine
                    ? ` — ${cleanAdemeText(q.meta_domaine)}`
                    : q.domaine
                      ? ` — ${cleanAdemeText(q.domaine)}`
                      : ''}
                </div>
                <div className="text-xs text-charcoal-400">
                  Jusqu&apos;au {formatDate(q.date_fin)}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 pt-3 border-t border-accent-100 text-xs text-charcoal-500">
          Source :{' '}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-700 hover:underline"
            >
              ADEME — France Rénov&apos;
            </a>
          ) : (
            <span>ADEME — France Rénov&apos;</span>
          )}{' '}
          (Licence Etalab 2.0)
        </div>
      </div>
    </details>
  )
}
