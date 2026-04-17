-- Migration 452: Lead scoring Phase 1 — confidence persistence + UTM + score composite
-- Date: 2026-04-17
-- Doc: audit simulateur Phase 1 scoring commercial
-- Dépend: migrations 438, 440, 444, 450, 451
--
-- Pourquoi cette migration :
--   1. confidenceLevel + confidenceBreakdown calculés par pipeline.ts mais jamais persistés
--   2. UTM/referrer absents → pas d'attribution marketing
--   3. lead_score/lead_segment absents → scoring commercial basique (fioul only)

BEGIN;

-- ---------------------------------------------------------------------------
-- 452.1  Colonnes confiance (déjà calculées par le pipeline, jamais persistées)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS confidence_level text
    CHECK (confidence_level IS NULL OR confidence_level IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS confidence_breakdown jsonb;

COMMENT ON COLUMN public.simulateur_estimations.confidence_level
  IS 'Niveau de confiance global (worst of 3 axes). Calculé par pipeline.ts.';
COMMENT ON COLUMN public.simulateur_estimations.confidence_breakdown
  IS 'Décomposition confiance {cee, surface, nonCumul} — chacun high/medium/low.';

-- ---------------------------------------------------------------------------
-- 452.2  Colonnes UTM / attribution marketing
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS referrer text;

COMMENT ON COLUMN public.simulateur_estimations.utm_source IS 'UTM source (ex: google, facebook)';
COMMENT ON COLUMN public.simulateur_estimations.utm_medium IS 'UTM medium (ex: cpc, organic)';
COMMENT ON COLUMN public.simulateur_estimations.utm_campaign IS 'UTM campaign (ex: primes-cee-2026)';
COMMENT ON COLUMN public.simulateur_estimations.utm_term IS 'UTM term — mot-clé ads (ex: pompe chaleur prix)';
COMMENT ON COLUMN public.simulateur_estimations.utm_content IS 'UTM content — variante créa ads (ex: banner-v2)';
COMMENT ON COLUMN public.simulateur_estimations.referrer IS 'HTTP referrer tronqué à 500 chars côté app (slice dans submit route)';

-- ---------------------------------------------------------------------------
-- 452.3  Colonnes scoring commercial
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS lead_score integer
    CHECK (lead_score IS NULL OR lead_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS lead_segment text
    CHECK (lead_segment IS NULL OR lead_segment IN ('hot', 'warm', 'cold'));

COMMENT ON COLUMN public.simulateur_estimations.lead_score
  IS 'Score commercial /100 — calculé par lead-scoring.ts. Sert au tri dans Pipedrive/admin.';
COMMENT ON COLUMN public.simulateur_estimations.lead_segment
  IS 'Segment commercial : hot (>=70) / warm (40-69) / cold (<40).';

-- ---------------------------------------------------------------------------
-- 452.4  Index pour tri leads par score dans l''admin
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_score
  ON public.simulateur_estimations (lead_score DESC NULLS LAST)
  WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_segment
  ON public.simulateur_estimations (lead_segment)
  WHERE lead_segment IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 452.5  Index pour analyse UTM (attribution marketing)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_utm_source
  ON public.simulateur_estimations (utm_source)
  WHERE utm_source IS NOT NULL;

COMMIT;
