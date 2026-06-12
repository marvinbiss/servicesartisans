-- Migration 549: re-harden the `lead_exclusivity_audit` view (security_invoker).
--
-- Supabase database linter (2026-06-12) flags `public.lead_exclusivity_audit`
-- as ERROR `security_definer_view`: the view runs with the creator's
-- privileges instead of the caller's, bypassing RLS on `lead_assignments`.
--
-- Root cause = schema drift. Migration 472 (section F, 2026-04-24) already set
-- this view to `security_invoker = true`. But the view is defined with
-- `CREATE OR REPLACE VIEW` (migration 455) WITHOUT a WITH clause, and
-- `CREATE OR REPLACE VIEW` resets all view options to their defaults. Any
-- replay of 455 after 472 silently reverts the view back to SECURITY DEFINER
-- — which is exactly what the live linter now reports.
--
-- Impact while DEFINER: `lead_exclusivity_audit` projects `lead_assignments`
-- (lead_id, provider_id, assigned_at, status, exclusivity proof hash). Under
-- Supabase default privileges anon/authenticated hold SELECT on new public
-- views, so as DEFINER the RLS on `lead_assignments` is skipped and the lead
-- flow PII leaks to any caller.
--
-- Fix: flip back to `security_invoker = true`. `lead_assignments` has RLS
-- (migration 545), so the check re-applies at SELECT — an authenticated
-- artisan sees only their own assignments (artisan dashboard + DGCCRF proof
-- preserved), anon sees nothing. Idempotent.
--
-- Note: the two other linter `security_definer_view` ERRORs
-- (`artisans_public` mig 532, `providers_public` mig 534/546) are DELIBERATE
-- SECURITY DEFINER projections that gate PII while profiles/providers RLS is
-- enabled; flipping them to invoker would block anonymous public reads. They
-- stay DEFINER by design. `spatial_ref_sys` is a PostGIS-owned system table
-- (cannot ALTER, not owner) — both are accepted linter baseline entries.

DO $$
BEGIN
  IF to_regclass('public.lead_exclusivity_audit') IS NOT NULL THEN
    EXECUTE 'ALTER VIEW public.lead_exclusivity_audit SET (security_invoker = true)';
    RAISE NOTICE 'OK lead_exclusivity_audit : security_invoker = true';
  ELSE
    RAISE NOTICE 'SKIP lead_exclusivity_audit : view absente';
  END IF;
END
$$;

COMMENT ON VIEW public.lead_exclusivity_audit IS
  'Audit trail pour la regle "1 lead = 1 artisan". exclusivity_proof_hash est un SHA256(lead_id:provider_id:assigned_at) immuable servant de preuve pour les artisans + DGCCRF. security_invoker=true (mig 549) : RLS de lead_assignments appliquee au caller — re-harden apres drift replay 455 qui annulait mig 472 sec F.';

-- Rollback (NE PAS jouer — reintroduit la fuite) :
--   ALTER VIEW public.lead_exclusivity_audit SET (security_invoker = false);
