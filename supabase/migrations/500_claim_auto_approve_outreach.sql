-- =============================================================================
-- Migration 500 — Sprint 4 vague 4 (2026-05-04) supply activation
-- =============================================================================
--
-- Deux features couplées qui adressent le bottleneck supply (claim_rate
-- 0.002% = 19 / 970K) identifié par audits Ahrefs vagues 1-4 + CEO 2026-04-20 :
--
--   A) Auto-approve des claims pending qui satisfont 4 conditions strictes
--      (SIRET déjà matché côté createClaim + RGE actif + email confirmé +
--      provider non claimed). Cron horaire scanne et approuve via
--      approveClaim service. Audit log dédié pour traçabilité IA/admin.
--
--   B) Outreach Lemlist top 200 artisans RGE non claimed. Tracking par
--      provider_outreach_log (channel, sent_at, opt_out_at) avec endpoint
--      public /api/outreach/opt-out/[token] pour conformité RGPD pro B2B
--      (opt-out 1-clic en pied d'email).
--
-- Politique business validée Marvin 2026-05-04 :
--   - Auto-approve A : SIRET match + RGE valid_until>now + email confirm
--     7j + provider.user_id NULL → safe car SIRET officiel + RGE ADEME.
--   - Outreach B : email pro lié activité (RGE) + opt-out 1-clic + sujet
--     sobre. Standard CNIL pro B2B France.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- A.1 — provider_claims : email confirmation
-- -----------------------------------------------------------------------------
-- Token HMAC stocké en clair (URL-safe random 32 bytes base64url côté code,
-- pas un secret partagé). On accepte le pattern car le scope est limité
-- (1 token par claim, expire 7j, single-use, audit log).

ALTER TABLE public.provider_claims
  ADD COLUMN IF NOT EXISTS email_confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS email_confirmation_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_provider_claims_email_token
  ON public.provider_claims (email_confirmation_token)
  WHERE email_confirmation_token IS NOT NULL;

COMMENT ON COLUMN public.provider_claims.email_confirmation_token IS
  'Token URL-safe 32 bytes pour confirm email (Sprint 4 vague 4). Single-use, expire 7j. Précondition auto-approve.';

-- -----------------------------------------------------------------------------
-- A.2 — claims_auto_approve_log : audit trail décisions cron
-- -----------------------------------------------------------------------------
-- Trace chaque tentative d'auto-approve avec décision + raisons.
-- Permet d'auditer les approuvés (KPI) et les rejetés (debug).

CREATE TABLE IF NOT EXISTS public.claims_auto_approve_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.provider_claims(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'skipped')),
  reasons TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  rge_valid_until TIMESTAMPTZ,
  email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claims_auto_approve_log_claim
  ON public.claims_auto_approve_log (claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_auto_approve_log_decided
  ON public.claims_auto_approve_log (decided_at DESC);

ALTER TABLE public.claims_auto_approve_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.claims_auto_approve_log FROM PUBLIC;
REVOKE ALL ON TABLE public.claims_auto_approve_log FROM anon, authenticated;
GRANT ALL ON TABLE public.claims_auto_approve_log TO service_role;

-- Policies explicites : service_role only. Pas de fallback anon/authenticated
-- pour qu'aucune requête PostgREST publique ne puisse lire les decisions cron.
CREATE POLICY "service_role_all_claims_auto_approve_log"
  ON public.claims_auto_approve_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.claims_auto_approve_log IS
  'Audit log auto-approve cron Sprint 4 vague 4. Service-role only. Inspectable via admin dashboard.';

-- -----------------------------------------------------------------------------
-- B.1 — provider_outreach_log : tracking outreach Lemlist
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.provider_outreach_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('lemlist', 'manual', 'sms')),
  campaign TEXT,
  email_to TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'bounced', 'replied', 'opt_out')),
  opt_out_token TEXT,
  opt_out_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_provider_outreach_log_provider
  ON public.provider_outreach_log (provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_outreach_log_opt_out_token
  ON public.provider_outreach_log (opt_out_token)
  WHERE opt_out_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_provider_outreach_log_sent
  ON public.provider_outreach_log (sent_at DESC);

ALTER TABLE public.provider_outreach_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.provider_outreach_log FROM PUBLIC;
REVOKE ALL ON TABLE public.provider_outreach_log FROM anon, authenticated;
GRANT ALL ON TABLE public.provider_outreach_log TO service_role;

-- Policies explicites : service_role only. Le opt-out public passe par le RPC
-- `outreach_opt_out` (SECURITY DEFINER) qui contourne les policies — anon ne
-- peut pas SELECT/UPDATE direct sur la table.
CREATE POLICY "service_role_all_provider_outreach_log"
  ON public.provider_outreach_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.provider_outreach_log IS
  'Outreach tracking pro B2B Sprint 4 vague 4. Service-role + endpoint public /api/outreach/opt-out/[token] pour 1-clic.';

-- -----------------------------------------------------------------------------
-- B.2 — RPC opt-out 1-clic (appelé par /api/outreach/opt-out/[token])
-- -----------------------------------------------------------------------------
-- search_path pinned (CVE-2018-1058 — règle CLAUDE.md projet).

CREATE OR REPLACE FUNCTION public.outreach_opt_out(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_token IS NULL OR length(p_token) < 16 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.provider_outreach_log
     SET opt_out_at = now(),
         status = 'opt_out'
   WHERE opt_out_token = p_token
     AND opt_out_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.outreach_opt_out(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.outreach_opt_out(TEXT) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.outreach_opt_out(TEXT) IS
  'Sprint 4 vague 4 — opt-out 1-clic RGPD pro B2B. Pas d auth (lien public dans email). Single-use idempotent.';

COMMIT;
