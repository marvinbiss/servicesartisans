-- =============================================================================
-- Migration 402 — CEE Dossiers (Brique 2 roadmap mandataire CEE)
-- =============================================================================
-- Schéma de persistance du dossier CEE : suit le cycle de vie complet d'une
-- prime CEE depuis la signature du devis jusqu'au dépôt PNCEE, en passant par
-- la pré-visite, la réalisation des travaux, la collecte des justificatifs et
-- la dépose au délégataire.
--
-- Contexte réglementaire
-- ----------------------
--   - Loi n° 2025-594 du 30 juin 2025 (art. 13) : photos AVANT/APRÈS
--     horodatées et géolocalisées obligatoires, preuve d'information
--     précontractuelle, conservation 6 ans de TOUS les justificatifs.
--   - Arrêté du 6 septembre 2025 : date d'engagement figée à la signature du
--     devis, ne peut plus être modifiée (sanction : 10% du CA HT en cas de
--     non-conformité constatée par le PNCEE).
--   - Arrêté du 4 septembre 2014 modifié (annexe 7) : liste des justificatifs
--     archivés — structure JSONB alignée sur migration 400.
--
-- Deux tables :
--   1. `cee_dossiers`         — 1 ligne = 1 dossier CEE en cours de cycle
--   2. `cee_dossier_events`   — journal immuable d'audit (append-only)
--
-- Triggers :
--   - updated_at standard
--   - immutabilité de date_engagement une fois fixée (loi 2025-594)
--   - DAG de transitions de statut (autorise uniquement les chemins légaux)
--   - audit log automatique sur INSERT/UPDATE
--   - blocage des UPDATE sur cee_dossier_events (journal append-only)
--
-- Brique 2 de la roadmap mandataire CEE (décision 2026-04-09). Les briques
-- suivantes (dashboard, API délégataires, dépose PNCEE) s'appuieront sur
-- ce schéma.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Table principale : cee_dossiers
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cee_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ---------------------------------------------------------------------------
  -- Relations
  -- ---------------------------------------------------------------------------
  -- FK souple vers devis_requests (ON DELETE SET NULL : on garde la trace du
  -- dossier CEE même si le devis d'origine est purgé). La table existe bien
  -- (cf. migration 100_v2_schema_cleanup.sql ligne 279).
  devis_id UUID REFERENCES devis_requests(id) ON DELETE SET NULL,

  -- Client bénéficiaire. FK vers profiles (convention projet) plutôt que
  -- auth.users directement : profiles.id = auth.users.id et les policies
  -- existantes s'appuient sur profiles.
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Artisan exécutant les travaux. FK vers providers (NOT NULL : un dossier
  -- sans artisan ne fait aucun sens métier).
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,

  -- Délégataire cible du dépôt. NULL tant que le routing n'a pas été fait
  -- (early stage du dossier). Rempli par la brique 3 (routing).
  delegataire_id UUID REFERENCES cee_delegataires(id) ON DELETE SET NULL,

  -- ---------------------------------------------------------------------------
  -- Opération CEE
  -- ---------------------------------------------------------------------------
  -- FK implicite vers cee_operations.code (pas de FK physique car la colonne
  -- `code` est UNIQUE mais on privilégie la flexibilité : un dossier peut
  -- référencer une fiche active au moment de la signature, la fiche peut
  -- ensuite être abrogée sans casser l'historique).
  operation_code TEXT NOT NULL,

  -- ---------------------------------------------------------------------------
  -- Workflow
  -- ---------------------------------------------------------------------------
  -- DAG de statuts — transitions contrôlées par un trigger BEFORE UPDATE.
  status TEXT NOT NULL DEFAULT 'brouillon'
    CHECK (status IN (
      'brouillon',              -- devis pas encore signé
      'pre_visite_planifiee',   -- RDV pré-visite fixé
      'pre_visite_effectuee',   -- visite faite, dossier validé côté technique
      'engagement_signe',       -- devis signé, date_engagement FIGÉE
      'travaux_en_cours',       -- chantier démarré
      'travaux_acheves',        -- chantier fini, en attente AH
      'ah_signee',              -- attestation sur l'honneur signée
      'depose_delegataire',     -- dossier envoyé au délégataire
      'depose_pncee',           -- dossier déposé PNCEE par le délégataire
      'valide',                 -- PNCEE a validé
      'rejete',                 -- PNCEE ou délégataire a rejeté
      'annule'                  -- dossier annulé (client ou artisan)
    )),

  -- ---------------------------------------------------------------------------
  -- Dates clés (cycle de vie)
  -- ---------------------------------------------------------------------------
  -- FIGÉE une fois fixée (trigger d'immutabilité). Loi 2025-594 : la date
  -- d'engagement = date de signature du devis, ne peut plus bouger ensuite.
  date_engagement DATE,

  date_pre_visite       TIMESTAMPTZ,
  date_debut_travaux    DATE,
  date_fin_travaux      DATE,
  date_ah_signature     TIMESTAMPTZ,
  date_depot_delegataire TIMESTAMPTZ,
  date_depot_pncee      TIMESTAMPTZ,
  date_validation       TIMESTAMPTZ,

  -- ---------------------------------------------------------------------------
  -- Localisation / climat
  -- ---------------------------------------------------------------------------
  zone_climatique TEXT CHECK (zone_climatique IS NULL OR zone_climatique IN ('H1', 'H2', 'H3')),
  postal_code TEXT,

  -- ---------------------------------------------------------------------------
  -- Valorisation CEE (kWh cumac)
  -- ---------------------------------------------------------------------------
  -- kwhc_estime   : estimation initiale (sortie de src/lib/cee/enrich.ts,
  --                 bornée à la valorisation max de la fiche).
  -- kwhc_depose   : valeur effectivement déposée au délégataire (peut
  --                 différer si le chantier s'est écarté du dimensionnement).
  kwhc_estime BIGINT CHECK (kwhc_estime IS NULL OR kwhc_estime >= 0),
  kwhc_depose BIGINT CHECK (kwhc_depose IS NULL OR kwhc_depose >= 0),

  prime_estimee_eur NUMERIC(12, 2) CHECK (prime_estimee_eur IS NULL OR prime_estimee_eur >= 0),
  prime_versee_eur  NUMERIC(12, 2) CHECK (prime_versee_eur IS NULL OR prime_versee_eur >= 0),

  -- ---------------------------------------------------------------------------
  -- Précarité (bonification Coup de pouce)
  -- ---------------------------------------------------------------------------
  precarite BOOLEAN NOT NULL DEFAULT FALSE,

  -- ---------------------------------------------------------------------------
  -- Justificatifs collectés
  -- ---------------------------------------------------------------------------
  -- Structure (array d'objets) :
  --   {
  --     "code":                    "identifiant court — aligné sur cee_operations.justificatifs_requis",
  --     "label":                   "libellé humain",
  --     "storage_path":            "chemin Supabase Storage",
  --     "uploaded_at":             ISO-8601,
  --     "verified_at":             ISO-8601 | null,
  --     "exif_geotag_verified":    boolean
  --   }
  -- Contrainte : doit être un tableau JSON.
  justificatifs JSONB NOT NULL DEFAULT '[]'::jsonb
    CHECK (jsonb_typeof(justificatifs) = 'array'),

  -- ---------------------------------------------------------------------------
  -- Admin & métadonnées
  -- ---------------------------------------------------------------------------
  rejection_reason TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cee_dossiers IS
  'Dossier CEE en cours de cycle — brique 2 mandataire CEE. Persiste le workflow complet du devis au dépôt PNCEE. Conservation 6 ans (loi 2025-594).';

COMMENT ON COLUMN cee_dossiers.date_engagement IS
  'Date de signature du devis. FIGÉE une fois fixée (trigger cee_dossiers_freeze_engagement). Loi 2025-594 art. 13.';

COMMENT ON COLUMN cee_dossiers.justificatifs IS
  'Array JSON des justificatifs collectés. Format: [{code,label,storage_path,uploaded_at,verified_at,exif_geotag_verified}]. Aligné sur cee_operations.justificatifs_requis (migration 400).';

COMMENT ON COLUMN cee_dossiers.operation_code IS
  'Code fiche FOS CEE (ex: BAR-EN-101). Pas de FK physique : un dossier peut survivre à l''abrogation d''une fiche (historique opposable).';

-- -----------------------------------------------------------------------------
-- Index cee_dossiers
-- -----------------------------------------------------------------------------

-- Dossiers actifs (query la plus fréquente dans le backoffice mandataire)
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_status
  ON cee_dossiers (status)
  WHERE status NOT IN ('valide', 'rejete', 'annule');

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_provider_id
  ON cee_dossiers (provider_id);

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_delegataire_id
  ON cee_dossiers (delegataire_id)
  WHERE delegataire_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_operation_code
  ON cee_dossiers (operation_code);

-- "dossiers à déposer avant J+Xmois" — date_engagement non NULL filtré
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_date_engagement
  ON cee_dossiers (date_engagement)
  WHERE date_engagement IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_client_id
  ON cee_dossiers (client_id)
  WHERE client_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Table journal : cee_dossier_events (append-only)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cee_dossier_events (
  id BIGSERIAL PRIMARY KEY,

  dossier_id UUID NOT NULL REFERENCES cee_dossiers(id) ON DELETE RESTRICT,

  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'status_change',
      'justificatif_uploaded',
      'justificatif_verified',
      'delegataire_assigned',
      'note_added',
      'prime_adjusted',
      'rejection'
    )),

  from_status TEXT,
  to_status   TEXT,

  actor_type TEXT NOT NULL
    CHECK (actor_type IN ('system', 'admin', 'artisan', 'client', 'delegataire_api')),

  -- NULL autorisé uniquement pour actor_type='system' ou 'delegataire_api'
  actor_id UUID,

  payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cee_dossier_events IS
  'Journal immuable d''audit des dossiers CEE. Append-only (UPDATE bloqué par trigger, DELETE bloqué par RLS). Conservation 6 ans — exigence légale (loi 2025-594 art. 13).';

-- -----------------------------------------------------------------------------
-- Index cee_dossier_events
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_dossier_id
  ON cee_dossier_events (dossier_id);

CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_created_at
  ON cee_dossier_events (created_at DESC);

-- -----------------------------------------------------------------------------
-- Trigger : updated_at standard
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_dossiers_set_updated_at()
RETURNS TRIGGER AS $trg$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_updated_at ON cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_updated_at
  BEFORE UPDATE ON cee_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION cee_dossiers_set_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger : immutabilité de date_engagement (loi 2025-594)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_dossiers_freeze_engagement()
RETURNS TRIGGER AS $trg$
BEGIN
  IF OLD.date_engagement IS NOT NULL
     AND NEW.date_engagement IS DISTINCT FROM OLD.date_engagement THEN
    RAISE EXCEPTION 'date_engagement immuable une fois fixée (loi 2025-594)';
  END IF;
  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_freeze_engagement ON cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_freeze_engagement
  BEFORE UPDATE ON cee_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION cee_dossiers_freeze_engagement();

-- -----------------------------------------------------------------------------
-- Trigger : validation des transitions de statut (DAG)
-- -----------------------------------------------------------------------------
-- Transitions autorisées :
--   brouillon              → pre_visite_planifiee | engagement_signe | annule
--   pre_visite_planifiee   → pre_visite_effectuee | annule
--   pre_visite_effectuee   → engagement_signe | annule
--   engagement_signe       → travaux_en_cours | annule
--   travaux_en_cours       → travaux_acheves | annule
--   travaux_acheves        → ah_signee | annule
--   ah_signee              → depose_delegataire | annule
--   depose_delegataire     → depose_pncee | rejete
--   depose_pncee           → valide | rejete
--   valide / rejete / annule → états terminaux, aucune transition sortante
-- Toute autre transition → RAISE EXCEPTION.
-- Transitions "identité" (status inchangé) → autorisées implicitement.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_dossiers_validate_status_transition()
RETURNS TRIGGER AS $trg$
DECLARE
  v_allowed BOOLEAN := FALSE;
BEGIN
  -- Transition no-op (status inchangé) toujours autorisée
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  v_allowed := CASE OLD.status
    WHEN 'brouillon' THEN
      NEW.status IN ('pre_visite_planifiee', 'engagement_signe', 'annule')
    WHEN 'pre_visite_planifiee' THEN
      NEW.status IN ('pre_visite_effectuee', 'annule')
    WHEN 'pre_visite_effectuee' THEN
      NEW.status IN ('engagement_signe', 'annule')
    WHEN 'engagement_signe' THEN
      NEW.status IN ('travaux_en_cours', 'annule')
    WHEN 'travaux_en_cours' THEN
      NEW.status IN ('travaux_acheves', 'annule')
    WHEN 'travaux_acheves' THEN
      NEW.status IN ('ah_signee', 'annule')
    WHEN 'ah_signee' THEN
      NEW.status IN ('depose_delegataire', 'annule')
    WHEN 'depose_delegataire' THEN
      NEW.status IN ('depose_pncee', 'rejete')
    WHEN 'depose_pncee' THEN
      NEW.status IN ('valide', 'rejete')
    ELSE FALSE  -- valide / rejete / annule sont terminaux
  END;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Transition de statut illégale : % → %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_status_transition ON cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_status_transition
  BEFORE UPDATE OF status ON cee_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION cee_dossiers_validate_status_transition();

-- -----------------------------------------------------------------------------
-- Trigger : audit log automatique sur changement de statut
-- -----------------------------------------------------------------------------
-- Crée automatiquement une ligne cee_dossier_events à chaque INSERT (création)
-- et à chaque UPDATE qui change le statut. L'acteur est récupéré depuis
-- `metadata->>'actor_id'` / `metadata->>'actor_type'` si fournis par le code
-- applicatif (pattern helper dossiers.ts), sinon 'system' / NULL.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_dossiers_audit_log()
RETURNS TRIGGER AS $trg$
DECLARE
  v_actor_type TEXT;
  v_actor_id   UUID;
BEGIN
  v_actor_type := COALESCE(NEW.metadata->>'_actor_type', 'system');
  BEGIN
    v_actor_id := NULLIF(NEW.metadata->>'_actor_id', '')::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO cee_dossier_events (dossier_id, event_type, from_status, to_status, actor_type, actor_id, payload)
    VALUES (
      NEW.id,
      'status_change',
      NULL,
      NEW.status,
      v_actor_type,
      v_actor_id,
      jsonb_build_object('created', true, 'operation_code', NEW.operation_code)
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO cee_dossier_events (dossier_id, event_type, from_status, to_status, actor_type, actor_id, payload)
    VALUES (
      NEW.id,
      'status_change',
      OLD.status,
      NEW.status,
      v_actor_type,
      v_actor_id,
      '{}'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_audit_log ON cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_audit_log
  AFTER INSERT OR UPDATE ON cee_dossiers
  FOR EACH ROW
  EXECUTE FUNCTION cee_dossiers_audit_log();

-- -----------------------------------------------------------------------------
-- Trigger : journal append-only sur cee_dossier_events
-- -----------------------------------------------------------------------------
-- Bloque tout UPDATE : un événement consigné est immuable (exigence audit PNCEE).
-- Les DELETE sont bloqués par la RLS (pas de policy DELETE) ET par la
-- contrainte ON DELETE RESTRICT sur dossier_id.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION cee_dossier_events_block_update()
RETURNS TRIGGER AS $trg$
BEGIN
  RAISE EXCEPTION 'cee_dossier_events est append-only — UPDATE interdit (audit PNCEE, loi 2025-594)';
END;
$trg$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossier_events_block_update ON cee_dossier_events;
CREATE TRIGGER trg_cee_dossier_events_block_update
  BEFORE UPDATE ON cee_dossier_events
  FOR EACH ROW
  EXECUTE FUNCTION cee_dossier_events_block_update();

-- -----------------------------------------------------------------------------
-- Row Level Security — cee_dossiers
-- -----------------------------------------------------------------------------

ALTER TABLE cee_dossiers ENABLE ROW LEVEL SECURITY;

-- Client : voit ses propres dossiers
DROP POLICY IF EXISTS cee_dossiers_client_read ON cee_dossiers;
CREATE POLICY cee_dossiers_client_read
  ON cee_dossiers
  FOR SELECT
  USING (client_id = auth.uid());

-- Artisan : voit les dossiers où il est le provider (jointure providers.user_id)
DROP POLICY IF EXISTS cee_dossiers_artisan_read ON cee_dossiers;
CREATE POLICY cee_dossiers_artisan_read
  ON cee_dossiers
  FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

-- Admin : accès total (fonction is_admin() définie en migration 001/101)
DROP POLICY IF EXISTS cee_dossiers_admin_all ON cee_dossiers;
CREATE POLICY cee_dossiers_admin_all
  ON cee_dossiers
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Writes côté artisan / client : absence volontaire de policies INSERT/UPDATE
-- pour anon/authenticated. Le tunnel passe par des routes serveur qui utilisent
-- service_role (bypass RLS) après contrôle applicatif d'ownership.

-- -----------------------------------------------------------------------------
-- Row Level Security — cee_dossier_events
-- -----------------------------------------------------------------------------

ALTER TABLE cee_dossier_events ENABLE ROW LEVEL SECURITY;

-- Lecture : même règle que le dossier parent (client / artisan / admin)
DROP POLICY IF EXISTS cee_dossier_events_read ON cee_dossier_events;
CREATE POLICY cee_dossier_events_read
  ON cee_dossier_events
  FOR SELECT
  USING (
    is_admin()
    OR dossier_id IN (
      SELECT id FROM cee_dossiers
      WHERE client_id = auth.uid()
         OR provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
    )
  );

-- Admin peut insérer manuellement un événement (correction, note)
DROP POLICY IF EXISTS cee_dossier_events_admin_insert ON cee_dossier_events;
CREATE POLICY cee_dossier_events_admin_insert
  ON cee_dossier_events
  FOR INSERT
  WITH CHECK (is_admin());

-- Pas de policy UPDATE ni DELETE = refus pour tout le monde sauf service_role.
-- Et même service_role est bloqué à l'UPDATE par le trigger append-only.

COMMIT;
