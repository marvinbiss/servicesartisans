/**
 * Cron CEE — relances automatiques des dossiers stagnants (brique mandataire CEE).
 *
 * Objectif :
 *   Les dossiers CEE en `brouillon` ou `engagement_signe` qui stagnent
 *   pendant des jours ne reçoivent aucune relance. Ce cron envoie des emails
 *   progressifs au client et à l'artisan pour débloquer la situation.
 *
 * Paliers de relance :
 *   - J+3  : `brouillon` > 3 jours → email client
 *   - J+7  : `brouillon` > 7 jours → email client + artisan
 *   - J+14 : `brouillon` ou `engagement_signe` > 14 jours → email client + artisan
 *
 * Anti-spam :
 *   Avant d'envoyer, on vérifie dans `cee_dossier_events` (event_type='note_added',
 *   payload->relance_type) qu'aucune relance du même palier n'a été enregistrée
 *   dans les dernières 72 h. Après envoi, on insère un événement pour tracer.
 *
 * Auth :
 *   - Fail-closed sur `CRON_SECRET` absent.
 *   - Comparaison en temps constant via `crypto.timingSafeEqual`.
 *
 * Schedule : quotidien (à configurer dans vercel.json).
 */

import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/api/resend-client'
import {
  relanceJ3Client,
  relanceJ7Client,
  relanceJ7Artisan,
  relanceJ14Client,
  relanceJ14Artisan,
} from '@/lib/cee/relance-emails'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Cap dur : max 50 relances par run pour éviter timeout Vercel. */
const MAX_RELANCES_PER_RUN = 50

/** Durées en jours pour les paliers de relance. */
const RELANCE_J3_DAYS = 3
const RELANCE_J7_DAYS = 7
const RELANCE_J14_DAYS = 14

/** Fenêtre anti-spam : pas de relance du même type dans les 72 h. */
const ANTI_SPAM_HOURS = 72

/** Types de relance (stockés dans payload.relance_type). */
type RelanceType = 'relance_j3' | 'relance_j7' | 'relance_j14'

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  try {
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

function extractBearer(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header) return null
  const match = /^Bearer\s+(.+)$/i.exec(header.trim())
  return match ? match[1].trim() : null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgoIso(days: number, now: Date = new Date()): string {
  return new Date(now.getTime() - days * 24 * 3600 * 1000).toISOString()
}

function hoursAgoIso(hours: number, now: Date = new Date()): string {
  return new Date(now.getTime() - hours * 3600 * 1000).toISOString()
}

/** Données minimales d'un dossier avec infos client/artisan jointes. */
interface DossierRelanceRow {
  id: string
  status: string
  devis_id: string | null
  provider_id: string
  created_at: string
  updated_at: string
}

interface ContactInfo {
  clientEmail: string | null
  clientName: string | null
  artisanEmail: string | null
  artisanName: string | null
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const GET = withCronCheckIn('cron-cee-relance', async (request: Request) => {
  // -- Auth ----------------------------------------------------------------
  const expected = process.env.CRON_SECRET
  if (!expected) {
    logger.error('cee-relance: CRON_SECRET not configured', undefined, {
      action: 'cee-relance',
    })
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const provided = extractBearer(request)
  if (!safeCompare(provided, expected)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const startedAt = Date.now()
  const now = new Date()

  const counters = {
    relance_j3: 0,
    relance_j7: 0,
    relance_j14: 0,
    skipped_antispam: 0,
    skipped_no_contact: 0,
    email_errors: 0,
  }
  let budget = MAX_RELANCES_PER_RUN

  try {
    // -- Charger les dossiers candidats ------------------------------------
    // On charge les dossiers en brouillon > 3 jours ET engagement_signe > 14 jours
    // en une seule passe. Le tri par palier sera fait en applicatif.
    const cutoffJ3 = daysAgoIso(RELANCE_J3_DAYS, now)

    const { data: brouillonRows, error: brouillonErr } = await supabase
      .from('cee_dossiers')
      .select('id,status,devis_id,provider_id,created_at,updated_at')
      .eq('status', 'brouillon')
      .lte('created_at', cutoffJ3)
      .order('created_at', { ascending: true })
      .limit(MAX_RELANCES_PER_RUN)

    if (brouillonErr) {
      logger.error('cee-relance: list brouillon failed', brouillonErr, {
        action: 'cee-relance',
      })
    }

    const cutoffJ14 = daysAgoIso(RELANCE_J14_DAYS, now)

    const { data: engagementRows, error: engagementErr } = await supabase
      .from('cee_dossiers')
      .select('id,status,devis_id,provider_id,created_at,updated_at')
      .eq('status', 'engagement_signe')
      .lte('created_at', cutoffJ14)
      .order('created_at', { ascending: true })
      .limit(MAX_RELANCES_PER_RUN)

    if (engagementErr) {
      logger.error('cee-relance: list engagement_signe failed', engagementErr, {
        action: 'cee-relance',
      })
    }

    const allDossiers: DossierRelanceRow[] = [
      ...((brouillonRows ?? []) as DossierRelanceRow[]),
      ...((engagementRows ?? []) as DossierRelanceRow[]),
    ]

    // -- Traiter chaque dossier --------------------------------------------
    for (const dossier of allDossiers) {
      if (budget <= 0) break

      try {
        // Déterminer le palier de relance applicable
        const ageMs = now.getTime() - new Date(dossier.created_at).getTime()
        const ageDays = ageMs / (24 * 3600 * 1000)

        let relanceType: RelanceType
        if (ageDays >= RELANCE_J14_DAYS) {
          relanceType = 'relance_j14'
        } else if (ageDays >= RELANCE_J7_DAYS && dossier.status === 'brouillon') {
          relanceType = 'relance_j7'
        } else if (ageDays >= RELANCE_J3_DAYS && dossier.status === 'brouillon') {
          relanceType = 'relance_j3'
        } else {
          // engagement_signe mais < 14 jours → pas de relance pour ce statut
          continue
        }

        // -- Anti-spam : vérifier si déjà relancé dans les 72 h ----------------
        const antiSpamCutoff = hoursAgoIso(ANTI_SPAM_HOURS, now)

        // On charge les événements note_added récents et on vérifie le payload
        // en applicatif (PostgREST ne filtre pas bien sur JSONB imbriqué).
        const { data: recentRelances, error: relanceCheckErr } = await supabase
          .from('cee_dossier_events')
          .select('id,payload')
          .eq('dossier_id', dossier.id)
          .eq('event_type', 'note_added')
          .gte('created_at', antiSpamCutoff)

        if (relanceCheckErr) {
          logger.warn('cee-relance: relance check failed, skipping dossier', {
            action: 'cee-relance',
            dossier_id: dossier.id,
            error: relanceCheckErr.message,
          })
          continue
        }

        const alreadyRelanced = (recentRelances ?? []).some((evt) => {
          const payload = evt.payload as Record<string, unknown> | null
          return payload?.relance_type === relanceType
        })

        if (alreadyRelanced) {
          counters.skipped_antispam++
          continue
        }

        // -- Récupérer les contacts -----------------------------------------
        const contacts = await getContactInfo(supabase, dossier)
        if (!contacts.clientEmail) {
          counters.skipped_no_contact++
          logger.warn('cee-relance: no client email, skipping', {
            action: 'cee-relance',
            dossier_id: dossier.id,
          })
          continue
        }

        // -- Envoyer les emails selon le palier -----------------------------
        let emailsSent = false

        if (relanceType === 'relance_j3') {
          emailsSent = await sendRelanceJ3(contacts, dossier.id)
        } else if (relanceType === 'relance_j7') {
          emailsSent = await sendRelanceJ7(contacts, dossier.id)
        } else {
          emailsSent = await sendRelanceJ14(contacts, dossier.id)
        }

        if (!emailsSent) {
          counters.email_errors++
          continue
        }

        // -- Tracer l'événement dans cee_dossier_events ---------------------
        const { error: insertErr } = await supabase.from('cee_dossier_events').insert({
          dossier_id: dossier.id,
          event_type: 'note_added',
          actor_type: 'system',
          actor_id: null,
          payload: {
            relance_type: relanceType,
            client_notified: !!contacts.clientEmail,
            artisan_notified: relanceType !== 'relance_j3' && !!contacts.artisanEmail,
          },
        })

        if (insertErr) {
          logger.warn('cee-relance: event insert failed (email already sent)', {
            action: 'cee-relance',
            dossier_id: dossier.id,
            relance_type: relanceType,
            error: insertErr.message,
          })
        }

        counters[relanceType]++
        budget--

        logger.info('cee-relance: relance envoyée', {
          action: 'cee-relance',
          dossier_id: dossier.id,
          relance_type: relanceType,
          status: dossier.status,
        })
      } catch (err) {
        logger.warn('cee-relance: dossier processing failed', {
          action: 'cee-relance',
          dossier_id: dossier.id,
          error: err instanceof Error ? err.message : 'unknown',
        })
      }
    }

    const durationMs = Date.now() - startedAt
    logger.info('cee-relance: run complete', {
      action: 'cee-relance',
      counters,
      duration_ms: durationMs,
      cap_reached: budget === 0,
    })

    return NextResponse.json({
      ok: true,
      counters,
      cap: MAX_RELANCES_PER_RUN,
      duration_ms: durationMs,
    })
  } catch (err) {
    logger.error('cee-relance: fatal error', err instanceof Error ? err : undefined, {
      action: 'cee-relance',
    })
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
})

// ---------------------------------------------------------------------------
// Contact resolution
// ---------------------------------------------------------------------------

async function getContactInfo(
  supabase: ReturnType<typeof createAdminClient>,
  dossier: DossierRelanceRow
): Promise<ContactInfo> {
  const result: ContactInfo = {
    clientEmail: null,
    clientName: null,
    artisanEmail: null,
    artisanName: null,
  }

  // Client : via devis_requests
  if (dossier.devis_id) {
    try {
      const { data: devis, error } = await supabase
        .from('devis_requests')
        .select('client_email,client_name')
        .eq('id', dossier.devis_id)
        .maybeSingle()

      if (!error && devis) {
        result.clientEmail = (
          devis as { client_email: string | null; client_name: string | null }
        ).client_email
        result.clientName = (
          devis as { client_email: string | null; client_name: string | null }
        ).client_name
      }
    } catch {
      // Fail-open : on continue sans email client
    }
  }

  // Artisan : via providers
  if (dossier.provider_id) {
    try {
      const { data: provider, error } = await supabase
        .from('providers')
        .select('email,name')
        .eq('id', dossier.provider_id)
        .maybeSingle()

      if (!error && provider) {
        result.artisanEmail = (provider as { email: string | null; name: string }).email
        result.artisanName = (provider as { email: string | null; name: string }).name
      }
    } catch {
      // Fail-open : on continue sans email artisan
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Email senders (fail-open per dossier)
// ---------------------------------------------------------------------------

async function sendRelanceJ3(contacts: ContactInfo, dossierId: string): Promise<boolean> {
  if (!contacts.clientEmail) return false

  try {
    const template = relanceJ3Client(contacts.clientName || 'Madame, Monsieur')
    await sendEmail({
      to: contacts.clientEmail,
      subject: template.subject,
      html: template.html,
      tags: [
        { name: 'type', value: 'cee_relance' },
        { name: 'relance', value: 'j3' },
      ],
    })
    return true
  } catch (err) {
    logger.warn('cee-relance: email j3 client failed', {
      action: 'cee-relance',
      dossier_id: dossierId,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return false
  }
}

async function sendRelanceJ7(contacts: ContactInfo, dossierId: string): Promise<boolean> {
  let clientOk = false
  let artisanOk = false

  // Email client
  if (contacts.clientEmail) {
    try {
      const template = relanceJ7Client(contacts.clientName || 'Madame, Monsieur')
      await sendEmail({
        to: contacts.clientEmail,
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'type', value: 'cee_relance' },
          { name: 'relance', value: 'j7_client' },
        ],
      })
      clientOk = true
    } catch (err) {
      logger.warn('cee-relance: email j7 client failed', {
        action: 'cee-relance',
        dossier_id: dossierId,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }

  // Email artisan
  if (contacts.artisanEmail) {
    try {
      const template = relanceJ7Artisan(contacts.artisanName || 'Artisan')
      await sendEmail({
        to: contacts.artisanEmail,
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'type', value: 'cee_relance' },
          { name: 'relance', value: 'j7_artisan' },
        ],
      })
      artisanOk = true
    } catch (err) {
      logger.warn('cee-relance: email j7 artisan failed', {
        action: 'cee-relance',
        dossier_id: dossierId,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }

  // Au moins un email envoyé = succès (on trace la relance)
  return clientOk || artisanOk
}

async function sendRelanceJ14(contacts: ContactInfo, dossierId: string): Promise<boolean> {
  let clientOk = false
  let artisanOk = false

  // Email client
  if (contacts.clientEmail) {
    try {
      const template = relanceJ14Client(contacts.clientName || 'Madame, Monsieur')
      await sendEmail({
        to: contacts.clientEmail,
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'type', value: 'cee_relance' },
          { name: 'relance', value: 'j14_client' },
        ],
      })
      clientOk = true
    } catch (err) {
      logger.warn('cee-relance: email j14 client failed', {
        action: 'cee-relance',
        dossier_id: dossierId,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }

  // Email artisan
  if (contacts.artisanEmail) {
    try {
      const template = relanceJ14Artisan(contacts.artisanName || 'Artisan')
      await sendEmail({
        to: contacts.artisanEmail,
        subject: template.subject,
        html: template.html,
        tags: [
          { name: 'type', value: 'cee_relance' },
          { name: 'relance', value: 'j14_artisan' },
        ],
      })
      artisanOk = true
    } catch (err) {
      logger.warn('cee-relance: email j14 artisan failed', {
        action: 'cee-relance',
        dossier_id: dossierId,
        error: err instanceof Error ? err.message : 'unknown',
      })
    }
  }

  return clientOk || artisanOk
}
