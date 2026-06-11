/**
 * Mapping cycle de vie Iopole → état interne SA.
 *
 * Statuts Iopole observés (sandbox : accepted / refused / disputed / paymentSent ;
 * + dépôt). ⚠️ Liste à confirmer sur le Swagger réel (api.ppd.iopole.fr/v1/api) —
 * d'où le fallback neutre. `transmission_status` = état d'acheminement interne ;
 * `invoiceStatus` = statut métier (provider_invoices.status, enum invoice_doc_status).
 */

import type { InvoiceStatus } from '@/lib/devis'

export type TransmissionStatus = 'pending' | 'submitted' | 'delivered' | 'rejected' | 'error'

export type MappedStatus = {
  transmission?: TransmissionStatus
  invoice?: InvoiceStatus
}

/**
 * Mappe un statut OU un eventType Iopole (ex. `INVOICE_OUTBOUND_ACCEPTED`,
 * `paymentSent`) vers l'état interne. Détection par sous-chaîne (insensible à la
 * casse / aux séparateurs) car les libellés d'événements varient.
 * Ordre = priorité (paiement/annulation l'emportent sur l'acheminement).
 */
export function mapIopoleStatus(rawStatus: string): MappedStatus {
  const s = rawStatus
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '')
  const has = (...needles: string[]) => needles.some((n) => s.includes(n))

  if (has('cancel', 'annul')) return { invoice: 'annulee' }
  if (has('payment', 'paid', 'cashed', 'encaiss')) {
    return { transmission: 'delivered', invoice: 'payee' }
  }
  if (has('refus', 'reject')) return { transmission: 'rejected' }
  if (has('dispute', 'litige')) return { transmission: 'delivered' }
  if (has('accept', 'approv', 'receiv', 'deliver')) return { transmission: 'delivered' }
  if (has('deposit', 'submit', 'sent', 'pending')) return { transmission: 'submitted' }
  return {}
}
