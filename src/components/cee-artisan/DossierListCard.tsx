/**
 * DossierListCard — carte compacte représentant un dossier CEE dans la liste
 * artisan (`/espace-artisan/cee`).
 *
 * Server Component — ne dépend d'aucun hook. Affiche :
 *   - Statut (pastille via StatusBadge)
 *   - Code opération CEE (ex. BAR-TH-104)
 *   - Prime estimée en euros
 *   - Date d'engagement formatée fr-FR
 *   - CTA vers la page détail
 */

import Link from 'next/link'
import { ChevronRight, FileText, Euro, Calendar } from 'lucide-react'
import type { CeeDossier } from '@/lib/cee/dossier-types'
import StatusBadge from './StatusBadge'

interface DossierListCardProps {
  dossier: CeeDossier
}

function formatEuros(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
}

export default function DossierListCard({ dossier }: DossierListCardProps) {
  const href = `/espace-artisan/cee/${dossier.id}`

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-sand-300 bg-white p-5 motion-safe:transition-all hover:border-primary-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
      aria-label={`Voir le dossier CEE ${dossier.operation_code}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal-900">
              <FileText className="h-4 w-4 text-primary-500" aria-hidden="true" />
              <span>{dossier.operation_code}</span>
            </div>
            <StatusBadge status={dossier.status} />
          </div>

          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-charcoal-600 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
              <dt className="sr-only">Prime estimée</dt>
              <dd>
                Prime estimée :{' '}
                <span className="font-semibold text-charcoal-900">
                  {formatEuros(dossier.prime_estimee_eur)}
                </span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
              <dt className="sr-only">Date d&apos;engagement</dt>
              <dd>
                Engagement :{' '}
                <span className="font-semibold text-charcoal-900">
                  {formatDate(dossier.date_engagement)}
                </span>
              </dd>
            </div>
          </dl>

          {dossier.postal_code && (
            <p className="mt-2 text-xs text-charcoal-500">
              Zone : {dossier.zone_climatique ?? '—'} · {dossier.postal_code}
            </p>
          )}
        </div>

        <ChevronRight
          className="mt-1 h-5 w-5 shrink-0 text-charcoal-400 transition-transform group-hover:trancharcoal-x-0.5 group-hover:text-primary-500"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
