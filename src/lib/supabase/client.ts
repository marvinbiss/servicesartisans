import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required')
  }
  return createBrowserClient(url, key)
}

// Singleton pattern for client-side — safe to call at module level in 'use client' files
let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      // During build/SSR without env vars, return null placeholder
      // Actual client-side code will re-init when env vars are available at runtime
      return null as unknown as ReturnType<typeof createBrowserClient>
    }
    client = createBrowserClient(url, key)
  }
  return client
}
