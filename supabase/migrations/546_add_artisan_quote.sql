-- =============================================================================
-- Migration 546: providers.artisan_quote — « Le mot de l'artisan »
-- ServicesArtisans — 2026-06-07
-- =============================================================================
-- Citation personnelle courte (max 200 chars) saisie par l'artisan dans son
-- dashboard (Ma fiche → Présentation), affichée en exergue dans le hero de la
-- fiche publique (claimed uniquement — seule une fiche revendiquée peut la
-- saisir). Humanise la fiche, différencie fiche habitée vs fiche annuaire.
--
-- ⚠️ ORDRE DE DÉPLOIEMENT : appliquer cette migration en prod AVANT de
-- déployer le code qui lit artisan_quote dans PROVIDER_DETAIL_SELECT
-- (providers_public). Sinon : 400 « column does not exist » sur TOUTES les
-- fiches (cf. post-mortem mig 483, 2026-05-01). La migration est additive —
-- l'appliquer avant ne casse rien pour le code actuel.
--
-- La vue providers_public (mig 534) énumère ses colonnes explicitement →
-- recréée ici avec artisan_quote. Les gates PII email/phone/phone_secondary
-- de la 534 sont reconduits à l'identique. artisan_quote n'est pas une PII :
-- contenu rédigé volontairement pour publication.
--
-- IDEMPOTENT.
-- =============================================================================

BEGIN;

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS artisan_quote TEXT
  CHECK (artisan_quote IS NULL OR char_length(artisan_quote) <= 200);

COMMENT ON COLUMN public.providers.artisan_quote IS
  'Citation personnelle de l''artisan (« Le mot de l''artisan »), max 200 '
  'chars, saisie dashboard, affichée dans le hero de la fiche publique '
  '(claimed uniquement). Mig 546.';

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
  p.hourly_rate_max,
  p.artisan_quote
FROM public.providers p
WHERE p.is_active = TRUE;

GRANT SELECT ON public.providers_public TO anon, authenticated;

COMMENT ON VIEW public.providers_public IS
  'Public-safe projection of providers. SECURITY DEFINER; mirrors all columns '
  'but NULLs email/phone/phone_secondary unless claimed (email/phone_secondary) '
  'or claimed||RGE-active (phone). Re-applies is_active=true. Anon read paths '
  'use this instead of the base table (mig 534, +artisan_quote mig 546).';

COMMIT;
