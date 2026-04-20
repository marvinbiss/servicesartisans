/**
 * Audit the review-invitation flywheel state. No writes. Safe to run anytime.
 */

import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { createAdminClient } from '@/lib/supabase/admin'

const DAY = 24 * 60 * 60 * 1000

async function safeCount(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
  describe: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply?: (q: any) => any
): Promise<number | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = supabase.from(table).select('*', { count: 'exact', head: true })
    if (apply) q = apply(q)
    const { count, error } = await q
    if (error) {
      console.log(`  [${describe}] ERROR: ${error.message || JSON.stringify(error)}`)
      return null
    }
    return count ?? 0
  } catch (e) {
    console.log(`  [${describe}] EXCEPTION: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

function pct(n: number | null, total: number | null): string {
  if (n === null || total === null || total === 0) return 'n/a'
  return ((n / total) * 100).toFixed(1) + '%'
}

async function main() {
  const supabase = createAdminClient()
  const now = new Date()
  const d30 = new Date(now.getTime() - 30 * DAY).toISOString()
  const d7 = new Date(now.getTime() - 7 * DAY).toISOString()

  console.log('=== DEVIS REQUESTS ===')
  const devisTotal = await safeCount(supabase, 'devis_requests', 'total')
  const devisLast30 = await safeCount(supabase, 'devis_requests', 'last 30d', (q) =>
    q.gte('created_at', d30)
  )
  const devisLast7 = await safeCount(supabase, 'devis_requests', 'last 7d', (q) =>
    q.gte('created_at', d7)
  )
  const devisWithEmail = await safeCount(supabase, 'devis_requests', 'with email', (q) =>
    q.not('email', 'is', null)
  )
  console.log(`  total              : ${devisTotal}`)
  console.log(`  last 30 days       : ${devisLast30}`)
  console.log(`  last 7 days        : ${devisLast7}`)
  console.log(`  with email         : ${devisWithEmail}`)

  console.log('')
  console.log('=== REVIEW_INVITATIONS ===')
  const invTotal = await safeCount(supabase, 'review_invitations', 'total')
  const invPending = await safeCount(supabase, 'review_invitations', 'pending', (q) =>
    q.is('sent_at', null)
  )
  const invSent = await safeCount(supabase, 'review_invitations', 'sent', (q) =>
    q.not('sent_at', 'is', null)
  )
  const invCompleted = await safeCount(supabase, 'review_invitations', 'completed', (q) =>
    q.not('completed_at', 'is', null)
  )
  const invDueNow = await safeCount(supabase, 'review_invitations', 'due now', (q) =>
    q.is('sent_at', null).lte('scheduled_at', now.toISOString())
  )
  console.log(`  total              : ${invTotal}`)
  console.log(`  pending (not sent) : ${invPending}`)
  console.log(`  due NOW but unsent : ${invDueNow}`)
  console.log(`  sent               : ${invSent}`)
  console.log(`  completed          : ${invCompleted}`)
  console.log(`  open rate (sent→completed) : ${pct(invCompleted, invSent)}`)

  console.log('')
  console.log('=== REVIEWS ===')
  const reviewsTotal = await safeCount(supabase, 'reviews', 'total')
  const reviewsPublished = await safeCount(supabase, 'reviews', 'published', (q) =>
    q.eq('status', 'published')
  )
  const reviewsPending = await safeCount(supabase, 'reviews', 'pending', (q) =>
    q.eq('status', 'pending')
  )
  console.log(`  total              : ${reviewsTotal}`)
  console.log(`  published          : ${reviewsPublished}`)
  console.log(`  pending moderation : ${reviewsPending}`)

  console.log('')
  console.log('=== CONVERSION ===')
  console.log(`  devis (${devisTotal}) → invitation (${invTotal})  : ${pct(invTotal, devisTotal)}`)
  console.log(`  invitation (${invTotal}) → sent (${invSent})      : ${pct(invSent, invTotal)}`)
  console.log(`  sent (${invSent}) → completed (${invCompleted})   : ${pct(invCompleted, invSent)}`)

  console.log('')
  console.log('=== DIAGNOSIS ===')
  if (invTotal === 0) {
    console.log('  ❌ Zero invitations created.')
  }
  if (invTotal !== null && invTotal > 0 && invSent === 0) {
    console.log('  ❌ Invitations exist but never sent. Cron probably not firing.')
  }
  if (invDueNow !== null && invDueNow > 20) {
    console.log(`  ⚠️  ${invDueNow} due now unsent — cron lagging.`)
  }
  if (reviewsPublished !== null && reviewsPublished > 0) {
    console.log(`  ✅ ${reviewsPublished} published reviews — flywheel producing.`)
  }
}

main().catch((e) => {
  console.error('[audit-flywheel] fatal:', e)
  process.exit(1)
})
