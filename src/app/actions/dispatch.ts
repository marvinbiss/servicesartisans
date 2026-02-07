'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Dispatch a lead to one eligible artisan via round-robin.
 * Uses service_role (bypasses RLS) — server-only.
 *
 * Returns the assigned provider_id, or null if no eligible artisan found.
 */
export async function dispatchLead(
  leadId: string,
  serviceName?: string,
  city?: string
): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc('dispatch_lead', {
      p_lead_id: leadId,
      p_service_name: serviceName || null,
      p_city: city || null,
    })

    if (error) {
      console.error('Dispatch error:', error)
      return null
    }

    return data as string | null
  } catch (err) {
    console.error('Dispatch action error:', err)
    return null
  }
}
