-- =============================================================================
-- Migration 533: REVOKE reviews.author_email from anon/authenticated (PII)
-- ServicesArtisans — 2026-06-04
-- =============================================================================
-- Found during the post-532 drift sweep: a raw anon PostgREST call
--   GET /rest/v1/reviews?select=*
-- returns `author_email` for every review (reviewer PII, scrapable).
--
-- author_email is NEVER rendered publicly — it is only read by admin pages
-- (admin/(dashboard)/avis) and GDPR/write paths, all via createAdminClient
-- (RLS bypass) or the owner's own email. Public review display uses
-- author_name only. Column-level REVOKE closes the leak with zero UI impact.
--
-- service_role keeps full access (native bypass).
--
-- NOTE (residual, separate task): providers.email / providers.phone /
-- providers.phone_secondary are fetched by PROVIDER_DETAIL_SELECT using the
-- anon key for SSR, so anon can also read them via PostgREST. They cannot be
-- blanket-revoked without breaking the RGE phone-display path and 459K SSR
-- pages. Proper fix = a SECURITY DEFINER RPC/view that applies the RGE gate
-- server-side, then REVOKE the raw columns. Tracked, not done here.
--
-- IDEMPOTENT.
-- =============================================================================

BEGIN;

DO $do$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'reviews'
      AND column_name = 'author_email'
  ) THEN
    EXECUTE 'REVOKE SELECT (author_email) ON public.reviews FROM anon, authenticated';
    RAISE NOTICE 'OK — reviews.author_email SELECT revoked from anon, authenticated';
  ELSE
    RAISE NOTICE 'SKIP — reviews.author_email absent';
  END IF;
END
$do$;

COMMIT;
