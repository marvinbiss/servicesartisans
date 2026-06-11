import type { QuoteStatus } from '@/lib/devis'

const STATUS_META: Record<QuoteStatus, { label: string; cls: string }> = {
  brouillon: { label: 'Brouillon', cls: 'bg-sand-100 text-charcoal-600' },
  envoye: { label: 'Envoyé', cls: 'bg-primary-100 text-primary-700' },
  vu: { label: 'Vu', cls: 'bg-accent-100 text-accent-700' },
  accepte: { label: 'Accepté', cls: 'bg-green-100 text-green-700' },
  refuse: { label: 'Refusé', cls: 'bg-red-100 text-red-700' },
  expire: { label: 'Expiré', cls: 'bg-amber-100 text-amber-700' },
}

export function DevisStatusBadge({ status }: { status: QuoteStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.brouillon
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>{meta.label}</span>
  )
}
