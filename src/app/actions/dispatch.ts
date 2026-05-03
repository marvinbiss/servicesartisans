'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { geocoder } from '@/lib/api/adresse'
import { isRgeRequiredService } from '@/lib/dispatch/rge-required-services'

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
   *
   * Depuis mig 498, est aussi auto-déduit côté SQL si `serviceName` est dans
   * `rge_required_services` (PAC, isolation, audit énergétique, etc.).
   */
  ceeEligible?: boolean
}

/**
 * Dispatch a lead to eligible artisans using the configurable algorithm.
 *
 * ACTIVE SCHEMA: public (NOT app)
 * - Calls `public.dispatch_lead` (mig 498 — RGE-first hard filter)
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
 * RGE hard filter (mig 498):
 *   - If `serviceName ∈ rge_required_services` (PAC, isolation, audit
 *     énergétique, etc.) OR `ceeEligible=true`, the SQL filters candidates
 *     to RGE-valid artisans only (rge_qualifications IS NOT NULL AND
 *     rge_valid_until > today).
 *   - Radius is escalated 50→80→120→200 km if no candidate at base radius
 *     (only when coordinates are available).
 *   - On 0 candidate after escalation, returns []. NEVER leaks to non-RGE.
 *     The SQL writes an audit_log `dispatch.rge_strict_no_match`; this
 *     wrapper additionally emits a Sentry warn for ops visibility.
 *
 * Uses service_role (bypasses RLS) — server-only.
 *
 * Returns array of assigned provider IDs (up to max_artisans_per_lead),
 * or [] when the lead could not be dispatched (RGE filter, quota, no zone).
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

    const { data, error } = await supabase.rpc('dispatch_lead', {
      p_lead_id: leadId,
      p_service_name: opts?.serviceName || null,
      p_city: opts?.city || null,
      p_postal_code: opts?.postalCode || null,
      p_urgency: opts?.urgency || 'normal',
      p_latitude: latitude,
      p_longitude: longitude,
      p_source_table: opts?.sourceTable || 'devis_requests',
      p_cee_eligible: opts?.ceeEligible ?? false,
    })

    if (error) {
      logger.error('Dispatch error', error)
      return []
    }

    const assigned = (data as string[]) || []

    // Mig 498: 0 candidat sur un lead potentiellement RGE-required → trace.
    // Le SQL n'écrit `dispatch.rge_strict_no_match` dans audit_logs QUE quand
    // le filtre RGE a effectivement été appliqué et a évincé tous les candidats.
    // Côté TS on ne sait pas si la cause exacte est le filtre RGE ou autre
    // (quota, zone vide même non-RGE) — d'où la phrasing prudente "potentially
    // RGE-required". Le diagnostic précis se fait via la requête audit_logs.
    const rgeRequiredByService = isRgeRequiredService(opts?.serviceName)
    if (assigned.length === 0 && (rgeRequiredByService || opts?.ceeEligible)) {
      logger.warn('Dispatch returned 0 assignments for a potentially RGE-required lead', {
        leadId,
        service: opts?.serviceName,
        city: opts?.city,
        postalCode: opts?.postalCode,
        latitude,
        longitude,
        ceeEligible: opts?.ceeEligible ?? false,
        rgeRequiredByService,
        hint: 'Check audit_logs WHERE action = dispatch.rge_strict_no_match for confirmation',
      })
    }

    return assigned
  } catch (err) {
    logger.error('Dispatch action error', err)
    return []
  }
}
