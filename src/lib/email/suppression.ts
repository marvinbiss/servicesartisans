/**
 * Email Suppression List
 * Prevents sending to bounced/complained/unsubscribed addresses
 * Critical for email deliverability - Gmail bans senders who repeatedly send to bounced addresses
 */

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Check if an email is suppressed (bounced/complained/unsubscribed)
 * Returns true if the email should NOT be sent to
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from('email_suppressions')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase().trim())

  return (count ?? 0) > 0
}

/**
 * Add an email to the suppression list
 */
export async function addSuppression(params: {
  email: string
  reason: 'hard_bounce' | 'soft_bounce' | 'complaint' | 'unsubscribe' | 'manual'
  source: string
  errorMessage?: string
}): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('email_suppressions')
    .upsert({
      email: params.email.toLowerCase().trim(),
      reason: params.reason,
      source: params.source,
      error_message: params.errorMessage || null,
    }, {
      onConflict: 'email,reason',
      ignoreDuplicates: true
    })
}

/**
 * Remove an email from suppression (e.g., manual re-enable)
 */
export async function removeSuppression(email: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('email_suppressions')
    .delete()
    .eq('email', email.toLowerCase().trim())
}

/**
 * Filter a list of emails, removing suppressed ones
 * Useful before batch sends
 */
export async function filterSuppressed(emails: string[]): Promise<string[]> {
  if (emails.length === 0) return []

  const supabase = createAdminClient()
  const normalized = emails.map(e => e.toLowerCase().trim())

  const { data } = await supabase
    .from('email_suppressions')
    .select('email')
    .in('email', normalized)

  const suppressedSet = new Set((data || []).map(d => d.email))
  return emails.filter(e => !suppressedSet.has(e.toLowerCase().trim()))
}
