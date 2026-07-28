/**
 * Sélection des conversions hors ligne dues pour un lead (mig 551).
 *
 * Logique pure, extraite du handler cron : un `route.ts` Next.js n'accepte que
 * les exports reconnus (GET/POST/dynamic/maxDuration…), un export utilitaire y
 * casserait le build.
 */

import type { ClickConversion, ClickIdType, ConversionActionKey } from '@/lib/ads/google-ads-oci'

export interface LeadClickRow {
  id: string
  gclid: string | null
  gbraid: string | null
  wbraid: string | null
  created_at: string
}

export interface LeadAssignmentRow {
  lead_id: string
  status: string
  assigned_at: string
}

/** Un clic ne porte qu'un seul identifiant ; ordre de fréquence décroissante. */
export function resolveClickId(
  lead: LeadClickRow
): { clickId: string; clickIdType: ClickIdType } | null {
  if (lead.gclid) return { clickId: lead.gclid, clickIdType: 'gclid' }
  if (lead.gbraid) return { clickId: lead.gbraid, clickIdType: 'gbraid' }
  if (lead.wbraid) return { clickId: lead.wbraid, clickIdType: 'wbraid' }
  return null
}

/**
 * Conversions dues pour un lead, hors celles déjà journalisées.
 *
 * `lead_quoted` réutilise `assigned_at` faute de colonne `quoted_at` sur
 * `lead_assignments` : cette date est nécessairement postérieure au clic, ce
 * qui satisfait la contrainte Google (conversion >= clic) sans inventer un
 * horodatage.
 */
export function buildPendingConversions(
  lead: LeadClickRow,
  assignments: LeadAssignmentRow[],
  alreadyUploaded: Set<ConversionActionKey>,
  enabledActions: ConversionActionKey[]
): ClickConversion[] {
  const click = resolveClickId(lead)
  if (!click || assignments.length === 0) return []

  const out: ClickConversion[] = []
  const isEnabled = (key: ConversionActionKey): boolean =>
    enabledActions.includes(key) && !alreadyUploaded.has(key)

  if (isEnabled('lead_dispatched')) {
    const firstAssignedAt = assignments.map((a) => a.assigned_at).sort()[0]
    out.push({
      ...click,
      actionKey: 'lead_dispatched',
      conversionAt: new Date(firstAssignedAt),
    })
  }

  if (isEnabled('lead_quoted')) {
    const quotedAt = assignments
      .filter((a) => a.status === 'quoted')
      .map((a) => a.assigned_at)
      .sort()[0]
    if (quotedAt) {
      out.push({
        ...click,
        actionKey: 'lead_quoted',
        conversionAt: new Date(quotedAt),
      })
    }
  }

  return out
}
