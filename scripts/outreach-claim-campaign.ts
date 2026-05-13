/**
 * Outreach Claim Campaign — Cold email to RGE-active providers who haven't
 * claimed their fiche yet. Drives the supply-side flywheel that gates
 * mandataire CEE break-even (~250-400 claimed actifs / 49K base).
 *
 * Targets:
 *   - providers.is_active = true
 *   - providers.user_id IS NULL (not claimed)
 *   - providers.email is a valid pro email
 *   - at least one rge_qualifications[].date_fin > now (RGE actif)
 *   - NOT already in provider_outreach_log within RESEND_WINDOW_DAYS
 *
 * Each successful send writes one row to provider_outreach_log with a
 * URL-safe opt_out_token (32-byte base64url). Opt-out 1-clic via
 * /api/outreach/opt-out/[token] (cf. migration 500).
 *
 * Usage:
 *   npx tsx scripts/outreach-claim-campaign.ts --dry-run
 *   npx tsx scripts/outreach-claim-campaign.ts --limit 50
 *   npx tsx scripts/outreach-claim-campaign.ts --dept 75
 *   npx tsx scripts/outreach-claim-campaign.ts --campaign claim-2026-Q2
 *
 * Validation pre-send: 49K artisans cible (memory supply-strategy post-RGE-pivot).
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { randomBytes } from 'node:crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ServicesArtisans <noreply@servicesartisans.fr>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const limitIdx = args.indexOf('--limit')
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) || 100 : 200
const deptIdx = args.indexOf('--dept')
const DEPT = deptIdx >= 0 ? args[deptIdx + 1] : null
const campaignIdx = args.indexOf('--campaign')
const CAMPAIGN =
  campaignIdx >= 0 ? args[campaignIdx + 1] : `claim-${new Date().toISOString().slice(0, 7)}`

const BATCH_SIZE = 10
const DELAY_MS = 1500
const RESEND_WINDOW_DAYS = 60

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})
const resend = new Resend(RESEND_KEY)

type RgeQualification = {
  qualification: string
  date_fin?: string | null
}

type ProviderRow = {
  id: string
  name: string
  slug: string | null
  stable_id: string | null
  email: string | null
  specialty: string | null
  address_city: string | null
  address_department: string | null
  rge_qualifications: RgeQualification[] | null
}

function hasActiveRgeQualification(qualifs: RgeQualification[] | null): boolean {
  if (!qualifs || qualifs.length === 0) return false
  const now = Date.now()
  return qualifs.some((q) => {
    if (!q?.date_fin) return false
    const t = Date.parse(q.date_fin)
    return Number.isFinite(t) && t > now
  })
}

function buildArtisanUrl(p: ProviderRow): string {
  const path =
    p.slug && p.address_city
      ? `/services/${encodeURIComponent(p.specialty || 'artisan')}/${encodeURIComponent(p.address_city.toLowerCase().replace(/\s+/g, '-'))}/${p.stable_id || p.id}`
      : `/services/artisan/france/${p.stable_id || p.id}`
  return `${SITE_URL}${path}?claim=1`
}

function buildOptOutUrl(token: string): string {
  return `${SITE_URL}/api/outreach/opt-out/${token}`
}

function buildClaimEmail(p: ProviderRow, optOutUrl: string) {
  const firstName = (p.name || 'Artisan').split(/\s+/)[0]
  const city = p.address_city || 'votre zone'
  const profileUrl = buildArtisanUrl(p)
  const activeQualifs = (p.rge_qualifications || [])
    .filter((q) => q.date_fin && Date.parse(q.date_fin) > Date.now())
    .map((q) => q.qualification)
    .slice(0, 4)

  const subject = `${firstName}, votre fiche RGE est en ligne sur ServicesArtisans`

  const qualifBadge =
    activeQualifs.length > 0
      ? `<p style="margin:8px 0 0;font-size:13px;color:#475569">Qualifications affichées : <strong>${activeQualifs.join(', ')}</strong></p>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a">
<div style="max-width:580px;margin:0 auto;padding:32px 16px">

  <div style="text-align:center;margin-bottom:24px">
    <h1 style="margin:0;font-size:20px;color:#0f172a">ServicesArtisans</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#64748b">Le 1er annuaire 100% artisans RGE certifiés</p>
  </div>

  <div style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;padding:28px;margin-bottom:20px">
    <p style="margin:0 0 16px;font-size:16px">Bonjour ${firstName},</p>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.6">
      Votre entreprise <strong>${p.name}</strong> est référencée sur ServicesArtisans à ${city} grâce au registre RGE de l&apos;ADEME.
      ${qualifBadge}
    </p>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.6">
      Des particuliers consultent actuellement votre fiche pour des projets de rénovation énergétique (MaPrimeRénov&apos;, CEE).
      <strong>Revendiquez-la en 30 secondes</strong> pour&nbsp;:
    </p>

    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:1.8">
      <li>Recevoir les demandes de devis qui vous correspondent (lead exclusif, jamais partagé)</li>
      <li>Compléter votre profil (photos, services, tarifs)</li>
      <li>Répondre aux avis clients et publier vos chantiers</li>
      <li>Accéder au mandat CEE pour vos clients (commission ServicesArtisans Energy)</li>
    </ul>

    <div style="text-align:center;margin:24px 0 8px">
      <a href="${profileUrl}" style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:15px">
        Revendiquer ma fiche →
      </a>
    </div>

    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center">
      Une vérification SIREN/SIRET sous 24h, sans paperasse.
    </p>
  </div>

  <div style="font-size:11px;color:#94a3b8;text-align:center;line-height:1.6">
    <p style="margin:0 0 6px">ServicesArtisans · Mise en relation entre particuliers et artisans RGE certifiés.</p>
    <p style="margin:0">
      <a href="${optOutUrl}" style="color:#94a3b8">Ne plus recevoir d&apos;email de ce type</a>
    </p>
  </div>

</div>
</body>
</html>`

  const text = `Bonjour ${firstName},

Votre entreprise ${p.name} est référencée sur ServicesArtisans à ${city} via le registre RGE de l'ADEME.
${activeQualifs.length > 0 ? `Qualifications : ${activeQualifs.join(', ')}\n` : ''}
Des particuliers consultent votre fiche pour des projets MaPrimeRénov'/CEE.

Revendiquez-la en 30 secondes pour recevoir les demandes de devis qui vous correspondent (lead exclusif, jamais partagé).

→ ${profileUrl}

Vérification SIREN/SIRET sous 24h.

---
ServicesArtisans · Annuaire 100% artisans RGE certifiés.
Ne plus recevoir d'email : ${optOutUrl}`

  return { subject, html, text }
}

async function fetchTargets(): Promise<ProviderRow[]> {
  const cutoff = new Date(Date.now() - RESEND_WINDOW_DAYS * 24 * 3600 * 1000).toISOString()

  const { data: recent, error: rErr } = await supabase
    .from('provider_outreach_log')
    .select('provider_id')
    .gte('sent_at', cutoff)

  if (rErr) {
    console.error('outreach_log query failed:', rErr.message)
    process.exit(1)
  }

  const excludedIds = new Set((recent || []).map((r) => r.provider_id))

  let query = supabase
    .from('providers')
    .select(
      'id, name, slug, stable_id, email, specialty, address_city, address_department, rge_qualifications'
    )
    .eq('is_active', true)
    .is('user_id', null)
    .not('email', 'is', null)
    .neq('email', '')
    .not('rge_qualifications', 'is', null)
    .order('rating_average', { ascending: false, nullsFirst: false })
    .limit(LIMIT * 3)

  if (DEPT) {
    query = query.eq('address_department', DEPT)
  }

  const { data, error } = await query

  if (error) {
    console.error('providers query failed:', error.message)
    process.exit(1)
  }

  return (data || [])
    .filter((p): p is ProviderRow => !!p.email && p.email.includes('@'))
    .filter((p) => !excludedIds.has(p.id))
    .filter((p) => hasActiveRgeQualification(p.rge_qualifications))
    .slice(0, LIMIT)
}

async function logOutreach(
  providerId: string,
  email: string,
  optOutToken: string,
  status: 'sent' | 'bounced'
): Promise<void> {
  const { error } = await supabase.from('provider_outreach_log').insert({
    provider_id: providerId,
    channel: 'manual',
    campaign: CAMPAIGN,
    email_to: email,
    status,
    opt_out_token: optOutToken,
    metadata: { script: 'outreach-claim-campaign.ts' },
  })
  if (error) {
    console.error(`log insert failed for ${providerId}:`, error.message)
  }
}

async function main() {
  console.log('=== Outreach Claim Campaign ===')
  console.log(`Mode      : ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Limit     : ${LIMIT}`)
  console.log(`Dept      : ${DEPT || 'all'}`)
  console.log(`Campaign  : ${CAMPAIGN}`)
  console.log(`Resend win: ${RESEND_WINDOW_DAYS}d`)
  console.log('')

  const targets = await fetchTargets()
  if (targets.length === 0) {
    console.log('No eligible providers found.')
    process.exit(0)
  }

  console.log(`${targets.length} RGE-active providers eligible.`)
  console.log('')

  let sent = 0
  let failed = 0

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE)

    for (const p of batch) {
      const optOutToken = randomBytes(32).toString('base64url')
      const optOutUrl = buildOptOutUrl(optOutToken)
      const { subject, html, text } = buildClaimEmail(p, optOutUrl)

      if (DRY_RUN) {
        console.log(`[DRY] ${p.email} — ${p.name} — ${subject}`)
        sent++
        continue
      }

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: p.email!,
          subject,
          html,
          text,
          tags: [
            { name: 'type', value: 'claim-outreach' },
            { name: 'campaign', value: CAMPAIGN },
            { name: 'provider_id', value: p.id },
          ],
        })
        await logOutreach(p.id, p.email!, optOutToken, 'sent')
        console.log(`[OK]  ${p.email} — ${p.name}`)
        sent++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[ERR] ${p.email} — ${msg}`)
        await logOutreach(p.id, p.email!, optOutToken, 'bounced')
        failed++
      }
    }

    if (!DRY_RUN && i + BATCH_SIZE < targets.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  console.log('')
  console.log('=== Results ===')
  console.log(`Sent   : ${sent}`)
  console.log(`Failed : ${failed}`)
  console.log(`Total  : ${targets.length}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
