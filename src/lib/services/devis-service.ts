/**
 * Devis Service — Business logic for quote request processing
 * Framework-agnostic: no NextRequest/NextResponse
 */

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/api/resend-client'
import { dispatchLead } from '@/app/actions/dispatch'
import { logLeadEvent } from '@/lib/dashboard/events'
import { syncDevisRequestToPipedrive } from '@/lib/integrations/pipedrive'
import { qualifyDevisForCee } from '@/lib/cee/qualify'
import { runCeeDispatchFireAndForget } from '@/lib/cee/dispatcher-integration'
import { createInvitationForDevis } from '@/lib/reviews/invitations'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const serviceNames: Record<string, string> = {
  plombier: 'Plombier',
  electricien: 'Électricien',
  serrurier: 'Serrurier',
  chauffagiste: 'Chauffagiste',
  'peintre-en-batiment': 'Peintre en bâtiment',
  couvreur: 'Couvreur',
  menuisier: 'Menuisier',
  macon: 'Maçon',
  carreleur: 'Carreleur',
  vitrier: 'Vitrier',
  climaticien: 'Climaticien',
  cuisiniste: 'Cuisiniste',
  general: 'Demande générale',
}

const urgencyLabels: Record<string, string> = {
  urgent: 'Urgent',
  semaine: 'Cette semaine',
  mois: 'Ce mois-ci',
  flexible: 'Pas urgent',
}

const urgencyDbMap: Record<string, string> = {
  urgent: 'urgent',
  semaine: 'semaine',
  mois: 'mois',
  flexible: 'flexible',
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DevisInput {
  service: string
  urgency: string
  budget?: string
  description?: string
  codePostal?: string
  ville?: string
  nom?: string
  email?: string
  telephone: string
}

export type DevisResult =
  | {
      success: true
      id: string
      artisans_notified: number
      artisans_found: boolean
      cee_eligible: boolean
      cee_operation_codes?: string[]
    }
  | { success: false; error: string; code: 'duplicate' | 'email_rate_limit' | 'db_error' }

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a human-readable service name, with fallback for unknown slugs */
export function resolveServiceName(service: string): string {
  return (
    serviceNames[service] || service.charAt(0).toUpperCase() + service.slice(1).replace(/-/g, ' ')
  )
}

/** Escape HTML special chars to prevent XSS in email templates */
function htmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export { urgencyLabels }

// ---------------------------------------------------------------------------
// Duplicate & rate limit checks
// ---------------------------------------------------------------------------

export async function checkDuplicate(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
  serviceName: string,
  ville: string
): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: existing } = await supabase
    .from('devis_requests')
    .select('id')
    .eq('client_email', email)
    .eq('service_name', serviceName)
    .eq('city', ville)
    .gte('created_at', oneHourAgo)
    .limit(1)

  return !!(existing && existing.length > 0)
}

export async function checkEmailRateLimit(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('devis_requests')
    .select('id', { count: 'exact', head: true })
    .eq('client_email', email)
    .gte('created_at', oneDayAgo)

  return count !== null && count >= 5
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------

export async function processDevis(
  data: DevisInput,
  clientId: string | null
): Promise<DevisResult> {
  const supabase = createAdminClient()
  const serviceName = resolveServiceName(data.service)

  // --- Duplicate check ---
  const isDuplicate = await checkDuplicate(
    supabase,
    data.email || '',
    serviceName,
    data.ville || ''
  )
  if (isDuplicate) {
    return { success: false, error: 'duplicate', code: 'duplicate' }
  }

  // --- Email rate limit ---
  if (data.email) {
    const isLimited = await checkEmailRateLimit(supabase, data.email)
    if (isLimited) {
      return { success: false, error: 'email_rate_limit', code: 'email_rate_limit' }
    }
  }

  // --- Store in DB ---
  const { data: lead, error: dbError } = await supabase
    .from('devis_requests')
    .insert({
      client_id: clientId,
      client_name: data.nom || 'Rappel',
      client_email: data.email || '',
      client_phone: data.telephone,
      service_name: serviceName,
      description: data.description || 'Demande de devis',
      budget: data.budget || null,
      urgency: urgencyDbMap[data.urgency] || 'normal',
      city: data.ville || null,
      postal_code: data.codePostal || '',
      status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    logger.error('Database error', dbError)
    return { success: false, error: 'db_error', code: 'db_error' }
  }

  // --- CEE qualification (best-effort) ---
  let ceeResult: { eligible: boolean; codes: string[] } = { eligible: false, codes: [] }
  try {
    ceeResult = await qualifyDevisForCee(supabase, data.service)
    if (ceeResult.eligible) {
      await supabase
        .from('devis_requests')
        .update({
          cee_eligible: true,
          cee_operation_codes: ceeResult.codes,
          cee_qualified_at: new Date().toISOString(),
        })
        .eq('id', lead.id)
    }
  } catch (err) {
    logger.error('CEE qualification failed', err)
  }

  // --- Log 'created' event ---
  logLeadEvent(lead.id, 'created', { actorId: clientId ?? undefined }).catch((err) =>
    logger.error('Failed to log lead created event', err)
  )

  // --- Pipedrive CRM sync (4s timeout race) ---
  await syncWithPipedriveTimeout(lead.id)

  // --- Dispatch to artisans ---
  const assignedProviders = await dispatchToArtisans(lead.id, data, serviceName, ceeResult)

  // --- CEE dispatch (if eligible) ---
  if (ceeResult.eligible && assignedProviders.length > 0) {
    await ceeDispatchWithTimeout(
      supabase,
      lead.id,
      clientId,
      data.service,
      data.codePostal ?? null,
      assignedProviders,
      data.nom ?? null,
      data.email ?? null,
      serviceName,
      data.ville ?? null
    )
  }

  // --- Log dispatch events ---
  if (assignedProviders.length > 0) {
    logLeadEvent(lead.id, 'dispatched', {
      metadata: { count: assignedProviders.length },
    }).catch((err) => logger.error('Failed to log lead dispatched event', err))

    supabase
      .from('analytics_events')
      .insert({
        event_type: 'devis_completed',
        metadata: {
          devisId: lead.id,
          serviceSlug: data.service,
          city: data.ville,
          artisanCount: assignedProviders.length,
        },
      })
      .then(({ error: analyticsErr }) => {
        if (analyticsErr) logger.error('Failed to log devis_completed event', analyticsErr)
      })
  }

  // --- Send emails (best-effort) ---
  await sendDevisEmails(data, serviceName, lead.id)

  // --- Schedule review invitation (fire-and-forget) ---
  if (data.email && assignedProviders.length > 0) {
    createInvitationForDevis({
      devisRequestId: lead.id,
      clientEmail: data.email,
      clientName: data.nom || null,
      serviceName,
      providerId: assignedProviders[0] ?? null,
    }).catch((err) => logger.error('[review_invitations] schedule failed', err))
  }

  return {
    success: true,
    id: lead.id,
    artisans_notified: assignedProviders.length,
    artisans_found: assignedProviders.length > 0,
    cee_eligible: ceeResult.eligible,
    ...(ceeResult.eligible && { cee_operation_codes: ceeResult.codes }),
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function syncWithPipedriveTimeout(leadId: string): Promise<void> {
  // Audit 2026-04-25 (agent #5 BLOCKER) : auparavant, en cas de timeout 4s,
  // le `syncDevisRequestToPipedrive` continuait en arrière-plan mais Vercel
  // pouvait killer la lambda dès que la réponse user était envoyée. Résultat :
  // le sync n'écrivait jamais `pipedrive_next_retry_at` et le retry cron
  // (qui filtre `WHERE pipedrive_next_retry_at <= now()`) ne voyait jamais
  // ces leads → perte silencieuse côté CRM.
  //
  // Nouveau comportement : si timeout, on marque immédiatement le lead comme
  // "à retenter dans 5 min" pour que le retry cron le ramasse. Si le sync
  // interne réussit derrière (rare mais possible si la lambda survit), il
  // overwrite avec `pipedrive_synced_at` non-null + `pipedrive_next_retry_at = null`.
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null
  try {
    await Promise.race([
      syncDevisRequestToPipedrive(leadId),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => reject(new Error('Pipedrive sync timeout (4s)')), 4000)
      }),
    ])
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('Pipedrive sync error', err)

    // Schedule un retry sous 5 min côté DB.
    if (message.includes('timeout')) {
      try {
        const supabase = createAdminClient()
        const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString()
        await supabase
          .from('devis_requests')
          .update({
            pipedrive_sync_error: message.slice(0, 500),
            pipedrive_next_retry_at: nextRetryAt,
          })
          .eq('id', leadId)
          .is('pipedrive_deal_id', null) // ne pas écraser si déjà sync
      } catch (dbErr) {
        logger.error('Pipedrive timeout DLQ enqueue failed', dbErr as Error, { leadId })
      }
    }
  } finally {
    if (timeoutHandle !== null) clearTimeout(timeoutHandle)
  }
}

async function dispatchToArtisans(
  leadId: string,
  data: DevisInput,
  serviceName: string,
  ceeResult: { eligible: boolean }
): Promise<string[]> {
  const urgencyMap: Record<string, string> = {
    urgent: 'urgent',
    semaine: 'semaine',
    mois: 'mois',
    flexible: 'flexible',
  }
  return dispatchLead(leadId, {
    serviceName,
    city: data.ville,
    postalCode: data.codePostal,
    urgency: urgencyMap[data.urgency] || 'normal',
    sourceTable: 'devis_requests',
    ceeEligible: ceeResult.eligible,
  }).catch((err) => {
    logger.error('Failed to dispatch lead', err)
    return []
  })
}

async function ceeDispatchWithTimeout(
  supabase: ReturnType<typeof createAdminClient>,
  leadId: string,
  clientId: string | null,
  serviceSlug: string,
  postalCode: string | null,
  candidateProviderIds: string[],
  clientName: string | null,
  clientEmail: string | null,
  serviceName: string | null,
  ville: string | null
): Promise<void> {
  const CEE_DISPATCH_TIMEOUT_MS = 8000
  const TIMEOUT_SENTINEL = Symbol('cee-dispatch-timeout')
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null
  try {
    const raceResult = await Promise.race([
      runCeeDispatchFireAndForget(supabase, {
        devisId: leadId,
        clientId,
        serviceSlug,
        postalCode,
        candidateProviderIds,
        clientName,
        clientEmail,
        serviceName,
        ville,
      }),
      new Promise<typeof TIMEOUT_SENTINEL>((resolve) => {
        timeoutHandle = setTimeout(() => resolve(TIMEOUT_SENTINEL), CEE_DISPATCH_TIMEOUT_MS)
      }),
    ])
    if (raceResult === TIMEOUT_SENTINEL) {
      logger.warn('cee-dispatch: timeout exceeded, fire-and-forget aborted', {
        action: 'cee-dispatch',
        reason: 'timeout_exceeded',
        timeoutMs: CEE_DISPATCH_TIMEOUT_MS,
        devisId: leadId,
      })
    }
  } catch (ceeErr) {
    logger.warn('cee-dispatch: unexpected throw in fire-and-forget', {
      action: 'cee-dispatch',
      devisId: leadId,
      error: ceeErr instanceof Error ? ceeErr.message : String(ceeErr),
    })
  } finally {
    if (timeoutHandle !== null) clearTimeout(timeoutHandle)
  }
}

async function sendDevisEmails(
  data: DevisInput,
  serviceName: string,
  leadId: string
): Promise<void> {
  let resend: ReturnType<typeof getResendClient> | null = null
  try {
    resend = getResendClient()
  } catch (emailInitError) {
    logger.error('Resend not configured, skipping emails', emailInitError)
    return
  }

  const fromEmail = process.env.FROM_EMAIL || 'noreply@servicesartisans.fr'
  const emailPromises: Promise<unknown>[] = []

  // Confirmation to client
  if (data.email) {
    emailPromises.push(
      resend.emails.send({
        from: fromEmail,
        to: data.email,
        subject: 'Votre demande de devis - ServicesArtisans',
        html: `
          <h2>Bonjour ${htmlEscape(data.nom || 'Rappel')},</h2>
          <p>Nous avons bien reçu votre demande de devis. Voici le récapitulatif :</p>
          <ul>
            <li><strong>Service :</strong> ${htmlEscape(serviceName)}</li>
            <li><strong>Délai :</strong> ${htmlEscape(urgencyLabels[data.urgency] || data.urgency)}</li>
            ${data.ville ? `<li><strong>Ville :</strong> ${htmlEscape(data.ville)}</li>` : ''}
            ${data.description ? `<li><strong>Description :</strong> ${htmlEscape(data.description)}</li>` : ''}
          </ul>
          <p><strong>Que se passe-t-il maintenant ?</strong></p>
          <p>Nous allons transmettre votre demande aux artisans disponibles dans votre région. Un conseiller vous rappelle rapidement.</p>
          <p>Cordialement,<br />L'équipe ServicesArtisans</p>
          <p style="color: #666; font-size: 12px;">
            <a href="https://servicesartisans.fr">servicesartisans.fr</a>
          </p>
        `,
      })
    )
  }

  // Notification to admin
  emailPromises.push(
    resend.emails.send({
      from: fromEmail,
      to: 'contact@servicesartisans.fr',
      subject: `[Nouveau Devis] ${serviceName} - ${data.ville || 'France'}`,
      html: `
        <h2>Nouvelle demande de devis</h2>
        <h3>Client</h3>
        <ul>
          <li><strong>Nom :</strong> ${htmlEscape(data.nom || 'Rappel')}</li>
          <li><strong>Email :</strong> ${htmlEscape(data.email || 'Non fourni')}</li>
          <li><strong>Téléphone :</strong> ${htmlEscape(data.telephone)}</li>
        </ul>
        <h3>Demande</h3>
        <ul>
          <li><strong>Service :</strong> ${htmlEscape(serviceName)}</li>
          <li><strong>Délai :</strong> ${htmlEscape(urgencyLabels[data.urgency] || data.urgency)}</li>
          <li><strong>Ville :</strong> ${htmlEscape(data.ville || 'Non précisé')}</li>
          <li><strong>Code postal :</strong> ${htmlEscape(data.codePostal || 'Non précisé')}</li>
          <li><strong>Budget :</strong> ${htmlEscape(data.budget || 'Non précisé')}</li>
          <li><strong>Description :</strong> ${htmlEscape(data.description || 'Non précisé')}</li>
        </ul>
        <p>ID: ${leadId}</p>
      `,
    })
  )

  const emailResults = await Promise.allSettled(emailPromises)
  emailResults.forEach((result, i) => {
    if (result.status === 'rejected') {
      logger.error(`Failed to send email ${i}`, result.reason)
    }
  })
}
