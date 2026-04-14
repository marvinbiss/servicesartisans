-- Migration 438: simulateur_estimations + baremes_versions
-- Date: 2026-04-14
-- Phase P1 simulateur aides rénovation
-- Doc archi: docs/simulateur-architecture.md §3
-- Doc valeurs: docs/baremes-sources/07-valeurs-officielles-confirmees-2026-04-14.md
-- Dépend: pgcrypto (gen_random_uuid)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 438.1  baremes_versions — dump JSON complet des barèmes par version
-- Stockage source pour reconstruction < 30s d'une estimation ancienne
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.baremes_versions (
  id              text PRIMARY KEY,                 -- ex: "2026-01-14"
  effective_from  date NOT NULL,
  source_doc      text NOT NULL,                    -- chemin doc source (ex: docs/baremes-sources/07-...)
  data            jsonb NOT NULL,                   -- dump complet des barèmes
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT baremes_versions_id_fmt_chk
    CHECK (id ~ '^[0-9]{4}-[0-9]{2}(-[0-9]{2})?$')
);

COMMENT ON TABLE  public.baremes_versions IS 'Snapshots JSON des barèmes officiels (MPR, CEE, plafonds ANAH, écrêtement, zones)';
COMMENT ON COLUMN public.baremes_versions.id IS 'Identifiant version: YYYY-MM ou YYYY-MM-DD';
COMMENT ON COLUMN public.baremes_versions.data IS 'Dump complet correspondant à BAREMES_YYYY_MM en code';

CREATE INDEX IF NOT EXISTS idx_baremes_versions_effective_from
  ON public.baremes_versions(effective_from DESC);

-- ---------------------------------------------------------------------------
-- 438.2  simulateur_estimations — estimations utilisateurs (lead + traçabilité)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.simulateur_estimations (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id               text NOT NULL UNIQUE,              -- EST-YYYY-MM-DD-xxxxxx
  barometre_version       text NOT NULL REFERENCES public.baremes_versions(id),
  lead_id                 uuid,                              -- FK future vers leads(id) si/quand la table existera
  pipedrive_deal_id       text,

  -- Situation logement
  type_logement           text NOT NULL CHECK (type_logement IN ('maison','appartement')),
  residence_principale    boolean NOT NULL,
  anciennete              text NOT NULL CHECK (anciennete IN ('moins_2_ans','2_a_15_ans','plus_15_ans')),
  surface_m2              integer NOT NULL CHECK (surface_m2 BETWEEN 15 AND 500),
  code_postal             text NOT NULL CHECK (code_postal ~ '^[0-9]{5}$'),
  zone_climatique         text NOT NULL CHECK (zone_climatique IN ('H1','H2','H3')),
  idf                     boolean NOT NULL,
  foyer_taille            integer NOT NULL CHECK (foyer_taille BETWEEN 1 AND 12),
  rfr                     integer NOT NULL CHECK (rfr >= 0),
  categorie_anah          text NOT NULL CHECK (categorie_anah IN ('bleu','jaune','violet','rose')),

  -- Projet travaux
  parcours                text NOT NULL CHECK (parcours IN ('geste','accompagne')),
  gestes                  jsonb NOT NULL,                    -- [{ id, label, forfait, source_bareme_id }]
  coup_de_pouce           boolean NOT NULL DEFAULT false,
  equipement_actuel       text CHECK (equipement_actuel IS NULL OR equipement_actuel IN ('gaz','fioul','charbon','elec','bois','autre')),
  sauts_dpe               integer CHECK (sauts_dpe IS NULL OR sauts_dpe BETWEEN 2 AND 4),

  -- Résultats snapshot
  mpr_total               numeric(10,2),
  cee_fourchette_bas      numeric(10,2),
  cee_fourchette_haut     numeric(10,2),
  coup_pouce_estimation   numeric(10,2),
  ecretement_pct          numeric(5,2),                      -- 60, 75, 90, 100
  reste_a_charge_bas      numeric(10,2),
  reste_a_charge_haut     numeric(10,2),

  -- Traçabilité
  bareme_ids              jsonb NOT NULL,                    -- ["MPR.PAC_AIREAU.JAUNE.2026-01", ...]
  formule_debug           jsonb,                             -- détail pipeline calcul

  -- Consentements RGPD
  consent_rgpd            boolean NOT NULL,
  consent_demarchage      boolean NOT NULL DEFAULT false,

  -- Audit
  created_at              timestamptz NOT NULL DEFAULT now(),
  ip_hash                 text,                              -- SHA-256 salé
  user_agent              text,

  CONSTRAINT simulateur_estimations_public_id_fmt_chk
    CHECK (public_id ~ '^EST-[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9]{6,12}$'),
  CONSTRAINT simulateur_estimations_rgpd_required_chk
    CHECK (consent_rgpd = true)
);

COMMENT ON TABLE  public.simulateur_estimations IS 'Estimations aides rénovation (simulateur public) — lead capture + traçabilité';
COMMENT ON COLUMN public.simulateur_estimations.public_id IS 'Identifiant partageable EST-YYYY-MM-DD-xxxxxx';
COMMENT ON COLUMN public.simulateur_estimations.barometre_version IS 'Version barèmes utilisée (FK baremes_versions)';
COMMENT ON COLUMN public.simulateur_estimations.lead_id IS 'FK future vers leads(id) — table leads non encore créée à date migration';
COMMENT ON COLUMN public.simulateur_estimations.bareme_ids IS 'IDs stables des forfaits consultés (ex: CEE.BAR-TH-148.MI.2026-01)';
COMMENT ON COLUMN public.simulateur_estimations.ip_hash IS 'SHA-256 salé — jamais IP en clair';

CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_public_id
  ON public.simulateur_estimations(public_id);
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_created_at
  ON public.simulateur_estimations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_categorie_parcours
  ON public.simulateur_estimations(categorie_anah, parcours);
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_zone
  ON public.simulateur_estimations(zone_climatique);
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_barometre_version
  ON public.simulateur_estimations(barometre_version);
CREATE INDEX IF NOT EXISTS idx_simulateur_estimations_lead_id
  ON public.simulateur_estimations(lead_id) WHERE lead_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 438.3  RLS — simulateur_estimations
-- Policies:
--   - anon/authenticated: INSERT autorisé (capture lead depuis formulaire public)
--   - SELECT/UPDATE/DELETE: service_role uniquement (via createAdminClient)
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulateur_estimations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS simulateur_estimations_anon_insert       ON public.simulateur_estimations;
DROP POLICY IF EXISTS simulateur_estimations_auth_insert       ON public.simulateur_estimations;
DROP POLICY IF EXISTS simulateur_estimations_no_select_public  ON public.simulateur_estimations;

-- INSERT: anon et authenticated peuvent soumettre une estimation
CREATE POLICY simulateur_estimations_anon_insert ON public.simulateur_estimations
  FOR INSERT TO anon
  WITH CHECK (consent_rgpd = true);

CREATE POLICY simulateur_estimations_auth_insert ON public.simulateur_estimations
  FOR INSERT TO authenticated
  WITH CHECK (consent_rgpd = true);

-- Pas de policy SELECT/UPDATE/DELETE pour anon/authenticated
-- → service_role bypass RLS et reste le seul à pouvoir lire / modifier

-- ---------------------------------------------------------------------------
-- 438.4  RLS — baremes_versions
-- Policies:
--   - SELECT autorisé pour anon/authenticated (référentiel public non sensible)
--   - INSERT/UPDATE/DELETE: service_role uniquement
-- ---------------------------------------------------------------------------
ALTER TABLE public.baremes_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS baremes_versions_public_read ON public.baremes_versions;

CREATE POLICY baremes_versions_public_read ON public.baremes_versions
  FOR SELECT TO anon, authenticated
  USING (true);

-- Pas de policy INSERT/UPDATE/DELETE → service_role uniquement

COMMIT;
