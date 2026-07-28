-- =============================================================================
-- Migration 551 — Attribution click-ID Google Ads + journal des conversions
-- ServicesArtisans — 2026-07-28
-- =============================================================================
--
-- Contexte
-- --------
-- La mig 499 a ajouté `devis_requests.source` (`lp_<campaign>`), ce qui permet
-- de savoir QUELLE landing page a produit un lead, mais pas QUEL CLIC. Sans le
-- `gclid`, l'import de conversions hors ligne (Offline Conversion Import) vers
-- Google Ads est impossible : le Smart Bidding continue d'optimiser sur
-- « formulaire soumis » au lieu de « lead réellement dispatché / devisé ».
-- Sur un modèle de leads exclusifs, l'écart entre ces deux signaux est
-- exactement la marge.
--
-- Cette migration ajoute :
--   1. Les colonnes d'attribution paid sur `devis_requests`
--   2. La table `ads_conversion_uploads` = journal idempotent des conversions
--      déjà remontées à Google Ads
--
-- Idempotente (IF NOT EXISTS partout). Aucun back-fill : les leads antérieurs
-- restent à NULL et sont ignorés par le cron d'upload.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Colonnes d'attribution sur devis_requests
-- -----------------------------------------------------------------------------
-- Un clic ne porte qu'UN SEUL des trois identifiants :
--   gclid  : clic standard (auto-tagging Google Ads)
--   gbraid : parcours iOS app -> web sans cookie tiers
--   wbraid : parcours web iOS sans cookie tiers

ALTER TABLE public.devis_requests
  ADD COLUMN IF NOT EXISTS gclid TEXT,
  ADD COLUMN IF NOT EXISTS gbraid TEXT,
  ADD COLUMN IF NOT EXISTS wbraid TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT;

COMMENT ON COLUMN public.devis_requests.gclid IS
  'Google Ads click ID (auto-tagging). Support de l''Offline Conversion Import. Mig 551.';
COMMENT ON COLUMN public.devis_requests.gbraid IS
  'Google Ads click ID parcours iOS app->web (sans cookie tiers). Mig 551.';
COMMENT ON COLUMN public.devis_requests.wbraid IS
  'Google Ads click ID parcours web iOS (sans cookie tiers). Mig 551.';

-- Index partiel : le cron d'upload ne balaie QUE les leads porteurs d'un
-- click-ID (une fraction infime du volume total). Sans le filtre partiel,
-- l'index couvrirait ~100 % de NULL pour rien.
CREATE INDEX IF NOT EXISTS idx_devis_requests_ads_click
  ON public.devis_requests (created_at DESC)
  WHERE gclid IS NOT NULL OR gbraid IS NOT NULL OR wbraid IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. Journal des conversions remontées à Google Ads
-- -----------------------------------------------------------------------------
-- La contrainte UNIQUE (devis_request_id, conversion_action) est le garde-fou
-- central : un double upload de la même conversion gonfle artificiellement les
-- conversions côté Ads et corrompt le Smart Bidding — donc les enchères, donc
-- le budget. L'unicité rend le cron rejouable sans risque.

CREATE TABLE IF NOT EXISTS public.ads_conversion_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devis_request_id UUID NOT NULL
    REFERENCES public.devis_requests(id) ON DELETE CASCADE,
  -- Clé logique de l'action de conversion ('lead_dispatched', 'lead_quoted').
  -- Le mapping vers le resource name Google Ads vit en env, pas en base.
  conversion_action TEXT NOT NULL,
  click_id TEXT NOT NULL,
  click_id_type TEXT NOT NULL
    CHECK (click_id_type IN ('gclid', 'gbraid', 'wbraid')),
  conversion_value_eur NUMERIC(10, 2),
  -- Horodatage métier de la conversion (date de l'événement, pas de l'upload).
  conversion_at TIMESTAMPTZ NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (devis_request_id, conversion_action)
);

COMMENT ON TABLE public.ads_conversion_uploads IS
  'Journal idempotent des conversions hors ligne remontées à Google Ads (OCI). UNIQUE(devis_request_id, conversion_action) empêche le double comptage qui corromprait le Smart Bidding. Mig 551.';

CREATE INDEX IF NOT EXISTS idx_ads_conversion_uploads_devis
  ON public.ads_conversion_uploads (devis_request_id);

-- -----------------------------------------------------------------------------
-- 3. RLS — service_role uniquement
-- -----------------------------------------------------------------------------
-- Donnée purement back-office (le cron tourne en service_role, qui bypasse
-- RLS). Aucun rôle applicatif n'a de raison de lire ce journal : on active RLS
-- sans policy permissive, ce qui ferme la table à `anon` et `authenticated`.

ALTER TABLE public.ads_conversion_uploads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ads_conversion_uploads FROM anon, authenticated;
GRANT ALL ON public.ads_conversion_uploads TO service_role;

COMMIT;

-- =============================================================================
-- Rollback :
--
--   BEGIN;
--   DROP TABLE IF EXISTS public.ads_conversion_uploads;
--   DROP INDEX IF EXISTS public.idx_devis_requests_ads_click;
--   ALTER TABLE public.devis_requests
--     DROP COLUMN IF EXISTS gclid,
--     DROP COLUMN IF EXISTS gbraid,
--     DROP COLUMN IF EXISTS wbraid,
--     DROP COLUMN IF EXISTS utm_source,
--     DROP COLUMN IF EXISTS utm_medium,
--     DROP COLUMN IF EXISTS utm_campaign,
--     DROP COLUMN IF EXISTS utm_term,
--     DROP COLUMN IF EXISTS utm_content;
--   COMMIT;
--
-- -> Perte : l'historique des uploads. Les conversions déjà remontées restent
--    côté Google Ads ; un re-run après rollback les dupliquerait. Ne rollback
--    que si le cron est désactivé.
-- =============================================================================
