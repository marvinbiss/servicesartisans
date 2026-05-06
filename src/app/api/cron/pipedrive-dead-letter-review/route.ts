/**
 * Cron : Pipedrive dead-letter weekly review (audit B/C #7 — 2026-05-04)
 *
 * Pourquoi :
 *   `pipedrive_dead_letter_at IS NOT NULL` reste indéfiniment dans
 *   `devis_requests`. Le retry cron filtre OUT correctement (ligne 61), mais
 *   personne n'est alerté quand un dossier termine en dead-letter (= MAX
 *   tentatives Pipedrive échouées). Ces leads sont des MQL CEE potentiellement
 *   perdus → besoin d'une revue humaine hebdo.
 *
 * Action :
 *   - Liste tous les `devis_requests` avec `pipedrive_dead_letter_at` set,
 *     les groupe par `pipedrive_last_error` (pour identifier patterns récurrents)
 *     puis émet :
 *       (1) Sentry capture avec tag `dead_letter:weekly-review` + count
 *       (2) Email résumé à `ALERTS_EMAIL` ou `partenariats@servicesartisans.fr`
 *           avec table HTML compacte des 50 plus récents.
 *   - Idempotent : ne marque pas les leads "reviewed", on revoit la liste
 *     complète chaque semaine pour traquer la dérive.
 *
 * Schedule : weekly (à ajouter dans vercel.json — lundi 9h Paris).
 */

import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { sendEmail } from '@/lib/notifications/email'
import { verifyCronSecret } from '@/lib/auth/verify-cron-secret'
import { withCronCheckIn } from '@/lib/monitoring/sentry-checkin'

export const dynamic = 'force-dynamic'

const ALERTS_EMAIL = process.env.ALERTS_EMAIL || 'partenariats@servicesartisans.fr'
const MAX_DETAILS_ROWS = 50
const SAMPLE_LOOKBACK_DAYS = 30

// Plan C — C-5 : seuils paliers d'alerting Sentry, configurables via env.
// `info` → debug (pas d'alerte ops), `warning` → on regarde, `error` → escalade visible.
const WARN_THRESHOLD = Number(process.env.ALERTS_DLQ_WARN_THRESHOLD) || 10
const ERROR_THRESHOLD = Number(process.env.ALERTS_DLQ_ERROR_THRESHOLD) || 100

type DeadLetterRow = {
  id: string
  created_at: string | null
  pipedrive_dead_letter_at: string | null
  pipedrive_last_error: string | null
  pipedrive_attempts: number | null
  service_slug: string | null
  city_slug: string | null
  email: string | null
  phone: string | null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmailHtml(rows: DeadLetterRow[], totalCount: number): string {
  const errorBreakdown = new Map<string, number>()
  for (const r of rows) {
    const key = (r.pipedrive_last_error || 'unknown').slice(0, 80)
    errorBreakdown.set(key, (errorBreakdown.get(key) || 0) + 1)
  }
  const breakdownRows = Array.from(errorBreakdown.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([err, n]) => `<tr><td>${escapeHtml(err)}</td><td style="text-align:right">${n}</td></tr>`)
    .join('')

  const recentRows = rows
    .slice(0, MAX_DETAILS_ROWS)
    .map(
      (r) => `
        <tr>
          <td>${escapeHtml(r.id.slice(0, 8))}</td>
          <td>${escapeHtml(r.service_slug || '—')}</td>
          <td>${escapeHtml(r.city_slug || '—')}</td>
          <td>${r.pipedrive_attempts ?? 0}</td>
          <td>${escapeHtml((r.pipedrive_last_error || '').slice(0, 60))}</td>
          <td>${r.pipedrive_dead_letter_at ? new Date(r.pipedrive_dead_letter_at).toLocaleString('fr-FR') : '—'}</td>
        </tr>
      `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html><body style="font-family:Arial,sans-serif;font-size:14px;color:#222">
      <h2 style="color:#C24B2A">Pipedrive dead-letter — revue hebdo</h2>
      <p><strong>${totalCount} leads</strong> ont atteint le seuil max de tentatives Pipedrive et n'ont jamais été synchronisés.</p>
      <p>Action : vérifier ci-dessous, corriger manuellement (Pipedrive ou DB), puis reset <code>pipedrive_dead_letter_at = NULL</code> + <code>pipedrive_attempts = 0</code> pour réessayer.</p>

      <h3>Patterns d'erreur (top des 30 derniers jours)</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#fef2e9"><th>Erreur</th><th>Occurrences</th></tr></thead>
        <tbody>${breakdownRows || '<tr><td colspan="2">aucune</td></tr>'}</tbody>
      </table>

      <h3>${MAX_DETAILS_ROWS} dossiers les plus récents</h3>
      <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:12px">
        <thead><tr style="background:#fef2e9">
          <th>ID</th><th>Service</th><th>Ville</th><th>Attempts</th><th>Dernière erreur</th><th>Dead-letter à</th>
        </tr></thead>
        <tbody>${recentRows || '<tr><td colspan="6">aucun dossier</td></tr>'}</tbody>
      </table>

      <p style="color:#999;font-size:12px;margin-top:30px">
        ServicesArtisans — Cron <code>pipedrive-dead-letter-review</code> hebdo.<br/>
        Pour désactiver : retirer l'entrée correspondante dans <code>vercel.json</code>.
      </p>
    </body></html>
  `
}

function buildEmailText(totalCount: number): string {
  return `${totalCount} leads en dead-letter Pipedrive. Voir l'email HTML pour le détail.`
}

export const GET = withCronCheckIn(
  'cron-pipedrive-dead-letter-review',
  async (request: Request) => {
    if (!process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Serveur mal configuré' }, { status: 500 })
    }
    const authHeader = request.headers.get('authorization')
    if (!verifyCronSecret(authHeader)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const sinceISO = new Date(Date.now() - SAMPLE_LOOKBACK_DAYS * 24 * 3600 * 1000).toISOString()

    // Total count (toutes périodes confondues, pour l'alerte volumétrique)
    const { count: totalCount, error: countError } = await supabase
      .from('devis_requests')
      .select('id', { count: 'exact', head: true })
      .not('pipedrive_dead_letter_at', 'is', null)

    if (countError) {
      logger.error('[pipedrive-dead-letter-review] count failed', countError)
      return NextResponse.json({ error: 'count_failed' }, { status: 500 })
    }

    if (!totalCount || totalCount === 0) {
      // Pas d'alerte si zéro dead-letter — bon signe.
      return NextResponse.json({ ok: true, dead_letter_count: 0 })
    }

    // Détails des 50 plus récents (window 30j) pour l'email
    const { data: rows, error: detailsError } = await supabase
      .from('devis_requests')
      .select(
        'id, created_at, pipedrive_dead_letter_at, pipedrive_last_error, pipedrive_attempts, service_slug, city_slug, email, phone'
      )
      .not('pipedrive_dead_letter_at', 'is', null)
      .gte('pipedrive_dead_letter_at', sinceISO)
      .order('pipedrive_dead_letter_at', { ascending: false })
      .limit(MAX_DETAILS_ROWS)

    if (detailsError) {
      logger.error('[pipedrive-dead-letter-review] details fetch failed', detailsError)
      return NextResponse.json({ error: 'details_failed' }, { status: 500 })
    }

    const recentRows = (rows ?? []) as DeadLetterRow[]

    // Sentry tagged event pour visibilité ops (palier de criticité)
    const level: 'info' | 'warning' | 'error' =
      totalCount >= ERROR_THRESHOLD ? 'error' : totalCount >= WARN_THRESHOLD ? 'warning' : 'info'
    Sentry.captureMessage('Pipedrive dead-letter weekly review', {
      level,
      tags: {
        cron: 'pipedrive-dead-letter-review',
        dead_letter: 'weekly-review',
        severity: level,
      },
      extra: {
        total_count: totalCount,
        recent_30d_count: recentRows.length,
        warn_threshold: WARN_THRESHOLD,
        error_threshold: ERROR_THRESHOLD,
        alerts_email: ALERTS_EMAIL,
      },
    })

    // Email summary à l'équipe partenariats
    let emailSent = false
    let emailError: unknown = null
    try {
      const result = await sendEmail({
        to: ALERTS_EMAIL,
        subject: `[ServicesArtisans] Pipedrive dead-letter : ${totalCount} leads à réviser`,
        html: buildEmailHtml(recentRows, totalCount),
        text: buildEmailText(totalCount),
        replyTo: 'tech@servicesartisans.fr',
      })
      emailSent = result.success
      if (!emailSent) {
        emailError = result.error
        logger.error('[pipedrive-dead-letter-review] email send failed', { error: result.error })
      }
    } catch (err) {
      emailError = err
      logger.error('[pipedrive-dead-letter-review] email throw', err)
    }

    // Plan C — C-5 : si l'email échoue ALORS qu'on a des dead-letters à
    // signaler, on capture une exception Sentry séparée (le `captureMessage`
    // ci-dessus est info-only). Sans ça l'opacité de DLQ-2 persiste.
    if (!emailSent && totalCount > 0) {
      Sentry.captureException(
        emailError instanceof Error
          ? emailError
          : new Error(`DLQ alert email failed: ${String(emailError ?? 'unknown')}`),
        {
          tags: {
            cron: 'pipedrive-dead-letter-review',
            failure: 'email_send',
            critical: 'true',
          },
          extra: {
            total_count: totalCount,
            recipient: ALERTS_EMAIL,
          },
        }
      )
    }

    return NextResponse.json({
      ok: true,
      dead_letter_count: totalCount,
      recent_30d_count: recentRows.length,
      email_sent: emailSent,
    })
  }
)
