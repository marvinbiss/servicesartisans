import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec la clé service_role — UNIQUEMENT côté serveur.
 *
 * Audit 2026-04-25 (agent #10 BLOCKER#1) : la version précédente injectait
 * `next: { revalidate: 3600 }` sur TOUS les `fetch()` PostgREST. Cela faisait
 * passer toutes les requêtes service_role par le Data Cache Vercel, avec deux
 * problèmes :
 *
 *   1. Les opérations admin (GDPR export, audit logs, admin/providers) lisaient
 *      potentiellement des données vieilles d'1h, sans signal de fraîcheur.
 *   2. Les writes (PATCH/DELETE/INSERT) n'invalidaient pas le cache des reads
 *      correspondants → incohérence côté UI admin.
 *
 * Plus de wrapper. Les pages publiques qui veulent du cache ISR doivent
 * utiliser `export const revalidate = ...` au niveau page (ou
 * `unstable_cache` pour une memoization explicite par appel). Le client
 * admin est désormais honnête : chaque appel touche Supabase, et c'est la
 * page hôte qui décide de la fraîcheur via ses propres primitives Next.js.
 *
 * NOTE : on ne pose pas `cache: 'no-store'` ici, ça déclencherait
 * `DynamicServerUsage` sur les pages ISR qui consomment ce client (même bug
 * que celui corrigé pour Upstash le matin du 2026-04-25).
 *
 * Le singleton est conservé : pas d'état par requête (pas de cookies session),
 * réutilisable entre invocations Lambda. `server-only` empêche le bundle client.
 */
let cachedAdminClient: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (cachedAdminClient) return cachedAdminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin env vars missing')
  }

  cachedAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedAdminClient
}
