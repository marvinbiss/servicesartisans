/**
 * Supabase Admin Client + Upsert Helpers
 * Used by collection and enrichment scripts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)

// ============================================
// PROVIDER UPSERT
// ============================================

export interface UpsertResult {
  created: number
  updated: number
  skipped: number
  errors: number
}

/**
 * Upsert a batch of provider records.
 * Uses SIREN as the conflict key — if a provider with same siren exists,
 * we update it; otherwise we insert.
 */
export async function upsertProviders(
  records: Record<string, unknown>[],
): Promise<UpsertResult> {
  const result: UpsertResult = { created: 0, updated: 0, skipped: 0, errors: 0 }

  if (records.length === 0) return result

  // Filter out records without siren
  const validRecords = records.filter(r => r.siren && String(r.siren).length === 9)
  result.skipped += records.length - validRecords.length

  if (validRecords.length === 0) return result

  // Check which sirens already exist
  const sirens = validRecords.map(r => String(r.siren))
  const { data: existingProviders } = await supabase
    .from('providers')
    .select('siren')
    .in('siren', sirens)

  const existingSirens = new Set((existingProviders || []).map(p => p.siren))

  // Split into inserts and updates
  const toInsert: Record<string, unknown>[] = []
  const toUpdate: Record<string, unknown>[] = []

  for (const record of validRecords) {
    if (existingSirens.has(String(record.siren))) {
      toUpdate.push(record)
    } else {
      toInsert.push(record)
    }
  }

  // Insert new providers
  if (toInsert.length > 0) {
    // Add defaults for new providers
    const insertRecords = toInsert.map(r => ({
      ...r,
      is_verified: false,
      noindex: true,
    }))

    const { error } = await supabase
      .from('providers')
      .insert(insertRecords)

    if (error) {
      console.error(`Insert error: ${error.message}`)
      // Try one by one for partial success
      for (const record of insertRecords) {
        const { error: singleError } = await supabase
          .from('providers')
          .insert(record)

        if (singleError) {
          result.errors++
        } else {
          result.created++
        }
      }
    } else {
      result.created += toInsert.length
    }
  }

  // Update existing providers (only API-sourced fields)
  if (toUpdate.length > 0) {
    for (const record of toUpdate) {
      const updateFields: Record<string, unknown> = {}

      // Only update fields that come from API and are non-null
      const apiFields = [
        'code_naf', 'libelle_naf', 'legal_form', 'legal_form_code',
        'creation_date', 'employee_count', 'is_artisan', 'source_api',
        'derniere_maj_api', 'siret',
      ]

      for (const field of apiFields) {
        if (record[field] !== null && record[field] !== undefined) {
          updateFields[field] = record[field]
        }
      }

      // Update address only if provider doesn't already have one
      const { data: existing } = await supabase
        .from('providers')
        .select('address_street, latitude')
        .eq('siren', String(record.siren))
        .single()

      if (existing && !existing.address_street && record.address_street) {
        updateFields.address_street = record.address_street
        updateFields.address_postal_code = record.address_postal_code
        updateFields.address_city = record.address_city
      }

      if (existing && !existing.latitude && record.latitude) {
        updateFields.latitude = record.latitude
        updateFields.longitude = record.longitude
      }

      if (Object.keys(updateFields).length > 0) {
        const { error } = await supabase
          .from('providers')
          .update(updateFields)
          .eq('siren', String(record.siren))

        if (error) {
          result.errors++
        } else {
          result.updated++
        }
      } else {
        result.skipped++
      }
    }
  }

  return result
}

/**
 * Upsert director records for a provider
 */
export async function upsertDirectors(
  providerId: string,
  directors: Array<{
    nom: string
    prenom?: string
    fonction?: string
    date_naissance?: string
    nationalite?: string
    source: string
  }>
): Promise<number> {
  let upserted = 0

  for (const dir of directors) {
    const { error } = await supabase
      .from('provider_directors')
      .upsert({
        provider_id: providerId,
        nom: dir.nom,
        prenom: dir.prenom || null,
        fonction: dir.fonction || null,
        date_naissance: dir.date_naissance || null,
        nationalite: dir.nationalite || null,
        source: dir.source,
        fetched_at: new Date().toISOString(),
      }, {
        onConflict: 'provider_id,nom,prenom,fonction',
      })

    if (!error) upserted++
  }

  return upserted
}

/**
 * Upsert financial records for a provider
 */
export async function upsertFinancials(
  providerId: string,
  financials: Array<{
    annee: number
    chiffre_affaires?: number | null
    resultat_net?: number | null
    effectif?: string | null
    source: string
  }>
): Promise<number> {
  let upserted = 0

  for (const fin of financials) {
    const { error } = await supabase
      .from('provider_financials')
      .upsert({
        provider_id: providerId,
        annee: fin.annee,
        chiffre_affaires: fin.chiffre_affaires ?? null,
        resultat_net: fin.resultat_net ?? null,
        effectif: fin.effectif ?? null,
        source: fin.source,
        fetched_at: new Date().toISOString(),
      }, {
        onConflict: 'provider_id,annee',
      })

    if (!error) upserted++
  }

  return upserted
}

/**
 * Find provider ID by SIREN
 */
export async function getProviderIdBySiren(siren: string): Promise<string | null> {
  const { data } = await supabase
    .from('providers')
    .select('id')
    .eq('siren', siren)
    .single()

  return data?.id || null
}

/**
 * Get providers needing enrichment
 */
export async function getProvidersForEnrichment(
  options: {
    missingField?: string
    source?: string
    limit?: number
    offset?: number
  }
): Promise<Array<{ id: string; siren: string; siret: string; name: string; address_city: string }>> {
  let query = supabase
    .from('providers')
    .select('id, siren, siret, name, address_city')
    .eq('is_active', true)
    .eq('is_artisan', true)

  if (options.missingField) {
    query = query.is(options.missingField, null)
  }

  if (options.source) {
    query = query.eq('source_api', options.source)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching providers for enrichment:', error.message)
    return []
  }

  return data || []
}
