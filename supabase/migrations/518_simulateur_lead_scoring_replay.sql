-- Migration 518: Replay 452 + 453 + 499 + 399 — drift schema critique
-- Date: 2026-05-07
-- Contexte:
--   Diagnostic du bug "formulaire rénovation énergétique ne fonctionne pas" (2026-05-07).
--   POST /api/simulateur/submit retournait 500 "Erreur lors de la sauvegarde".
--   Cause: PostgREST 42703 column "age_chaudiere" does not exist.
--   12 colonnes manquaient en prod (mig 452 + 453 jamais appliquées).
--
--   En profondeur, /api/devis remontait 200 OK mais Pipedrive sync silently
--   failed (column devis_requests.source does not exist — mig 499 manquante)
--   et enrichCeeQualification fail-open (column cee_operations.forfaits_table
--   does not exist — mig 399 partiellement appliquée).
--
-- Vérification effectuée:
--   curl …/rest/v1/<table>?select=<col>&limit=1
--   → 14/14 colonnes manquantes confirmées.
--
-- Idempotent — ADD COLUMN IF NOT EXISTS sur tout. Safe à re-appliquer.

BEGIN;

-- ============================================================================
-- PART 1 — REPLAY MIG 452 (lead scoring phase 1)
-- ============================================================================

-- 518.1.1 Colonnes confiance (calculées par pipeline.ts, persistées depuis 452)
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS confidence_level text
    CHECK (confidence_level IS NULL OR confidence_level IN ('high', 'medium', 'low')),
  ADD COLUMN IF NOT EXISTS confidence_breakdown jsonb;

COMMENT ON COLUMN public.simulateur_estimations.confidence_level
  IS 'Niveau de confiance global (worst of 3 axes). Calculé par pipeline.ts.';
COMMENT ON COLUMN public.simulateur_estimations.confidence_breakdown
  IS 'Décomposition confiance {cee, surface, nonCumul} — chacun high/medium/low.';

-- 518.1.2 Colonnes UTM / attribution marketing
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
COMMENT ON COLUMN public.simulateur_estimations.utm_term IS 'UTM term — mot-clé ads';
COMMENT ON COLUMN public.simulateur_estimations.utm_content IS 'UTM content — variante créa ads';
COMMENT ON COLUMN public.simulateur_estimations.referrer IS 'HTTP referrer tronqué à 500 chars';

-- 518.1.3 Colonnes scoring commercial
ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS lead_score integer
    CHECK (lead_score IS NULL OR lead_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS lead_segment text
    CHECK (lead_segment IS NULL OR lead_segment IN ('hot', 'warm', 'cold'));

COMMENT ON COLUMN public.simulateur_estimations.lead_score
  IS 'Score commercial /100 — calculé par lead-scoring.ts. Sert au tri Pipedrive/admin.';
COMMENT ON COLUMN public.simulateur_estimations.lead_segment
  IS 'Segment commercial : hot (>=70) / warm (40-69) / cold (<40).';

-- 518.1.4 Index lead score / segment / utm
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_score
  ON public.simulateur_estimations (lead_score DESC NULLS LAST)
  WHERE lead_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_segment
  ON public.simulateur_estimations (lead_segment)
  WHERE lead_segment IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_utm_source
  ON public.simulateur_estimations (utm_source)
  WHERE utm_source IS NOT NULL;

-- ============================================================================
-- PART 2 — REPLAY MIG 453 (lead scoring phase 2)
-- ============================================================================

ALTER TABLE public.simulateur_estimations
  ADD COLUMN IF NOT EXISTS urgence_projet text,
  ADD COLUMN IF NOT EXISTS age_chaudiere text;

COMMENT ON COLUMN public.simulateur_estimations.urgence_projet IS
  'Urgence déclarée : urgent_panne | sous_3_mois | sous_6_mois | je_me_renseigne';
COMMENT ON COLUMN public.simulateur_estimations.age_chaudiere IS
  'Âge chaudière déclaré : moins_5_ans | 5_10_ans | 10_15_ans | plus_15_ans | en_panne';

CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_urgence
  ON public.simulateur_estimations (urgence_projet)
  WHERE urgence_projet IS NOT NULL;

-- ============================================================================
-- PART 3 — REPLAY MIG 499 (devis_requests.source) — fix Pipedrive sync silencieux
-- ============================================================================

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.devis_requests.source IS
  'Origine du lead pour attribution Pipedrive et reporting. NULL = défaut servicesartisans.fr. Convention LP : lp_<campaign>.';

CREATE INDEX IF NOT EXISTS idx_devis_requests_source_lp
  ON public.devis_requests (source)
  WHERE source IS NOT NULL;

-- ============================================================================
-- PART 4 — REPLAY MIG 399 (cee_operations.forfaits_table) — fix CEE enrichment
-- ============================================================================

ALTER TABLE public.cee_operations
  ADD COLUMN IF NOT EXISTS forfaits_table jsonb;

COMMENT ON COLUMN public.cee_operations.forfaits_table IS
  'Matrices de forfaits complètes (Etas × Zone × Usage × ...) pour les fiches BAR-TH-178/179/180. NULL pour les autres fiches qui utilisent forfait_base_kwhc scalaire. Mig 399.';

-- ============================================================================
-- PART 5 — Refresh PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- HOW TO APPLY (Marvin):
--   1. Ouvrir Supabase SQL Editor
--   2. Copier ce fichier ENTIER (BEGIN…COMMIT inclus, ne pas split — pas de DO $$)
--   3. Exécuter
--   4. Vérifier : SELECT age_chaudiere FROM simulateur_estimations LIMIT 1;
--   5. Re-tester /api/simulateur/submit en local : doit retourner 201 publicId
-- ============================================================================
