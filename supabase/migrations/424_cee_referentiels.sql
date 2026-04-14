-- Migration 424: CEE référentiels (operations, forfaits, plafonds revenus, zones climatiques) + extension cee_market_prices SPOT
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 420 (cee_market_prices existant)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 424.1  cee_operations_ref — Catalogue des fiches d'opérations standardisées
-- Familles: BAR (résidentiel), BAT (tertiaire), IND (industrie),
--           RES (réseaux), TRA (transport), AGRI (agriculture)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_operations_ref (
  code               text PRIMARY KEY,
  libelle            text NOT NULL,
  famille            text NOT NULL,
  fiche_url          text,
  date_debut         date NOT NULL,
  date_fin           date,
  actif              boolean GENERATED ALWAYS AS (
                       CURRENT_DATE >= date_debut
                       AND (date_fin IS NULL OR CURRENT_DATE <= date_fin)
                     ) STORED,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_operations_ref_code_fmt_chk
    CHECK (code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$')
);
COMMENT ON TABLE  public.cee_operations_ref IS 'Référentiel des opérations CEE standardisées (BAR/BAT/IND/RES/TRA/AGRI-XX-NNN)';
COMMENT ON COLUMN public.cee_operations_ref.actif IS 'Calculé: CURRENT_DATE dans [date_debut, date_fin]';
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_famille ON public.cee_operations_ref(famille);
CREATE INDEX IF NOT EXISTS idx_cee_operations_ref_actif   ON public.cee_operations_ref(actif) WHERE actif;

-- ---------------------------------------------------------------------------
-- 424.2  cee_forfaits — Barèmes kWh cumac + prime forfaitaire (versionnés)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_forfaits (
  id                      bigserial PRIMARY KEY,
  operation_code          text NOT NULL REFERENCES public.cee_operations_ref(code) ON UPDATE CASCADE,
  zone                    text NOT NULL,
  categorie_revenus       text NOT NULL,
  montant_kwh_cumac       bigint NOT NULL CHECK (montant_kwh_cumac >= 0),
  prime_forfait_eur_cts   bigint NOT NULL CHECK (prime_forfait_eur_cts >= 0),
  date_validite_debut     date NOT NULL,
  date_validite_fin       date,
  source_doc              text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cee_forfaits_unique UNIQUE
    (operation_code, zone, categorie_revenus, date_validite_debut)
);
COMMENT ON TABLE  public.cee_forfaits IS 'Barèmes CEE versionnés par opération/zone/revenus/date';
COMMENT ON COLUMN public.cee_forfaits.prime_forfait_eur_cts IS 'Prime forfaitaire en centimes EUR (bigint, jamais NUMERIC)';
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_debut ON public.cee_forfaits(date_validite_debut);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_validite_fin   ON public.cee_forfaits(date_validite_fin);
CREATE INDEX IF NOT EXISTS idx_cee_forfaits_operation      ON public.cee_forfaits(operation_code);

-- ---------------------------------------------------------------------------
-- 424.3  revenus_plafonds — Plafonds ANAH/MPR par zone & composition foyer
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.revenus_plafonds (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone                      text NOT NULL CHECK (zone IN ('IDF','HORS_IDF')),
  nb_personnes              smallint NOT NULL CHECK (nb_personnes BETWEEN 1 AND 10),
  plafond_tres_modeste_eur  integer NOT NULL,
  plafond_modeste_eur       integer NOT NULL,
  plafond_intermediaire_eur integer NOT NULL,
  plafond_superieur_eur     integer NOT NULL,
  date_validite_debut       date NOT NULL,
  date_validite_fin         date,
  created_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT revenus_plafonds_unique UNIQUE (zone, nb_personnes, date_validite_debut)
);
COMMENT ON TABLE public.revenus_plafonds IS 'Plafonds RFR en euros annuels par zone géo / composition / date';
CREATE INDEX IF NOT EXISTS idx_revenus_plafonds_validite ON public.revenus_plafonds(date_validite_debut);

-- ---------------------------------------------------------------------------
-- 424.4  zones_climatiques_ref — Mapping INSEE → zone H1/H2/H3
-- NB: clé = code INSEE (pas code postal) pour robustesse des communes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.zones_climatiques_ref (
  code_insee  text PRIMARY KEY CHECK (code_insee ~ '^[0-9AB]{5}$'),
  code_postal text CHECK (code_postal IS NULL OR code_postal ~ '^[0-9]{5}$'),
  commune     text,
  departement text,
  zone        text NOT NULL CHECK (zone IN ('H1','H2','H3')),
  note        text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.zones_climatiques_ref IS 'Zone climatique par code INSEE (CEE/RT)';
CREATE INDEX IF NOT EXISTS idx_zones_climatiques_zone ON public.zones_climatiques_ref(zone);
CREATE INDEX IF NOT EXISTS idx_zones_climatiques_cp   ON public.zones_climatiques_ref(code_postal);

-- ---------------------------------------------------------------------------
-- 424.5  cee_market_prices — EXTENSION pour SPOT (unification avec 420 existant)
-- Ne pas créer cee_spot_prices — on étend la table existante.
-- ---------------------------------------------------------------------------
-- Drop ancien CHECK sur price_type pour accepter 'spot'
DO $$ BEGIN
  ALTER TABLE public.cee_market_prices DROP CONSTRAINT cee_market_prices_price_type_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE public.cee_market_prices
  ADD COLUMN IF NOT EXISTS date_validite date,
  ADD COLUMN IF NOT EXISTS ingested_at   timestamptz;

DO $$ BEGIN
  ALTER TABLE public.cee_market_prices
    ADD CONSTRAINT cee_market_prices_price_type_check
    CHECK (price_type IN ('classique','precarite','spot'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Index pour SPOT queries (par date cotation)
CREATE INDEX IF NOT EXISTS idx_cee_market_prices_spot_date
  ON public.cee_market_prices(price_type, date_validite DESC)
  WHERE price_type = 'spot';

COMMENT ON COLUMN public.cee_market_prices.date_validite IS 'Date de cotation (SPOT) ou d''entrée en vigueur (classique/precarite)';
COMMENT ON COLUMN public.cee_market_prices.ingested_at IS 'Horodatage ingestion (SPOT scraping Emmy)';

COMMIT;
