-- ===========================================================================
-- Migration 470b — CREATE FUNCTION snapshot_metrics_daily() variante "flat"
-- ===========================================================================
-- La 470 originale utilise un DECLARE imbriqué dans le bloc GSC. Le dashboard
-- Supabase SQL Editor injecte alors ENABLE RLS sur les vars internes.
-- Variante : toutes les variables au top-level du DECLARE.
-- À appliquer via psql direct (pas le dashboard).
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.snapshot_metrics_daily()
RETURNS public.metrics_snapshots
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $body$
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
  _clicks_7d           INTEGER := 0;
  _impressions_7d      BIGINT  := 0;
  _position_avg        NUMERIC(5,2);
  _ctr_pct             NUMERIC(5,3);
  _row                 public.metrics_snapshots;
BEGIN
  BEGIN
    SELECT
      count(*) FILTER (WHERE created_at >= _since_7d),
      count(*)
    INTO _devis_7d, _devis_total
    FROM public.devis_requests;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _estim_7d
    FROM public.estimation_leads;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _cee_7d
    FROM public.cee_leads;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT
      count(*) FILTER (WHERE is_active = true),
      count(*) FILTER (WHERE is_active = true AND rge_valid_until IS NOT NULL AND rge_valid_until > now()),
      count(*) FILTER (WHERE is_active = true AND claimed_at IS NOT NULL),
      count(*) FILTER (WHERE is_active = true AND description IS NOT NULL AND length(description) > 100)
    INTO _providers_total, _providers_rge, _providers_claimed, _providers_desc
    FROM public.providers;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT
      count(*) FILTER (WHERE status = 'pending'),
      count(*) FILTER (WHERE status = 'approved' AND updated_at >= _since_7d)
    INTO _claims_pending, _claims_approved_7d
    FROM public.provider_claims;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT
      count(*),
      count(*) FILTER (WHERE status = 'published'),
      count(*) FILTER (WHERE created_at >= _since_7d)
    INTO _reviews_total, _reviews_pub, _reviews_7d
    FROM public.reviews;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT count(*) FILTER (WHERE sent_at >= _since_7d)
    INTO _invitations_7d
    FROM public.review_invitations;
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  BEGIN
    SELECT
      COALESCE(SUM(clicks), 0)::INTEGER,
      COALESCE(SUM(impressions), 0)::BIGINT,
      CASE WHEN COALESCE(SUM(impressions), 0) > 0
           THEN ROUND((SUM(position * impressions) / SUM(impressions))::numeric, 2)
           ELSE NULL END,
      CASE WHEN COALESCE(SUM(impressions), 0) > 0
           THEN ROUND((100.0 * SUM(clicks) / SUM(impressions))::numeric, 3)
           ELSE NULL END
    INTO _clicks_7d, _impressions_7d, _position_avg, _ctr_pct
    FROM public.gsc_daily_metrics
    WHERE date >= (_today - INTERVAL '7 days');
  EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
  END;

  INSERT INTO public.metrics_snapshots (
    captured_at,
    clicks_7d, impressions_7d, position_avg, ctr_pct,
    devis_requests_7d, devis_requests_total, estimation_leads_7d, cee_leads_7d,
    providers_total, providers_rge_active, providers_claimed,
    claims_pending, claims_approved_7d,
    reviews_total, reviews_published, reviews_7d,
    invitations_sent_7d,
    providers_with_description
  )
  VALUES (
    _today,
    NULLIF(_clicks_7d, 0), NULLIF(_impressions_7d, 0), _position_avg, _ctr_pct,
    _devis_7d, _devis_total, _estim_7d, _cee_7d,
    _providers_total, _providers_rge, _providers_claimed,
    _claims_pending, _claims_approved_7d,
    _reviews_total, _reviews_pub, _reviews_7d,
    _invitations_7d,
    _providers_desc
  )
  ON CONFLICT (captured_at) DO UPDATE SET
    clicks_7d = COALESCE(EXCLUDED.clicks_7d, metrics_snapshots.clicks_7d),
    impressions_7d = COALESCE(EXCLUDED.impressions_7d, metrics_snapshots.impressions_7d),
    position_avg = COALESCE(EXCLUDED.position_avg, metrics_snapshots.position_avg),
    ctr_pct = COALESCE(EXCLUDED.ctr_pct, metrics_snapshots.ctr_pct),
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
    providers_with_description = EXCLUDED.providers_with_description;

  UPDATE public.metrics_snapshots
  SET conversion_rate = ROUND((100.0 * devis_requests_7d / NULLIF(clicks_7d, 0))::numeric, 3)
  WHERE captured_at = _today AND clicks_7d IS NOT NULL AND clicks_7d > 0;

  SELECT * INTO _row FROM public.metrics_snapshots WHERE captured_at = _today;
  RETURN _row;
END;
$body$;

COMMENT ON FUNCTION public.snapshot_metrics_daily() IS
  'Upsert snapshot du jour (DB-internes + GSC si dispo). Fail-open par bloc.';
