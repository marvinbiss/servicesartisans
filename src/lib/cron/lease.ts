import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Lease anti-double-run pour crons Vercel.
 *
 * La table `cron_leases` (migration 409) est une alternative aux advisory
 * locks Postgres, qui ne sont pas fiables derrière le pooler Supabase (pas
 * de session stickiness).
 *
 * Pattern :
 *
 *   const release = await acquireCronLease(supabase, 'my-cron', 600)
 *   if (!release) return NextResponse.json({ skipped: true })
 *   try {
 *     // ... cron work
 *   } finally {
 *     await release()
 *   }
 */

export type ReleaseLease = () => Promise<void>

/**
 * Tente d'acquérir un lease. Retourne une fonction de libération si
 * l'acquisition a réussi, ou `null` si un autre runner détient déjà un
 * lease non expiré.
 *
 * @param supabase  client avec privilèges service_role (seul bypass RLS).
 * @param name      identifiant logique stable du cron.
 * @param ttlSeconds durée de vie max du lease (garde-fou si le runner crashe).
 */
export async function acquireCronLease(
  supabase: SupabaseClient,
  name: string,
  ttlSeconds = 600
): Promise<ReleaseLease | null> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

  // UPSERT conditionnel : on tente d'insérer, et si le lease existe on ne
  // l'écrase que si son expires_at est déjà passé.
  const { data, error } = await supabase
    .from('cron_leases')
    .upsert(
      { name, acquired_at: new Date().toISOString(), expires_at: expiresAt },
      { onConflict: 'name', ignoreDuplicates: false }
    )
    .select('name, expires_at')
    .single()

  if (error) {
    // PostgREST n'expose pas de erreur distincte sur l'UPSERT conflit,
    // donc on relit l'état actuel pour décider.
    const { data: existing } = await supabase
      .from('cron_leases')
      .select('expires_at')
      .eq('name', name)
      .maybeSingle()

    if (existing && new Date(existing.expires_at).getTime() > Date.now()) {
      logger.info(`[cron-lease] ${name} already held, skipping`, {
        expires_at: existing.expires_at,
      })
      return null
    }
    logger.error(`[cron-lease] acquisition error for ${name}`, error)
    return null
  }

  if (!data) return null

  return async () => {
    try {
      await supabase
        .from('cron_leases')
        .update({ expires_at: new Date().toISOString() })
        .eq('name', name)
    } catch (err) {
      logger.error(`[cron-lease] release error for ${name}`, err)
    }
  }
}
