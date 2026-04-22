-- ===========================================================================
-- Migration 470 — Metrics snapshots : baseline J0 pour décisions CEO-level
-- ===========================================================================
-- Objectif : geler un cliché quotidien des KPIs business qui décident du
-- scaling S2-S4 (funnel fix, supply-side, content, backlinks). Sans ce
-- baseline, chaque move futur est invérifiable.
--
-- Règle : cette table n'est JAMAIS source de vérité. C'est un cliché agrégé
-- issu des tables opérationnelles (devis_requests, providers, provider_claims,
-- reviews, review_invitations, estimation_leads). Les métriques SEO externes
-- (GSC, Ahrefs) sont écrites par un script manuel (scripts/ingest-gsc-paste.ts)
-- parce que la mémoire `gsc_manual_paste` impose de ne jamais puller via MCP.
--
-- Dashboard /admin/metrics lit cette table. Décisions CEO :
--   S2 (funnel)  : conversion_rate 0.7% → ≥1.2% à J+14 ?
--   S3 (supply)  : providers_claimed 19 → ≥50 à J+21 ?
--   S4 (content) : clicks_7d +15-30% vs baseline J0 ?
--   S4 (PR)      : rd_ahrefs +3 à J+30 ?
-- ===========================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.metrics_snapshots (
  id                 BIGSERIAL PRIMARY KEY,
  captured_at        DATE        NOT NULL UNIQUE
    DEFAULT (now() AT TIME ZONE 'Europe/Paris')::DATE,

  -- ── SEO (externe, GSC paste manuel) ──────────────────────────────────────
  clicks_7d          INTEGER,              -- NULL tant que 1ère ingestion GSC
  impressions_7d     BIGINT,
  ctr_pct            NUMERIC(5,3),         -- clicks_7d / impressions_7d * 100
  urls_indexed       INTEGER,              -- Google Search Console
  position_avg       NUMERIC(5,2),

  -- ── Ahrefs (paste hebdo par Marvin) ──────────────────────────────────────
  dr_ahrefs          NUMERIC(4,1),
  rd_ahrefs          INTEGER,              -- referring domains uniques
  backlinks_total    INTEGER,
  organic_keywords   INTEGER,

  -- ── Funnel (DB interne, auto-agrégé) ─────────────────────────────────────
  devis_requests_7d  INTEGER NOT NULL DEFAULT 0,
  devis_requests_total INTEGER NOT NULL DEFAULT 0,
  estimation_leads_7d INTEGER NOT NULL DEFAULT 0,
  cee_leads_7d       INTEGER NOT NULL DEFAULT 0,
  conversion_rate    NUMERIC(5,3),         -- devis_requests_7d / clicks_7d (NULL si clicks_7d NULL)

  -- ── Supply-side (DB interne, auto-agrégé) ────────────────────────────────
  providers_total    INTEGER NOT NULL DEFAULT 0,
  providers_rge_active INTEGER NOT NULL DEFAULT 0,
  providers_claimed  INTEGER NOT NULL DEFAULT 0,
  claims_pending     INTEGER NOT NULL DEFAULT 0,
  claims_approved_7d INTEGER NOT NULL DEFAULT 0,

  -- ── UGC (DB interne, auto-agrégé) ────────────────────────────────────────
  reviews_total      INTEGER NOT NULL DEFAULT 0,
  reviews_published  INTEGER NOT NULL DEFAULT 0,
  reviews_7d         INTEGER NOT NULL DEFAULT 0,
  invitations_sent_7d INTEGER NOT NULL DEFAULT 0,

  -- ── Qualité (DB interne, auto-agrégé) ────────────────────────────────────
  providers_with_description INTEGER NOT NULL DEFAULT 0,

  -- ── Meta ─────────────────────────────────────────────────────────────────
  notes              TEXT,                  -- annotations manuelles (deploy, incident)
  source_gsc_week    TEXT,                  -- "2026-W17" = semaine du paste GSC
  source_ahrefs_at   TIMESTAMPTZ            -- timestamp paste Ahrefs
);

COMMENT ON TABLE public.metrics_snapshots IS
  'Cliché quotidien des KPIs business pour décisions CEO S2-S4. Baseline J0 = 2026-04-22. '
  'SEO/Ahrefs alimentés par paste manuel (règle gsc_manual_paste). Le reste auto-agrégé via RPC.';

COMMENT ON COLUMN public.metrics_snapshots.captured_at IS
  'Date Europe/Paris. 1 snapshot par jour max (UNIQUE). Le refresh cron upsert sur ce jour.';

COMMENT ON COLUMN public.metrics_snapshots.conversion_rate IS
  'devis_requests_7d / clicks_7d × 100. NULL tant que pas de paste GSC. Baseline attendue ~0.7%, cible S2 ≥1.2%.';

CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_captured_at
  ON public.metrics_snapshots(captured_at DESC);

-- ───────────────────────────────────────────────────────────────────────────
-- RPC : snapshot_metrics_daily()
-- Calcule toutes les métriques DB-internes (sans SEO externe) et upsert sur
-- le jour courant. Appelé par /api/cron/metrics-snapshot chaque nuit.
--
-- Fail-open sur chaque table : si une table manque (rollback pas appliqué),
-- on met 0 au lieu de faire planter tout le RPC. Chaque bloc est isolé.
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.snapshot_metrics_daily()
RETURNS public.metrics_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _today               DATE := (now() AT TIME ZONE 'Europe/Paris')::DATE;
  _since_7d            TIMESTAMPTZ := now() - INTERVAL '7 days';
  _devis_7d            INTEGER := 0;
  _devis_total         INTEGER := 0;
  _estim_7d            INTEGER := 0;
  _cee_7d              INTEGER := 0;
  _providers_total     INTEGER := 0;
  _providers_rge       INTEGER := 0;
  _providers_claimed   INTEGER := 0;
  _claims_pending      INTEGER := 0;
  _claims_approved_7d  INTEGER := 0;
  _reviews_total       INTEGER := 0;
  _reviews_pub         INTEGER := 0;
  _reviews_7d          INTEGER := 0;
  _invitations_7d      INTEGER := 0;
  _providers_desc      INTEGER := 0;
  _row                 public.metrics_snapshots;
BEGIN
  -- Devis requests (table principale)
  BEGIN
    SELECT
      count(*) FILTER (WHERE created_at >= _since_7d),
      count(*)
    INTO _devis_7d, _devis_total
    FROM public.devis_requests;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Estimation leads (simulateur + callback — 2 canaux Pipedrive)
  BEGIN
    SELECT count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _estim_7d
    FROM public.estimation_leads;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- CEE leads (mandataire)
  BEGIN
    SELECT count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _cee_7d
    FROM public.cee_leads;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Providers
  BEGIN
    SELECT
      count(*) FILTER (WHERE is_active = true),
      count(*) FILTER (WHERE is_active = true AND rge_valid_until IS NOT NULL AND rge_valid_until > now()),
      count(*) FILTER (WHERE is_active = true AND claimed_at IS NOT NULL),
      count(*) FILTER (WHERE is_active = true AND description IS NOT NULL AND length(description) > 100)
    INTO _providers_total, _providers_rge, _providers_claimed, _providers_desc
    FROM public.providers;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Claims
  BEGIN
    SELECT
      count(*) FILTER (WHERE status = 'pending'),
      count(*) FILTER (WHERE status = 'approved' AND updated_at >= _since_7d)
    INTO _claims_pending, _claims_approved_7d
    FROM public.provider_claims;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Reviews (published côté public)
  BEGIN
    SELECT
      count(*),
      count(*) FILTER (WHERE status = 'published'),
      count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _reviews_total, _reviews_pub, _reviews_7d
    FROM public.reviews;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Invitations review (flywheel, cron envoie dès 2026-04-27)
  BEGIN
    SELECT count(*) FILTER (WHERE sent_at >= _since_7d)
    INTO _invitations_7d
    FROM public.review_invitations;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- GSC metrics (auto-enrichi depuis gsc_daily_metrics si synchronisé).
  -- Le cron gsc-sync.ts alimente cette table ; on rollup les 7 derniers jours.
  DECLARE
    _clicks_7d      INTEGER;
    _impressions_7d BIGINT;
    _position_avg   NUMERIC(5,2);
    _ctr_pct        NUMERIC(5,3);
  BEGIN
    SELECT
      COALESCE(SUM(clicks), 0)::INTEGER,
      COALESCE(SUM(impressions), 0)::BIGINT,
      -- position moyenne pondérée par impressions (meilleure estimation SERP)
      CASE WHEN COALESCE(SUM(impressions), 0) > 0
           THEN ROUND((SUM(position * impressions) / SUM(impressions))::numeric, 2)
           ELSE NULL END,
      CASE WHEN COALESCE(SUM(impressions), 0) > 0
           THEN ROUND((100.0 * SUM(clicks) / SUM(impressions))::numeric, 3)
           ELSE NULL END
    INTO _clicks_7d, _impressions_7d, _position_avg, _ctr_pct
    FROM public.gsc_daily_metrics
    WHERE date >= (_today - INTERVAL '7 days');

    -- Rôle : UPSERT partiel pour ces colonnes dès qu'on a des données GSC.
    -- Si gsc_daily_metrics vide → _clicks_7d = 0, on n'écrase pas le NULL
    -- des colonnes "externes" (elles restent alimentables par paste manuel).
    INSERT INTO public.metrics_snapshots (captured_at, clicks_7d, impressions_7d, position_avg, ctr_pct)
    VALUES (_today, NULLIF(_clicks_7d, 0), NULLIF(_impressions_7d, 0), _position_avg, _ctr_pct)
    ON CONFLICT (captured_at) DO UPDATE SET
      clicks_7d = COALESCE(EXCLUDED.clicks_7d, metrics_snapshots.clicks_7d),
      impressions_7d = COALESCE(EXCLUDED.impressions_7d, metrics_snapshots.impressions_7d),
      position_avg = COALESCE(EXCLUDED.position_avg, metrics_snapshots.position_avg),
      ctr_pct = COALESCE(EXCLUDED.ctr_pct, metrics_snapshots.ctr_pct);
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    NULL;
  END;

  -- Upsert sur le jour courant (ne touche pas aux colonnes SEO externes)
  INSERT INTO public.metrics_snapshots (
    captured_at,
    devis_requests_7d, devis_requests_total, estimation_leads_7d, cee_leads_7d,
    providers_total, providers_rge_active, providers_claimed,
    claims_pending, claims_approved_7d,
    reviews_total, reviews_published, reviews_7d,
    invitations_sent_7d,
    providers_with_description
  )
  VALUES (
    _today,
    _devis_7d, _devis_total, _estim_7d, _cee_7d,
    _providers_total, _providers_rge, _providers_claimed,
    _claims_pending, _claims_approved_7d,
    _reviews_total, _reviews_pub, _reviews_7d,
    _invitations_7d,
    _providers_desc
  )
  ON CONFLICT (captured_at) DO UPDATE SET
    devis_requests_7d = EXCLUDED.devis_requests_7d,
    devis_requests_total = EXCLUDED.devis_requests_total,
    estimation_leads_7d = EXCLUDED.estimation_leads_7d,
    cee_leads_7d = EXCLUDED.cee_leads_7d,
    providers_total = EXCLUDED.providers_total,
    providers_rge_active = EXCLUDED.providers_rge_active,
    providers_claimed = EXCLUDED.providers_claimed,
    claims_pending = EXCLUDED.claims_pending,
    claims_approved_7d = EXCLUDED.claims_approved_7d,
    reviews_total = EXCLUDED.reviews_total,
    reviews_published = EXCLUDED.reviews_published,
    reviews_7d = EXCLUDED.reviews_7d,
    invitations_sent_7d = EXCLUDED.invitations_sent_7d,
    providers_with_description = EXCLUDED.providers_with_description
  RETURNING * INTO _row;

  -- Calcul dérivé : conversion_rate = devis_7d / clicks_7d × 100
  -- Ne s'exécute que si GSC a des données (sinon conversion reste NULL).
  UPDATE public.metrics_snapshots
  SET conversion_rate = ROUND((100.0 * _row.devis_requests_7d / NULLIF(clicks_7d, 0))::numeric, 3)
  WHERE captured_at = _today AND clicks_7d IS NOT NULL AND clicks_7d > 0
  RETURNING * INTO _row;

  -- Si l'UPDATE n'a pas trouvé de row (pas de clicks_7d), re-fetch
  IF _row.id IS NULL THEN
    SELECT * INTO _row FROM public.metrics_snapshots WHERE captured_at = _today;
  END IF;

  RETURN _row;
END;
$$;

COMMENT ON FUNCTION public.snapshot_metrics_daily() IS
  'Upsert snapshot du jour (DB-internes uniquement). Les colonnes SEO externes (clicks_7d, dr_ahrefs, etc.) '
  'sont laissées intactes — alimentées par scripts/ingest-gsc-paste.ts et paste Ahrefs manuel. '
  'Fail-open sur chaque bloc SELECT : tables manquantes n''interrompent pas le snapshot.';

-- ───────────────────────────────────────────────────────────────────────────
-- RLS : table admin-only. Lecture via service_role (admin client) uniquement.
-- Aucune policy publique : /admin/metrics utilise l'admin client.
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy explicite de refus pour anon + authenticated. Seul le service_role
-- (admin client) bypass RLS et peut lire/écrire. L'audit RLS exige au moins
-- une policy par table RLS-activée pour détecter les oublis de config.
DROP POLICY IF EXISTS "deny_all_non_service_role" ON public.metrics_snapshots;
CREATE POLICY "deny_all_non_service_role"
  ON public.metrics_snapshots
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

COMMIT;
