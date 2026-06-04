-- =============================================================================
-- Migration 535: Fix column-level PII restriction on providers + reviews
-- ServicesArtisans — 2026-06-04
-- =============================================================================
-- Migrations 533/534 used `REVOKE SELECT (col) ON tbl FROM anon`. In Postgres a
-- column-level REVOKE is a NO-OP while the role still holds a TABLE-level SELECT
-- grant (the table grant covers every column). anon holds table-level SELECT on
-- providers and reviews (and inherits it via PUBLIC, same as the profiles case
-- in 531/532), so the PII columns stayed readable:
--   GET /rest/v1/reviews?select=author_email      -> still returned
--   GET /rest/v1/providers?select=email,phone     -> still returned
--
-- CORRECT PATTERN: REVOKE the table-level SELECT (from anon AND PUBLIC), then
-- GRANT SELECT only on the explicit non-PII column list to anon. authenticated
-- and service_role keep full table SELECT (dashboard reads its own provider's
-- email/phone; admin/GDPR read author_email via service_role / RLS-own).
--
-- Public anon reads of providers already go through the providers_public view
-- (mig 534); embeds and other anon paths only need the non-PII columns, all of
-- which are granted below.
--
-- IDEMPOTENT.
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- providers : block email / phone / phone_secondary for anon
-- ----------------------------------------------------------------------------
REVOKE SELECT ON public.providers FROM anon;
REVOKE SELECT ON public.providers FROM PUBLIC;
GRANT  SELECT ON public.providers TO authenticated, service_role;

GRANT SELECT (
  id,
  name,
  slug,
  siren,
  siret,
  website,
  address_street,
  address_city,
  address_postal_code,
  address_department,
  address_region,
  latitude,
  longitude,
  legal_form,
  creation_date,
  employee_count,
  annual_revenue,
  is_verified,
  is_active,
  verification_date,
  meta_title,
  meta_description,
  created_at,
  updated_at,
  scraped_at,
  source,
  source_id,
  rating_average,
  review_count,
  description,
  specialty,
  location,
  search_vector,
  code_naf,
  libelle_naf,
  legal_form_code,
  capital,
  date_radiation,
  is_artisan,
  source_api,
  derniere_maj_api,
  data_quality_score,
  data_quality_flags,
  stable_id,
  last_lead_assigned_at,
  claimed_at,
  claimed_by,
  noindex,
  user_id,
  avatar_url,
  phone_source,
  rge_qualifications,
  rge_valid_until,
  rge_organismes,
  rge_last_synced_at,
  rge_source_url,
  rge_categories_decret,
  is_mar_agree,
  mar_source_id,
  mar_qualifications,
  mar_last_verified_at,
  mar_agree_since,
  mar_revoked_at,
  is_rge,
  rge_verified_at,
  rge_expires_at,
  google_place_id,
  google_rating,
  google_user_ratings_total,
  google_business_status,
  google_synced_at,
  google_sync_status,
  bio,
  faq,
  services_offered,
  service_prices,
  opening_hours,
  intervention_radius_km,
  accepts_new_clients,
  free_quote,
  available_24h,
  team_size,
  specialty_slug,
  certifications,
  insurance,
  payment_methods,
  languages,
  emergency_available,
  hourly_rate_min,
  hourly_rate_max
) ON public.providers TO anon;

-- ----------------------------------------------------------------------------
-- reviews : block author_email for anon
-- ----------------------------------------------------------------------------
REVOKE SELECT ON public.reviews FROM anon;
REVOKE SELECT ON public.reviews FROM PUBLIC;
GRANT  SELECT ON public.reviews TO authenticated, service_role;

GRANT SELECT (
  id,
  provider_id,
  author_name,
  author_verified,
  rating,
  title,
  content,
  reply,
  reply_date,
  status,
  moderated_at,
  moderated_by,
  source,
  source_id,
  source_date,
  created_at,
  updated_at,
  authenticity_score,
  sentiment_score,
  keywords,
  has_media,
  is_verified_purchase,
  helpful_count,
  response_at,
  response_text,
  booking_id,
  would_recommend,
  is_visible,
  is_verified
) ON public.reviews TO anon;

-- ----------------------------------------------------------------------------
-- Verify (NOTICE only)
-- ----------------------------------------------------------------------------
DO $verify$
BEGIN
  RAISE NOTICE 'providers.email  anon SELECT = % (must be f)', has_column_privilege('anon','public.providers','email','SELECT');
  RAISE NOTICE 'providers.phone  anon SELECT = % (must be f)', has_column_privilege('anon','public.providers','phone','SELECT');
  RAISE NOTICE 'providers.name   anon SELECT = % (must be t)', has_column_privilege('anon','public.providers','name','SELECT');
  RAISE NOTICE 'reviews.author_email anon SELECT = % (must be f)', has_column_privilege('anon','public.reviews','author_email','SELECT');
  RAISE NOTICE 'reviews.author_name  anon SELECT = % (must be t)', has_column_privilege('anon','public.reviews','author_name','SELECT');
END
$verify$;

COMMIT;
