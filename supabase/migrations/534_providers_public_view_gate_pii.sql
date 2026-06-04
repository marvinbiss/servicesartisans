-- =============================================================================
-- Migration 534: providers_public view — gate email/phone PII for anon
-- ServicesArtisans — 2026-06-04
-- =============================================================================
-- Post-532 drift sweep residual: a raw anon PostgREST call
--   GET /rest/v1/providers?select=email,phone
-- returns email + phone for EVERY active provider (SIRENE/INSEE/ADEME data),
-- bypassing the application-layer display gates:
--   - email  shown only if the listing is claimed (ArtisanBusinessCard)
--   - phone  shown only if claimed OR RGE-active (CLAUDE.md 2026-05-07 rule)
-- The render gate does not protect the raw API → mass scrapable.
--
-- FIX (chosen: SECURITY DEFINER view)
-- -----------------------------------
--   1. providers_public: mirrors all 93 columns of providers, but email /
--      phone / phone_secondary are NULLed unless the gate passes. Definer →
--      bypasses RLS, so it re-applies the anon row filter (is_active = true)
--      in its WHERE clause to preserve current visibility.
--   2. REVOKE SELECT(email, phone, phone_secondary) ON providers FROM anon so
--      the raw columns can no longer be read with the anon key. authenticated
--      keeps them (dashboard reads own row via RLS); service_role bypasses.
--   3. Public anon read paths switch `.from('providers')` →
--      `.from('providers_public')` (supabase.ts list/detail + cee/listings +
--      rge/*-listings). Count/specific-column selects that don't touch the 3
--      PII columns keep working on the base table regardless.
--
-- Gate definition:
--   claimed  := claimed_by IS NOT NULL OR user_id IS NOT NULL
--   rge_live := rge_valid_until IS NOT NULL AND rge_valid_until > now()
--
-- IDEMPOTENT.
-- =============================================================================

BEGIN;

DROP VIEW IF EXISTS public.providers_public;

CREATE VIEW public.providers_public
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.siren,
  p.siret,
  CASE WHEN (p.claimed_by IS NOT NULL OR p.user_id IS NOT NULL) THEN p.email ELSE NULL END AS email,
  CASE WHEN (p.claimed_by IS NOT NULL OR p.user_id IS NOT NULL) OR (p.rge_valid_until IS NOT NULL AND p.rge_valid_until > now()) THEN p.phone ELSE NULL END AS phone,
  p.website,
  p.address_street,
  p.address_city,
  p.address_postal_code,
  p.address_department,
  p.address_region,
  p.latitude,
  p.longitude,
  p.legal_form,
  p.creation_date,
  p.employee_count,
  p.annual_revenue,
  p.is_verified,
  p.is_active,
  p.verification_date,
  p.meta_title,
  p.meta_description,
  p.created_at,
  p.updated_at,
  p.scraped_at,
  p.source,
  p.source_id,
  p.rating_average,
  p.review_count,
  p.description,
  p.specialty,
  p.location,
  p.search_vector,
  p.code_naf,
  p.libelle_naf,
  p.legal_form_code,
  p.capital,
  p.date_radiation,
  p.is_artisan,
  p.source_api,
  p.derniere_maj_api,
  p.data_quality_score,
  p.data_quality_flags,
  p.stable_id,
  p.last_lead_assigned_at,
  p.claimed_at,
  p.claimed_by,
  p.noindex,
  p.user_id,
  p.avatar_url,
  p.phone_source,
  p.rge_qualifications,
  p.rge_valid_until,
  p.rge_organismes,
  p.rge_last_synced_at,
  p.rge_source_url,
  p.rge_categories_decret,
  p.is_mar_agree,
  p.mar_source_id,
  p.mar_qualifications,
  p.mar_last_verified_at,
  p.mar_agree_since,
  p.mar_revoked_at,
  p.is_rge,
  p.rge_verified_at,
  p.rge_expires_at,
  p.google_place_id,
  p.google_rating,
  p.google_user_ratings_total,
  p.google_business_status,
  p.google_synced_at,
  p.google_sync_status,
  p.bio,
  p.faq,
  p.services_offered,
  p.service_prices,
  p.opening_hours,
  CASE WHEN (p.claimed_by IS NOT NULL OR p.user_id IS NOT NULL) THEN p.phone_secondary ELSE NULL END AS phone_secondary,
  p.intervention_radius_km,
  p.accepts_new_clients,
  p.free_quote,
  p.available_24h,
  p.team_size,
  p.specialty_slug,
  p.certifications,
  p.insurance,
  p.payment_methods,
  p.languages,
  p.emergency_available,
  p.hourly_rate_min,
  p.hourly_rate_max
FROM public.providers p
WHERE p.is_active = TRUE;

GRANT SELECT ON public.providers_public TO anon, authenticated;

COMMENT ON VIEW public.providers_public IS
  'Public-safe projection of providers. SECURITY DEFINER; mirrors all columns '
  'but NULLs email/phone/phone_secondary unless claimed (email/phone_secondary) '
  'or claimed||RGE-active (phone). Re-applies is_active=true. Anon read paths '
  'use this instead of the base table (mig 534).';

-- Remove the raw PII columns from anon on the base table.
REVOKE SELECT (email, phone, phone_secondary) ON public.providers FROM anon;

COMMIT;
