'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { geocoder } from '@/lib/api/adresse'

export interface DispatchOptions {
  serviceName?: string
  city?: string
  postalCode?: string
  urgency?: string
  latitude?: number
  longitude?: number
  sourceTable?: 'devis_requests' | 'leads'
  /**
   * Si true, le devis est éligible CEE (isolation, PAC, chauffe-eau thermo,
   * VMC double-flux, menuiseries isolantes…). Le dispatch priorise — et
   * filtre si `algorithm_config.require_rge_for_cee = true` — les artisans
   * RGE-valides. Migration 391.
   */
  ceeEligible?: boolean
}

/**
 * Dispatch a lead to eligible artisans using the configurable algorithm.
 *
 * ACTIVE SCHEMA: public (NOT app)
 * - Calls `public.dispatch_lead` from migration 363_fix_dispatch_location.sql
 * - Reads config from `public.algorithm_config` (201_algorithm_config.sql)
 * - Writes to `public.lead_assignments` and `public.providers`
 *
 * Location filtering priority (migration 363):
 *   1. Coordinates (lat/lon) → radius match via ST_DWithin
 *   2. City name → accent-insensitive exact match
 *   3. Postal code → department prefix match (first 2 digits)
 *   4. No location info → nationwide (no filter)
 *
 * If no coordinates are provided but city+postalCode are available,
 * attempts geocoding via API Adresse (data.gouv.fr) to get coordinates.
 * Falls back gracefully to city/department matching if geocoding fails.
 *
 * Uses service_role (bypasses RLS) — server-only.
 *
 * Returns array of assigned provider IDs (up to max_artisans_per_lead).
 */
export async function dispatchLead(leadId: string, opts?: DispatchOptions): Promise<string[]> {
  try {
    const supabase = createAdminClient()

    // Try to geocode if we have city/postalCode but no coordinates
    let latitude = opts?.latitude ?? null
    let longitude = opts?.longitude ?? null

    if (latitude === null && longitude === null && (opts?.city || opts?.postalCode)) {
      try {
        const query = [opts?.city, opts?.postalCode].filter(Boolean).join(' ')
        const geo = await geocoder(query)
        if (geo && geo.confidence > 0.4) {
          // API Adresse returns [longitude, latitude]
          longitude = geo.coordinates[0]
          latitude = geo.coordinates[1]
          logger.info('Geocoded lead location', {
            leadId,
            query,
            lat: latitude,
            lon: longitude,
            confidence: geo.confidence,
          })
        }
      } catch {
        // Geocoding failed — fall back to city/department matching in SQL
        logger.warn('Geocoding failed for dispatch, falling back to city/dept match', {
          leadId,
          city: opts?.city,
          postalCode: opts?.postalCode,
        })
      }
    }

    // Migration 391 (p_cee_eligible) is not yet applied in prod; call signature
    // matches migration 363 until 391 ships. Attempt 9-param first (post-391),
    // fall back to 8-param (363) if PostgREST reports signature mismatch.
    const basePayload = {
      p_lead_id: leadId,
      p_service_name: opts?.serviceName || null,
      p_city: opts?.city || null,
      p_postal_code: opts?.postalCode || null,
      p_urgency: opts?.urgency || 'normal',
      p_latitude: latitude,
      p_longitude: longitude,
      p_source_table: opts?.sourceTable || 'devis_requests',
    }

    let { data, error } = await supabase.rpc('dispatch_lead', {
      ...basePayload,
      p_cee_eligible: opts?.ceeEligible ?? false,
    })

    if (error && error.code === 'PGRST202') {
      logger.warn('dispatch_lead 391 signature missing, falling back to 363', { leadId })
      const retry = await supabase.rpc('dispatch_lead', basePayload)
      data = retry.data
      error = retry.error
    }

    if (error) {
      logger.error('Dispatch error', error)
      return []
    }

    return (data as string[]) || []
  } catch (err) {
    logger.error('Dispatch action error', err)
    return []
  }
}
