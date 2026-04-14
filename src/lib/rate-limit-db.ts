/**
 * Distributed rate limiter backed by Supabase.
 *
 * Replaces the in-memory Map-based limiter for serverless-safe use. The
 * in-memory Map resets per cold start on Vercel, making short-window limits
 * (e.g. 3/hour) effectively unlimited. This helper uses the rate_limit_check
 * RPC (migration 441) which performs an atomic upsert + counter increment.
 *
 * Fail-open policy: if the RPC fails (DB down, migration not applied), we
 * return success=true rather than blocking legitimate users. Failures are
 * logged for observability.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export interface DistributedRateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

export async function rateLimitDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<DistributedRateLimitResult> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.rpc('rate_limit_check', {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      logger.warn('rate_limit_check RPC failed — failing open', {
        key,
        error: error?.message,
      })
      return { success: true, remaining: limit, resetAt: new Date(Date.now() + windowMs) }
    }
    const row = data[0] as { allowed?: unknown; remaining?: unknown; reset_at?: unknown }
    if (
      typeof row.allowed !== 'boolean' ||
      typeof row.remaining !== 'number' ||
      typeof row.reset_at !== 'string'
    ) {
      logger.warn('rate_limit_check RPC returned unexpected shape — failing open', { key })
      return { success: true, remaining: limit, resetAt: new Date(Date.now() + windowMs) }
    }
    return {
      success: row.allowed,
      remaining: row.remaining,
      resetAt: new Date(row.reset_at),
    }
  } catch (err) {
    logger.warn('rateLimitDb exception — failing open', {
      key,
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: true, remaining: limit, resetAt: new Date(Date.now() + windowMs) }
  }
}

export function getRateLimitDbHeaders(r: DistributedRateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(r.remaining),
    'X-RateLimit-Reset': r.resetAt.toISOString(),
  }
}
