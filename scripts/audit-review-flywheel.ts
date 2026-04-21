#!/usr/bin/env npx tsx
/**
 * audit-review-flywheel.ts — Diagnose why 0 reviews were created from 31
 * invitations over the last 30 days (CEO plan Pilier 2.C).
 *
 * Runs read-only:
 *  1. Count invitations by status (pending-scheduled / ready-to-send /
 *     sent-awaiting-response / completed / expired / max-attempts-reached)
 *  2. Show the 10 oldest pending-scheduled + 10 oldest ready-to-send
 *  3. Count delivery failures (attempts > 0, last_error)
 *  4. Verify cron configuration (vercel.json) and env (CRON_SECRET)
 *  5. Inspect actual `reviews` table schema (service_slug column was missing
 *     in the audit — need real column names for flywheel measurement)
 *  6. Simulate an invitation creation + token lookup end-to-end (if --simulate)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import {
  createInvitationToken,
  hashInvitationToken,
  INVITATION_DELAY_MS,
  INVITATION_EXPIRY_MS,
} from '../src/lib/reviews/invitation-token'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ROOT = path.join(__dirname, '..')

async function auditStatuses() {
  const nowIso = new Date().toISOString()
  console.log(`\n======= 1) review_invitations breakdown =======`)
  const [scheduledFuture, readyNotSent, sentAwaiting, completed, expired, maxAttempts] =
    await Promise.all([
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .is('sent_at', null)
        .is('completed_at', null)
        .gt('scheduled_at', nowIso),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .is('sent_at', null)
        .is('completed_at', null)
        .lte('scheduled_at', nowIso)
        .gt('expires_at', nowIso)
        .lt('attempts', 3),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .not('sent_at', 'is', null)
        .is('completed_at', null)
        .gt('expires_at', nowIso),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .not('completed_at', 'is', null),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', nowIso)
        .is('completed_at', null),
      supabase
        .from('review_invitations')
        .select('*', { count: 'exact', head: true })
        .is('sent_at', null)
        .is('completed_at', null)
        .gte('attempts', 3),
    ])

  console.log(`  scheduled future (not yet due):  ${scheduledFuture.count ?? '?'}`)
  console.log(`  ready-to-send (overdue, unsent): ${readyNotSent.count ?? '?'}`)
  console.log(`  sent, awaiting response:         ${sentAwaiting.count ?? '?'}`)
  console.log(`  completed (review submitted):    ${completed.count ?? '?'}`)
  console.log(`  expired unsubmitted:             ${expired.count ?? '?'}`)
  console.log(`  max-attempts-reached (failure):  ${maxAttempts.count ?? '?'}`)
}

async function oldestPending() {
  console.log(`\n======= 2) Oldest pending invitations =======`)
  const { data: readyNow } = await supabase
    .from('review_invitations')
    .select('id, devis_request_id, client_email, service_name, scheduled_at, attempts, last_error')
    .is('sent_at', null)
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
  console.log(`  READY TO SEND (${readyNow?.length ?? 0}):`)
  for (const r of readyNow ?? []) {
    console.log(
      `    ${r.scheduled_at} attempts=${r.attempts} ${r.service_name ?? '?'} -> ${r.client_email}${r.last_error ? '  [ERR: ' + r.last_error.slice(0, 60) + ']' : ''}`
    )
  }

  const { data: scheduledSoon } = await supabase
    .from('review_invitations')
    .select('id, client_email, service_name, scheduled_at, created_at')
    .is('sent_at', null)
    .gt('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
  console.log(`\n  SCHEDULED FUTURE (next to go out):`)
  for (const r of scheduledSoon ?? []) {
    console.log(
      `    ${r.scheduled_at} (created ${r.created_at ?? '?'}) ${r.service_name ?? '?'} -> ${r.client_email}`
    )
  }
}

async function failureRates() {
  console.log(`\n======= 3) Delivery failures =======`)
  const { data: errors } = await supabase
    .from('review_invitations')
    .select('last_error, attempts')
    .not('last_error', 'is', null)
    .limit(200)
  const counts: Record<string, number> = {}
  for (const e of errors ?? []) {
    const key = (e.last_error ?? 'unknown').slice(0, 80)
    counts[key] = (counts[key] || 0) + 1
  }
  if (!errors?.length) {
    console.log('  No delivery errors recorded.')
  } else {
    console.log('  Failure distribution:')
    for (const [err, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${n.toString().padStart(3)} × "${err}"`)
    }
  }
}

function auditCron() {
  console.log(`\n======= 4) Cron & env configuration =======`)
  const vercel = path.join(ROOT, 'vercel.json')
  if (fs.existsSync(vercel)) {
    const cfg = JSON.parse(fs.readFileSync(vercel, 'utf-8'))
    const crons: Array<{ path: string; schedule: string }> = cfg.crons ?? []
    const match = crons.find((c) => c.path?.includes('send-review-invitations'))
    if (match) {
      console.log(
        `  ✅ vercel.json crons has /api/cron/send-review-invitations @ "${match.schedule}"`
      )
    } else {
      console.log(`  ❌ NO CRON registered for send-review-invitations in vercel.json`)
      console.log('     Crons present:', crons.map((c) => c.path).join(', ') || '(none)')
    }
  } else {
    console.log(`  ⚠️  vercel.json not found`)
  }
  console.log(`  CRON_SECRET set: ${process.env.CRON_SECRET ? 'yes' : 'no'}`)
  console.log(
    `  POSTMARK_SERVER_TOKEN or RESEND_API_KEY or SENDGRID: see src/lib/notifications/email`
  )
}

async function reviewsSchema() {
  console.log(`\n======= 5) reviews table actual columns =======`)
  // fetch 1 row to introspect
  const { data, error } = await supabase.from('reviews').select('*').limit(1)
  if (error) {
    console.log(`  ❌ ${error.message}`)
    return
  }
  if (!data || !data.length) {
    console.log(`  (table empty — try another approach)`)
    return
  }
  console.log('  Columns:', Object.keys(data[0]).join(', '))
  // Show counts by department if present
  const byDeptQuery = await supabase
    .from('reviews')
    .select('department_code, rating, is_published')
    .eq('is_published', true)
    .limit(500)
  const depts: Record<string, number> = {}
  for (const r of byDeptQuery.data ?? []) {
    depts[r.department_code || 'null'] = (depts[r.department_code || 'null'] || 0) + 1
  }
  console.log(`  Published reviews (sample 500) by dept:`, depts)
}

async function simulate() {
  if (!process.argv.includes('--simulate')) return
  console.log(`\n======= 6) SIMULATE end-to-end invitation =======`)
  const testEmail = `e2e-test-${Date.now()}@servicesartisans.fr`
  const testDevisId = '00000000-0000-0000-0000-000000000001'
  const { plaintext, hash } = createInvitationToken()
  const now = Date.now()
  const scheduledAt = new Date(now - 1000).toISOString() // overdue = ready
  const expiresAt = new Date(now + INVITATION_EXPIRY_MS).toISOString()

  console.log(`  Inserting simulated invitation…`)
  const { data, error } = await supabase
    .from('review_invitations')
    .insert({
      devis_request_id: testDevisId,
      provider_id: null,
      client_email: testEmail,
      client_name: 'E2E Test',
      service_name: 'Test Service',
      token_hash: hash,
      scheduled_at: scheduledAt,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (error) {
    console.log(`  ❌ Insert failed: ${error.message}`)
    return
  }
  console.log(`  ✅ Created invitation ${data.id}`)

  // Lookup by plaintext token
  const { data: found } = await supabase
    .from('review_invitations')
    .select('id, client_email, expires_at')
    .eq('token_hash', hashInvitationToken(plaintext))
    .maybeSingle()
  console.log(`  Lookup by plaintext → ${found ? 'OK (' + found.id + ')' : 'FAILED'}`)

  console.log(
    `  Review URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://servicesartisans.fr'}/invitation-avis/${plaintext}`
  )
  console.log(`  Cleaning up…`)
  await supabase.from('review_invitations').delete().eq('id', data.id)
  console.log(`  ✅ Cleaned up`)
}

async function main() {
  await auditStatuses()
  await oldestPending()
  await failureRates()
  auditCron()
  await reviewsSchema()
  await simulate()
  console.log('\n=== END ===\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

void INVITATION_DELAY_MS // silence unused import when simulate not run
