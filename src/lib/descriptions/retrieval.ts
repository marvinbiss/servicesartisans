/**
 * Retrieval — ground each RGE artisan description in ProviderContext.
 *
 * Reads from `providers` (migration 380+413): name, slug, address_city,
 * address_region, specialty, claimed_at, description, and the JSONB
 * `rge_qualifications` array whose items carry `{code, nom, organisme,
 * domaine, meta_domaine, date_debut, date_fin}`. ADEME categories and
 * meta-domains live inside the JSONB — no separate join table exists.
 *
 * Eligibility: `is_active = true` AND `rge_valid_until` > today. Providers
 * outside this window never get a description (they would be noindexed by
 * the noindex-sweep cron anyway).
 *
 * Admin client — bypasses RLS because `provider_descriptions_draft` is
 * admin-only (migration 458, deny-all policy).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import type { ProviderContext } from '@/lib/descriptions/prompts/rge-description-v1'

const BASELINE_MAX_CHARS = 2000

type RgeQualificationRow = {
  code?: string | null
  nom?: string | null
  organisme?: string | null
  domaine?: string | null
  meta_domaine?: string | null
  date_debut?: string | null
  date_fin?: string | null
  url?: string | null
}

type ProviderRow = {
  id: string
  name: string | null
  slug: string | null
  address_city: string | null
  address_region: string | null
  specialty: string | null
  claimed_at: string | null
  description: string | null
  rge_qualifications: RgeQualificationRow[] | null
  rge_valid_until: string | null
  is_active: boolean | null
}

const dedupeTrimmed = (values: Array<string | null | undefined>): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    if (!v) continue
    const t = v.trim()
    if (t.length === 0) continue
    const key = t.toLocaleLowerCase('fr-FR')
    if (seen.has(key)) continue
    seen.add(key)
    out.push(t)
  }
  return out
}

const toIsoDate = (raw: string | null): string => {
  if (!raw) return ''
  // Accepts either 'YYYY-MM-DD' or full ISO timestamp — slice is safe either way.
  return raw.slice(0, 10)
}

const truncate = (raw: string | null, max: number): string | null => {
  if (!raw) return null
  const trimmed = raw.trim()
  if (trimmed.length === 0) return null
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max)
}

const isEligible = (row: ProviderRow, today: string): boolean => {
  if (row.is_active !== true) return false
  if (!row.rge_valid_until) return false
  return toIsoDate(row.rge_valid_until) > today
}

const rowToContext = (row: ProviderRow): ProviderContext | null => {
  if (!row.name || !row.slug) return null

  const quals = Array.isArray(row.rge_qualifications) ? row.rge_qualifications : []
  const rge_qualifications = dedupeTrimmed(quals.map((q) => q?.nom ?? null))
  const ademe_categories = dedupeTrimmed(quals.map((q) => q?.domaine ?? null))
  const ademe_meta_domains = dedupeTrimmed(quals.map((q) => q?.meta_domaine ?? null))

  return {
    name: row.name,
    slug: row.slug,
    address_city: row.address_city ?? '',
    address_region: row.address_region ?? '',
    specialty: row.specialty ?? '',
    rge_qualifications,
    rge_valid_until: toIsoDate(row.rge_valid_until),
    claimed_at: row.claimed_at ? toIsoDate(row.claimed_at) : null,
    ademe_categories,
    ademe_meta_domains,
    baseline_text: truncate(row.description, BASELINE_MAX_CHARS),
  }
}

const SELECT_COLUMNS =
  'id, name, slug, address_city, address_region, specialty, claimed_at, description, rge_qualifications, rge_valid_until, is_active'

export async function fetchProviderContext(providerId: string): Promise<ProviderContext | null> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('providers')
    .select(SELECT_COLUMNS)
    .eq('id', providerId)
    .maybeSingle<ProviderRow>()

  if (error) {
    logger.error('[descriptions/retrieval] fetchProviderContext failed', error, {
      providerId,
    })
    return null
  }

  if (!data || !isEligible(data, today)) return null
  return rowToContext(data)
}

export async function fetchProviderContextsBatch(
  providerIds: string[]
): Promise<Map<string, ProviderContext>> {
  const out = new Map<string, ProviderContext>()
  if (providerIds.length === 0) return out

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('providers')
    .select(SELECT_COLUMNS)
    .in('id', providerIds)
    .returns<ProviderRow[]>()

  if (error) {
    logger.error('[descriptions/retrieval] fetchProviderContextsBatch failed', error, {
      count: providerIds.length,
    })
    return out
  }

  for (const row of data ?? []) {
    if (!isEligible(row, today)) continue
    const ctx = rowToContext(row)
    if (ctx) out.set(row.id, ctx)
  }

  return out
}
