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
import { cleanAdemeText } from '@/lib/ademe/text'
import { yearsSinceIso } from '@/lib/insee/recherche-entreprises'
import type { InseeContext, ProviderContext } from '@/lib/descriptions/prompts/rge-description-v1'

export { cleanAdemeText }

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
  address_postal_code: string | null
  specialty: string | null
  claimed_at: string | null
  description: string | null
  rge_qualifications: RgeQualificationRow[] | null
  rge_valid_until: string | null
  is_active: boolean | null
}

type CommuneLookupRow = {
  code_insee: string
  name: string
  region_name: string | null
  departement_name: string | null
}

type InseeEnrichmentRow = {
  provider_id: string
  date_creation: string | null
  tranche_effectif_label: string | null
  activite_principale_naf: string | null
  etat_administratif: string | null
  nombre_etablissements: number | null
  liste_rge_codes: string[] | null
}

const inseeRowToContext = (row: InseeEnrichmentRow | undefined): InseeContext | null => {
  if (!row) return null
  return {
    date_creation: row.date_creation,
    age_years: yearsSinceIso(row.date_creation),
    tranche_effectif_label: row.tranche_effectif_label,
    activite_principale_naf: row.activite_principale_naf,
    etat_administratif: row.etat_administratif,
    nombre_etablissements: row.nombre_etablissements,
    liste_rge_codes_count: row.liste_rge_codes?.length ?? null,
  }
}

// ADEME accent helpers live in `@/lib/ademe/text` (pure, client-safe); they
// are re-exported at the top of this module for existing callers.

const dedupeTrimmed = (values: Array<string | null | undefined>, clean = false): string[] => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    if (!v) continue
    const trimmed = v.trim()
    if (trimmed.length === 0) continue
    const t = clean ? cleanAdemeText(trimmed) : trimmed
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

// 97% des providers RGE ont un code INSEE (5 digits) dans address_city au lieu
// du nom de commune — héritage du sync ADEME. On résout via la table `communes`
// pour obtenir le vrai nom + region_name, indispensable pour le grounding E-E-A-T.
const INSEE_REGEX = /^\d[\dAB]\d{3}$/i // 2A123, 2B456, 75018, 01234…

const looksLikeInsee = (val: string | null | undefined): boolean =>
  !!val && INSEE_REGEX.test(val.trim())

// If the DB-stored specialty contradicts every qualif domain/meta-domain,
// the LLM would produce incoherent text ("plombier" + qualifs toiture).
// Detect the conflict and fall back to the most representative ADEME domain.
const specialtyMatchesQualifs = (
  specialty: string,
  categories: string[],
  metaDomains: string[]
): boolean => {
  const s = specialty
    .toLocaleLowerCase('fr-FR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  if (s.length === 0) return true
  const pool = [...categories, ...metaDomains]
    .map((v) =>
      v
        .toLocaleLowerCase('fr-FR')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    )
    .join(' ')
  // Accept if specialty stem (first 4 chars) appears anywhere in the pool.
  const stem = s.slice(0, Math.max(4, s.indexOf(' ') > 0 ? s.indexOf(' ') : s.length))
  return stem.length >= 4 && pool.includes(stem)
}

const pickDominantSpecialty = (categories: string[], metaDomains: string[]): string => {
  // metaDomains is typically shorter and broader ("Chauffage", "Isolation").
  if (metaDomains.length > 0) return metaDomains[0]
  if (categories.length > 0) return categories[0]
  return ''
}

const rowToContext = (
  row: ProviderRow,
  communeByInsee: Map<string, CommuneLookupRow>,
  inseeByProvider?: Map<string, InseeEnrichmentRow>
): ProviderContext | null => {
  if (!row.name || !row.slug) return null

  const quals = Array.isArray(row.rge_qualifications) ? row.rge_qualifications : []
  const rge_qualifications = dedupeTrimmed(
    quals.map((q) => q?.nom ?? null),
    true
  )
  const ademe_categories = dedupeTrimmed(
    quals.map((q) => q?.domaine ?? null),
    true
  )
  const ademe_meta_domains = dedupeTrimmed(
    quals.map((q) => q?.meta_domaine ?? null),
    true
  )

  const rawCity = row.address_city?.trim() ?? ''
  const rawRegion = row.address_region?.trim() ?? ''
  const lookup = looksLikeInsee(rawCity) ? communeByInsee.get(rawCity) : null

  const resolvedCity = lookup?.name ?? (looksLikeInsee(rawCity) ? '' : rawCity)
  const resolvedRegion = rawRegion || lookup?.region_name || lookup?.departement_name || ''

  const dbSpecialty = cleanAdemeText((row.specialty ?? '').trim())
  const specialty = specialtyMatchesQualifs(dbSpecialty, ademe_categories, ademe_meta_domains)
    ? dbSpecialty
    : pickDominantSpecialty(ademe_categories, ademe_meta_domains) || dbSpecialty

  const insee = inseeRowToContext(inseeByProvider?.get(row.id))

  return {
    name: row.name,
    slug: row.slug,
    address_city: resolvedCity,
    address_region: resolvedRegion,
    specialty,
    rge_qualifications,
    rge_valid_until: toIsoDate(row.rge_valid_until),
    claimed_at: row.claimed_at ? toIsoDate(row.claimed_at) : null,
    ademe_categories,
    ademe_meta_domains,
    baseline_text: truncate(row.description, BASELINE_MAX_CHARS),
    insee,
  }
}

const SELECT_COLUMNS =
  'id, name, slug, address_city, address_region, address_postal_code, specialty, claimed_at, description, rge_qualifications, rge_valid_until, is_active'

async function fetchCommunesByInsee(
  supabase: ReturnType<typeof createAdminClient>,
  codes: string[]
): Promise<Map<string, CommuneLookupRow>> {
  const out = new Map<string, CommuneLookupRow>()
  const unique = Array.from(new Set(codes.filter(looksLikeInsee)))
  if (unique.length === 0) return out

  // PostgREST IN() is safe up to ~thousands; batch size 500 is comfortable.
  const BATCH = 500
  for (let i = 0; i < unique.length; i += BATCH) {
    const slice = unique.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('communes')
      .select('code_insee, name, region_name, departement_name')
      .in('code_insee', slice)
      .returns<CommuneLookupRow[]>()
    if (error) {
      logger.warn('[descriptions/retrieval] commune lookup failed', {
        batchSize: slice.length,
        error: error.message,
      })
      continue
    }
    for (const r of data ?? []) out.set(r.code_insee, r)
  }
  return out
}

async function fetchInseeEnrichments(
  supabase: ReturnType<typeof createAdminClient>,
  providerIds: string[]
): Promise<Map<string, InseeEnrichmentRow>> {
  const out = new Map<string, InseeEnrichmentRow>()
  if (providerIds.length === 0) return out
  const CHUNK = 200
  for (let i = 0; i < providerIds.length; i += CHUNK) {
    const slice = providerIds.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from('provider_insee_enrichment')
      .select(
        'provider_id, date_creation, tranche_effectif_label, activite_principale_naf, etat_administratif, nombre_etablissements, liste_rge_codes'
      )
      .in('provider_id', slice)
      .returns<InseeEnrichmentRow[]>()
    if (error) {
      // Migration 459 may not be applied yet — don't crash the pipeline,
      // just skip enrichment gracefully.
      logger.warn('[descriptions/retrieval] insee enrichment fetch failed', {
        error: error.message,
      })
      return out
    }
    for (const r of data ?? []) out.set(r.provider_id, r)
  }
  return out
}

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
  const communeByInsee = await fetchCommunesByInsee(supabase, [data.address_city ?? ''])
  const inseeByProvider = await fetchInseeEnrichments(supabase, [providerId])
  return rowToContext(data, communeByInsee, inseeByProvider)
}

export async function fetchProviderContextsBatch(
  providerIds: string[]
): Promise<Map<string, ProviderContext>> {
  const out = new Map<string, ProviderContext>()
  if (providerIds.length === 0) return out

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  // Cloudflare rejects PostgREST URLs >~8 KiB, so .in('id', [10000 uuids])
  // triggers 414. Chunk the fetch in pages of 200.
  const PAGE = 200
  const allRows: ProviderRow[] = []
  for (let i = 0; i < providerIds.length; i += PAGE) {
    const slice = providerIds.slice(i, i + PAGE)
    const { data, error } = await supabase
      .from('providers')
      .select(SELECT_COLUMNS)
      .in('id', slice)
      .returns<ProviderRow[]>()

    if (error) {
      logger.error('[descriptions/retrieval] fetchProviderContextsBatch failed', error, {
        count: slice.length,
        offset: i,
      })
      continue
    }
    if (data) allRows.push(...data)
  }

  const eligibleRows = allRows.filter((r) => isEligible(r, today))
  const communeByInsee = await fetchCommunesByInsee(
    supabase,
    eligibleRows.map((r) => r.address_city ?? '')
  )
  const inseeByProvider = await fetchInseeEnrichments(
    supabase,
    eligibleRows.map((r) => r.id)
  )

  for (const row of eligibleRows) {
    const ctx = rowToContext(row, communeByInsee, inseeByProvider)
    if (ctx) out.set(row.id, ctx)
  }

  return out
}
