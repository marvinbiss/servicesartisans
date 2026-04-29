-- ============================================================================
-- Migration 484 — Open Data : RPC export agrégats locaux (PII-free)
-- ============================================================================
-- Plan v2 ULTRA DOMINATION SEO synthèse 10-agents 2026-04-28 #4 :
--   "Dataset data.gouv.fr (DR 92, +5-8 DR), 2j".
--
-- Stratégie :
--   - Le dataset RGE existant (scripts/cron/export-rge-dataset.ts) est activé
--     en parallèle (kill switch RGE_DATASET_EXPORT_ENABLED=true).
--   - Ce nouveau RPC produit un SECOND dataset agrégats locaux (counts +
--     ratings moyens par ville × spécialité) sans aucune PII.
--   - Hébergement public via /api/open-data/local-stats.{csv,json}.
--   - Soumission data.gouv.fr → backlink DR 92 + crawl par autres réutilisateurs
--     opendata (insee.fr, observatoire-tpe-pme.fr, etc.).
--
-- ⚠️ ZÉRO PII : pas de nom artisan, pas de SIRET, pas d'email/phone, pas
-- d'adresse précise. Uniquement counts ≥ 10 (k-anonymat) + ratings agrégés.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.export_open_data_local_stats()
RETURNS TABLE (
  city_slug          TEXT,
  city_name          TEXT,
  department_code    TEXT,
  region_name        TEXT,
  specialty          TEXT,
  provider_count     INTEGER,
  rge_provider_count INTEGER,
  avg_rating         FLOAT8,
  review_count_total INTEGER,
  data_period_start  DATE,
  data_period_end    DATE,
  generated_at       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  -- k-anonymat ≥ 10 (audit security 2026-04-29 LOW) :
  -- Le seuil 5 permettait la triangulation par un attaquant connaissant 4
  -- artisans publics RGE d'une commune rare. Avec 10, l'attaque demande au
  -- moins 9 connaissances préalables — niveau de protection acceptable
  -- pour des données réutilisées par des outils opendata tiers.
  --
  -- avg_rating::float8 (audit code-reviewer 2026-04-29 P1-3) :
  -- NUMERIC est sérialisé en string JSON par PostgREST (préserve précision).
  -- On force float8 pour garantir un nombre dans le NDJSON public.
  --
  -- GROUP BY noms explicites (audit code-reviewer 2026-04-29 P0-2) :
  -- Évite tout drift silencieux si l'ordre des colonnes CTE change.
  WITH agg AS (
    SELECT
      lower(replace(p.address_city, ' ', '-'))         AS city_slug,
      p.address_city                                   AS city_name,
      left(p.address_postal_code, 2)                   AS department_code,
      p.address_region                                 AS region_name,
      p.specialty                                      AS specialty,
      count(*)::int                                    AS provider_count,
      count(*) FILTER (
        WHERE p.rge_qualifications IS NOT NULL
          AND jsonb_array_length(p.rge_qualifications) > 0
      )::int                                           AS rge_provider_count,
      round(avg(p.rating_average) FILTER (
        WHERE p.rating_average IS NOT NULL
          AND p.rating_average > 0
      )::numeric, 2)::float8                           AS avg_rating,
      coalesce(sum(p.review_count) FILTER (
        WHERE p.review_count IS NOT NULL
      ), 0)::int                                       AS review_count_total
    FROM public.providers p
    WHERE p.is_active = true
      AND coalesce(p.noindex, false) = false
      AND p.address_city IS NOT NULL
      AND p.specialty IS NOT NULL
    GROUP BY
      lower(replace(p.address_city, ' ', '-')),
      p.address_city,
      left(p.address_postal_code, 2),
      p.address_region,
      p.specialty
  )
  SELECT
    a.city_slug,
    a.city_name,
    a.department_code,
    a.region_name,
    a.specialty,
    a.provider_count,
    a.rge_provider_count,
    a.avg_rating,
    a.review_count_total,
    (date_trunc('month', now()) - INTERVAL '1 month')::date AS data_period_start,
    (date_trunc('month', now()))::date                  AS data_period_end,
    now()                                               AS generated_at
  FROM agg a
  WHERE a.provider_count >= 10
  ORDER BY a.department_code, a.city_name, a.specialty;
$$;

COMMENT ON FUNCTION public.export_open_data_local_stats() IS
  'Open Data : agrégats par ville × spécialité (k-anonymat ≥ 10). Source des datasets publics /api/open-data/local-stats. Licence Etalab 2.0 / CC-BY 4.0.';

-- Permissions : exécutable par tout le monde (lecture publique).
-- Pas de RLS bypass nécessaire — la fonction lit providers via SECURITY DEFINER
-- mais ne projette aucun champ PII (pas de SIRET / nom / email / phone).
GRANT EXECUTE ON FUNCTION public.export_open_data_local_stats() TO anon, authenticated;
