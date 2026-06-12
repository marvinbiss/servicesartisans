-- =============================================================================
-- Migration 550: Supabase linter security hardening
-- ServicesArtisans — 2026-06-12
-- =============================================================================
-- Source: Supabase database-linter (2026-06-12 paste).
--
-- Two classes of finding addressed here:
--
-- (A) anon_/authenticated_security_definer_function_executable (WARN ×~40)
--     SECURITY DEFINER RPCs are EXECUTE-able by anon / authenticated via
--     /rest/v1/rpc/<name>. Audit of every caller (grep `.rpc(` in src/) shows
--     they are ALL invoked server-side through `createAdminClient()`
--     (service_role) — EXCEPT two reached with the RLS client
--     (`createClient()`, authenticated user):
--       • create_booking_atomic        (src/app/api/bookings/route.ts:204)
--       • get_artisan_dashboard_stats   (src/app/api/artisan/stats/route.ts:114)
--     Fix: default-deny EXECUTE for anon + authenticated + PUBLIC on the
--     server-only set; keep `authenticated` on the two RLS-client callers.
--     service_role keeps EXECUTE everywhere (it bypasses grants anyway, but we
--     re-assert it so the privilege set is explicit and idempotent).
--
-- (B) public_bucket_allows_listing (WARN ×3) — avatars / portfolio / reviews
--     A broad "Anyone can view <bucket>" SELECT policy on storage.objects lets
--     anon LIST every file. Public buckets serve objects by public URL
--     (getPublicUrl) WITHOUT a SELECT policy, and uploads use INSERT policies —
--     so the listing policy is pure over-exposure. grep confirms no `.list()`
--     call on these buckets anywhere in src/. Drop them.
--
-- NOT fixed here (documented, intentional / out-of-band):
--   • security_definer_view ERROR ×2 (artisans_public mig 532, providers_public
--     mig 534) — DELIBERATE: the definer property is what enforces the PII gate.
--     security_invoker would re-leak email/phone. Accepted baseline.
--   • is_admin() WARN — used inside RLS USING() clauses; must stay EXECUTE-able
--     by the querying role (revoking would error policy evaluation). Kept.
--   • st_estimatedextent / rls_disabled (spatial_ref_sys) — PostGIS
--     extension-owned, not ours to alter. Known baseline ERROR/WARN.
--   • auth_leaked_password_protection — Dashboard toggle (Auth settings),
--     cannot be set from SQL. Action Marvin: enable HaveIBeenPwned check.
--
-- IDEMPOTENT. No CREATE FUNCTION → no search_path pragma needed.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- (A) Server-only SECURITY DEFINER RPCs → service_role only
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.acquire_cron_lease(p_name text, p_ttl_seconds integer) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.acquire_cron_lease(p_name text, p_ttl_seconds integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.release_cron_lease(p_name text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.release_cron_lease(p_name text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.activate_sitemap_snapshot(p_new_snapshot_id integer) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.activate_sitemap_snapshot(p_new_snapshot_id integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.force_activate_sitemap_snapshot(p_snapshot_id integer, p_reason text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.force_activate_sitemap_snapshot(p_snapshot_id integer, p_reason text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.allocate_snapshot_id() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.allocate_snapshot_id() TO service_role;

REVOKE EXECUTE ON FUNCTION public.append_cee_justificatif(p_dossier_id uuid, p_entry jsonb, p_actor_id uuid, p_actor_type text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.append_cee_justificatif(p_dossier_id uuid, p_entry jsonb, p_actor_id uuid, p_actor_type text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.transition_cee_dossier_status(p_dossier_id uuid, p_to_status text, p_actor_id uuid, p_actor_type text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.transition_cee_dossier_status(p_dossier_id uuid, p_to_status text, p_actor_id uuid, p_actor_type text) TO service_role;

-- IBAN crypto — most sensitive: callable only by service_role (invoked from
-- other definer functions / admin server flows, never from JS directly).
REVOKE EXECUTE ON FUNCTION public.cee_encrypt_iban(p_iban text, p_key text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_encrypt_iban(p_iban text, p_key text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.cee_decrypt_iban(p_encrypted bytea, p_key text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_decrypt_iban(p_encrypted bytea, p_key text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.cee_store_partner_iban(p_partner_id uuid, p_iban text, p_bic text, p_titulaire text, p_key text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_store_partner_iban(p_partner_id uuid, p_iban text, p_bic text, p_titulaire text, p_key text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.cee_purge_email_outbox_dead() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_email_outbox_dead() TO service_role;

REVOKE EXECUTE ON FUNCTION public.cee_purge_expired_rgpd() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_purge_expired_rgpd() TO service_role;

REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;

REVOKE EXECUTE ON FUNCTION public.rate_limit_check(p_key text, p_limit integer, p_window_ms integer) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.rate_limit_check(p_key text, p_limit integer, p_window_ms integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.dispatch_lead(p_lead_id uuid, p_service_name text, p_city text, p_postal_code text, p_urgency text, p_latitude double precision, p_longitude double precision, p_source_table text, p_cee_eligible boolean) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.dispatch_lead(p_lead_id uuid, p_service_name text, p_city text, p_postal_code text, p_urgency text, p_latitude double precision, p_longitude double precision, p_source_table text, p_cee_eligible boolean) TO service_role;

REVOKE EXECUTE ON FUNCTION public.export_open_data_local_stats() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.export_open_data_local_stats() TO service_role;

REVOKE EXECUTE ON FUNCTION public.find_suppressed_emails(p_emails text[]) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.find_suppressed_emails(p_emails text[]) TO service_role;

REVOKE EXECUTE ON FUNCTION public.increment(p_table_name text, p_column_name text, row_id uuid) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.increment(p_table_name text, p_column_name text, row_id uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.next_document_number(p_provider_id uuid, p_kind text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.next_document_number(p_provider_id uuid, p_kind text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.outreach_opt_out(p_token text) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.outreach_opt_out(p_token text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.prospection_gdpr_erase(p_contact_id uuid) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.prospection_gdpr_erase(p_contact_id uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.refresh_artisan_stats() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.refresh_artisan_stats() TO service_role;

REVOKE EXECUTE ON FUNCTION public.refresh_provider_stats() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.refresh_provider_stats() TO service_role;

REVOKE EXECUTE ON FUNCTION public.snapshot_metrics_daily() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.snapshot_metrics_daily() TO service_role;

REVOKE EXECUTE ON FUNCTION public.sync_optout_to_suppressions() FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.sync_optout_to_suppressions() TO service_role;

-- -----------------------------------------------------------------------------
-- (A bis) RLS-client callers → keep authenticated, drop anon
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.create_booking_atomic(p_provider_id uuid, p_client_id uuid, p_service_id uuid, p_scheduled_date date, p_scheduled_time time without time zone, p_duration_minutes integer, p_address text, p_city character varying, p_postal_code character varying, p_notes text, p_total_amount numeric) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.create_booking_atomic(p_provider_id uuid, p_client_id uuid, p_service_id uuid, p_scheduled_date date, p_scheduled_time time without time zone, p_duration_minutes integer, p_address text, p_city character varying, p_postal_code character varying, p_notes text, p_total_amount numeric) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_artisan_dashboard_stats(p_provider_id uuid, p_period text) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_artisan_dashboard_stats(p_provider_id uuid, p_period text) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- (B) Drop broad public-bucket listing policies (object URL access unaffected)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view avatars"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view reviews"   ON storage.objects;

COMMIT;
