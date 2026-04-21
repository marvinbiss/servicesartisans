import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase avec la clé service_role
 * UNIQUEMENT côté serveur (admin / bypass RLS)
 *
 * The global.fetch wrapper passes `next: { revalidate: 3600 }` so that
 * Next.js caches Supabase responses and enables ISR for pages that use
 * this client.  Without this, internal HEAD/GET requests from PostgREST
 * are treated as uncacheable and force every page into dynamic SSR
 * (perpetual x-vercel-cache: MISS).
 *
 * Singleton : le client admin n'a pas d'état par requête (pas de cookies),
 * donc on le réutilise entre invocations pour économiser la création d'objet
 * et le setup du wrapper fetch. `server-only` garantit qu'il ne fuit pas
 * dans un bundle client.
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
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          next: { revalidate: 3600 },
        } as RequestInit)
      },
    },
  })
  return cachedAdminClient
}
