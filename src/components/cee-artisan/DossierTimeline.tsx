/**
 * DossierTimeline — affiche le journal d'audit d'un dossier CEE
 * (`cee_dossier_events`, migration 402) sous forme de timeline verticale.
 *
 * Server Component — pure render à partir d'une liste d'events déjà triés.
 */

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileUp,
  MessageSquare,
  UserPlus,
  XCircle,
  Euro,
} from 'lucide-react'
import type { CeeDossierEvent, CeeDossierEventType } from '@/lib/cee/dossier-types'
import { getStatusLabel } from './StatusBadge'

interface DossierTimelineProps {
  events: CeeDossierEvent[]
}

const EVENT_ICONS: Record<CeeDossierEventType, typeof Activity> = {
  status_change: Activity,
  justificatif_uploaded: FileUp,
  justificatif_verified: CheckCircle2,
  delegataire_assigned: UserPlus,
  note_added: MessageSquare,
  prime_adjusted: Euro,
  rejection: XCircle,
}

const EVENT_LABELS: Record<CeeDossierEventType, string> = {
  status_change: 'Changement de statut',
  justificatif_uploaded: 'Pièce justificative ajoutée',
  justificatif_verified: 'Pièce vérifiée',
  delegataire_assigned: 'Délégataire assigné',
  note_added: 'Note ajoutée',
  prime_adjusted: 'Prime ajustée',
  rejection: 'Dossier rejeté',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function describeEvent(event: CeeDossierEvent): string {
  if (event.event_type === 'status_change' && event.from_status && event.to_status) {
    return `${getStatusLabel(event.from_status)} → ${getStatusLabel(event.to_status)}`
  }
  if (event.event_type === 'justificatif_uploaded') {
    const payload = event.payload as { label?: string; code?: string } | null
    return payload?.label || payload?.code || 'Pièce ajoutée'
  }
  return EVENT_LABELS[event.event_type] ?? 'Événement'
}

export default function DossierTimeline({ events }: DossierTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-sand-300 bg-sand-50 p-6 text-center">
        <Activity className="mx-auto h-8 w-8 text-charcoal-400" aria-hidden="true" />
        <p className="mt-2 text-sm text-charcoal-500">
          Aucun événement enregistré pour ce dossier.
        </p>
      </div>
    )
  }

  return (
    <ol
      data-testid="timeline-vertical-line"
      className="relative space-y-5 pl-6 before:pointer-events-none before:absolute before:left-2 before:top-1 before:h-[calc(100%-0.5rem)] before:w-px before:bg-sand-300 before:content-['']"
      aria-label="Chronologie du dossier"
    >
      {events.map((event) => {
        const Icon = EVENT_ICONS[event.event_type] ?? Activity
        return (
          <li key={event.id} className="relative">
            <span
              className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-sand-300 bg-white"
              aria-hidden="true"
            >
              <Icon className="h-3 w-3 text-primary-500" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-charcoal-900">
                {EVENT_LABELS[event.event_type] ?? 'Événement'}
              </p>
              <p className="text-sm text-charcoal-600">
                {event.event_type === 'status_change' ? (
                  <span className="inline-flex items-center gap-1.5">
                    {event.from_status && getStatusLabel(event.from_status)}
                    <ArrowRight className="h-3.5 w-3.5 text-charcoal-400" aria-hidden="true" />
                    {event.to_status && getStatusLabel(event.to_status)}
                  </span>
                ) : (
                  describeEvent(event)
                )}
              </p>
              <time dateTime={event.created_at} className="text-xs text-charcoal-400">
                {formatDateTime(event.created_at)}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
