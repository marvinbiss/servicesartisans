-- Migration 431: cee_dossiers (coeur métier) + cee_dossier_documents + cee_dossier_events + MV stats
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 102 (set_updated_at), 424 (refs), 425 (enums), 427 (providers), 430 (cee_artisan_partners)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- 431.1  cee_dossiers — Dossier CEE monté par artisan partenaire
-- PII chiffrées (pgcrypto côté app) + email_hash généré pour dédoublonnage
-- expires_at = 10 ans (conservation pièces CEE R.221-1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossiers (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference                   text NOT NULL UNIQUE,

  -- Partenaire source
  partner_id                  uuid NOT NULL REFERENCES public.cee_artisan_partners(id) ON DELETE RESTRICT,
  provider_id                 uuid NOT NULL REFERENCES public.providers(id) ON DELETE RESTRICT,

  -- Client bénéficiaire (PII chiffrées)
  client_nom_encrypted        bytea NOT NULL,
  client_prenom_encrypted     bytea NOT NULL,
  client_email_encrypted      bytea NOT NULL,
  client_email_hash           text,
  client_telephone_encrypted  bytea,
  client_adresse_encrypted    bytea NOT NULL,
  client_code_postal          text NOT NULL CHECK (client_code_postal ~ '^[0-9]{5}$'),
  client_commune_insee        text NOT NULL REFERENCES public.zones_climatiques_ref(code_insee),

  -- Revenus bénéficiaire
  foyer_personnes             smallint NOT NULL CHECK (foyer_personnes BETWEEN 1 AND 12),
  revenus_categorie           public.categorie_revenus NOT NULL,
  rfr_declared_cts            bigint CHECK (rfr_declared_cts IS NULL OR rfr_declared_cts >= 0),

  -- Chantier
  operation_code              text NOT NULL REFERENCES public.cee_operations_ref(code),
  type_travaux                text NOT NULL,
  surface_m2                  numeric(7,2) CHECK (surface_m2 IS NULL OR surface_m2 >= 0),
  annee_construction          smallint CHECK (annee_construction IS NULL OR annee_construction BETWEEN 1800 AND 2100),
  energie_remplacee           text,
  montant_ht_cts              bigint NOT NULL CHECK (montant_ht_cts >= 0),
  montant_ttc_cts             bigint NOT NULL CHECK (montant_ttc_cts >= 0),
  date_devis                  date NOT NULL,
  date_chantier_prevue        date,
  date_chantier_realisee      date,

  -- Primes (snapshot versionné)
  forfait_id                  bigint NOT NULL REFERENCES public.cee_forfaits(id),
  forfait_version             text NOT NULL,
  prime_cee_cts               bigint NOT NULL CHECK (prime_cee_cts >= 0),
  prime_mpr_cts               bigint CHECK (prime_mpr_cts IS NULL OR prime_mpr_cts >= 0),
  prime_total_cts             bigint GENERATED ALWAYS AS (prime_cee_cts + COALESCE(prime_mpr_cts,0)) STORED,
  reste_a_charge_cts          bigint GENERATED ALWAYS AS (montant_ttc_cts - prime_cee_cts - COALESCE(prime_mpr_cts,0)) STORED,

  -- Délégataire
  delegataire                 text,
  delegataire_reference       text,
  delegataire_submission_at   timestamptz,
  delegataire_response_at     timestamptz,
  delegataire_response_status text CHECK (delegataire_response_status IS NULL OR delegataire_response_status IN ('accepted','rejected','pending')),
  delegataire_response_motif  text,
  pncee_reference             text,

  -- Status machine
  status                      public.cee_dossier_status NOT NULL DEFAULT 'draft',
  qa_score                    smallint CHECK (qa_score IS NULL OR qa_score BETWEEN 0 AND 100),
  qa_reviewer_id              uuid REFERENCES auth.users(id),
  qa_reviewed_at              timestamptz,
  qa_notes                    text,

  -- Commission artisan (snapshot taux au moment création)
  commission_rate             numeric(5,2) NOT NULL CHECK (commission_rate BETWEEN 0 AND 100),
  commission_amount_cts       bigint GENERATED ALWAYS AS
    ((montant_ht_cts * commission_rate / 100)::bigint) STORED,
  commission_status           text NOT NULL DEFAULT 'pending'
                                CHECK (commission_status IN ('pending','due','paid','cancelled')),
  commission_paid_at          timestamptz,

  -- Audit
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  expires_at                  timestamptz NOT NULL DEFAULT (now() + INTERVAL '10 years'),

  CONSTRAINT cee_dossiers_operation_code_fmt_chk
    CHECK (operation_code ~ '^(BAR|BAT|IND|RES|TRA|AGRI)-[A-Z]{2}-[0-9]{3}$'),
  CONSTRAINT cee_dossiers_reference_fmt_chk
    CHECK (reference ~ '^SAE-[0-9]{6}-[0-9]{6}$')
);

COMMENT ON TABLE  public.cee_dossiers IS 'Dossiers CEE montés par artisans partenaires (conservation 10 ans R.221-1)';
COMMENT ON COLUMN public.cee_dossiers.reference IS 'Format SAE-YYYYMM-NNNNNN (généré côté app)';
COMMENT ON COLUMN public.cee_dossiers.client_email_hash IS 'SHA-256(lower(email)) — renseigné côté app avant INSERT (email chiffré ne permet pas GENERATED)';
COMMENT ON COLUMN public.cee_dossiers.forfait_version IS 'Hash stable du barème (date_validite_debut + montant)';
COMMENT ON COLUMN public.cee_dossiers.commission_amount_cts IS 'Commission = montant_ht_cts * commission_rate / 100';

CREATE INDEX IF NOT EXISTS idx_cee_dossiers_partner_status ON public.cee_dossiers(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_qa_queue       ON public.cee_dossiers(created_at) WHERE status = 'qa_pending';
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_deleg
  ON public.cee_dossiers(delegataire, delegataire_submission_at)
  WHERE status IN ('deposited','validated','rejected_pncee');
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_provider      ON public.cee_dossiers(provider_id);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_operation     ON public.cee_dossiers(operation_code);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_email_hash    ON public.cee_dossiers(client_email_hash);
CREATE INDEX IF NOT EXISTS idx_cee_dossiers_expires_at    ON public.cee_dossiers(expires_at);

-- ---------------------------------------------------------------------------
-- 431.2  Trigger transitions de status (empêche transitions illégales)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('draft','submitted_by_artisan') THEN
      RAISE EXCEPTION 'cee_dossiers: status initial invalide %', NEW.status;
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Matrice transitions autorisées
  allowed := CASE
    WHEN OLD.status = 'draft'                AND NEW.status IN ('submitted_by_artisan','archived') THEN true
    WHEN OLD.status = 'submitted_by_artisan' AND NEW.status IN ('qa_pending','draft','archived') THEN true
    WHEN OLD.status = 'qa_pending'           AND NEW.status IN ('qa_approved','qa_rejected') THEN true
    WHEN OLD.status = 'qa_approved'          AND NEW.status IN ('deposited','archived') THEN true
    WHEN OLD.status = 'qa_rejected'          AND NEW.status IN ('draft','submitted_by_artisan','archived') THEN true
    WHEN OLD.status = 'deposited'            AND NEW.status IN ('validated','rejected_pncee') THEN true
    WHEN OLD.status = 'validated'            AND NEW.status IN ('paid_client','commission_due','archived') THEN true
    WHEN OLD.status = 'rejected_pncee'       AND NEW.status IN ('archived') THEN true
    WHEN OLD.status = 'paid_client'          AND NEW.status IN ('commission_due','archived') THEN true
    WHEN OLD.status = 'commission_due'       AND NEW.status IN ('commission_paid','archived') THEN true
    WHEN OLD.status = 'commission_paid'      AND NEW.status IN ('archived') THEN true
    ELSE false
  END;

  -- Admins peuvent forcer une transition (role JWT)
  IF NOT allowed AND (auth.jwt() ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'cee_dossiers: transition illégale % → %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cee_dossiers_status_transition ON public.cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_status_transition
  BEFORE INSERT OR UPDATE OF status ON public.cee_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.cee_dossiers_check_status_transition();

DROP TRIGGER IF EXISTS trg_cee_dossiers_updated_at ON public.cee_dossiers;
CREATE TRIGGER trg_cee_dossiers_updated_at
  BEFORE UPDATE ON public.cee_dossiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 431.3  RLS cee_dossiers
-- ---------------------------------------------------------------------------
ALTER TABLE public.cee_dossiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossiers_artisan_self_read     ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_artisan_insert        ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_artisan_update_draft  ON public.cee_dossiers;
DROP POLICY IF EXISTS cee_dossiers_admin_all             ON public.cee_dossiers;

CREATE POLICY cee_dossiers_artisan_self_read ON public.cee_dossiers
  FOR SELECT TO authenticated
  USING (partner_id IN (
    SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
  ));

CREATE POLICY cee_dossiers_artisan_insert ON public.cee_dossiers
  FOR INSERT TO authenticated
  WITH CHECK (partner_id IN (
    SELECT id FROM public.cee_artisan_partners
    WHERE user_id = auth.uid() AND status = 'active'
  ));

CREATE POLICY cee_dossiers_artisan_update_draft ON public.cee_dossiers
  FOR UPDATE TO authenticated
  USING (
    partner_id IN (SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid())
    AND status IN ('draft','qa_rejected')
  )
  WITH CHECK (
    partner_id IN (SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid())
    AND status IN ('draft','submitted_by_artisan','qa_rejected')
  );

CREATE POLICY cee_dossiers_admin_all ON public.cee_dossiers
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.4  cee_dossier_documents — Pièces justificatives
-- Unique (dossier_id, kind, sha256) : pas de doublon binaire
-- Photos géoloc obligatoires (geo_lat/lng + EXIF taken_at) depuis 2026-01-01
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossier_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id         uuid NOT NULL REFERENCES public.cee_dossiers(id) ON DELETE CASCADE,
  kind               text NOT NULL CHECK (kind IN (
                        'devis_signe','facture','avis_imposition','mandat_cee',
                        'photo_avant','photo_apres','fiche_technique',
                        'attestation_rge','pv_reception','autre'
                      )),
  filename           text NOT NULL,
  storage_path       text NOT NULL,
  mime_type          text NOT NULL,
  size_bytes         bigint NOT NULL CHECK (size_bytes >= 0),
  sha256             text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  geo_lat            numeric(10,7) CHECK (geo_lat IS NULL OR geo_lat BETWEEN -90 AND 90),
  geo_lng            numeric(10,7) CHECK (geo_lng IS NULL OR geo_lng BETWEEN -180 AND 180),
  taken_at           timestamptz,
  uploaded_by        uuid NOT NULL REFERENCES auth.users(id),
  uploaded_at        timestamptz NOT NULL DEFAULT now(),
  virus_scan_status  text NOT NULL DEFAULT 'pending'
                       CHECK (virus_scan_status IN ('pending','clean','infected','error')),
  virus_scan_at      timestamptz,
  CONSTRAINT cee_dossier_documents_unique_binary UNIQUE (dossier_id, kind, sha256)
);

COMMENT ON TABLE public.cee_dossier_documents IS 'Pièces justificatives dossiers CEE (hash SHA-256 unique par dossier+kind)';
COMMENT ON COLUMN public.cee_dossier_documents.storage_path IS 'Supabase Storage: cee-dossiers/{dossier_id}/{kind}/{filename}';
COMMENT ON COLUMN public.cee_dossier_documents.geo_lat IS 'Latitude EXIF (photos géoloc obligatoires depuis 2026-01-01)';

CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_dossier  ON public.cee_dossier_documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_kind     ON public.cee_dossier_documents(kind);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_documents_scan
  ON public.cee_dossier_documents(uploaded_at) WHERE virus_scan_status = 'pending';

ALTER TABLE public.cee_dossier_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossier_documents_artisan_self ON public.cee_dossier_documents;
DROP POLICY IF EXISTS cee_dossier_documents_admin_all    ON public.cee_dossier_documents;

CREATE POLICY cee_dossier_documents_artisan_self ON public.cee_dossier_documents
  FOR ALL TO authenticated
  USING (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ))
  WITH CHECK (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY cee_dossier_documents_admin_all ON public.cee_dossier_documents
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.5  cee_dossier_events — Audit trail (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cee_dossier_events (
  id           bigserial PRIMARY KEY,
  dossier_id   uuid NOT NULL REFERENCES public.cee_dossiers(id) ON DELETE CASCADE,
  event_type   text NOT NULL,
  actor_id     uuid REFERENCES auth.users(id),
  actor_role   text,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.cee_dossier_events IS 'Audit trail dossiers CEE (status_change, doc_uploaded, qa_review, deleg_submitted...)';
CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_dossier ON public.cee_dossier_events(dossier_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cee_dossier_events_type    ON public.cee_dossier_events(event_type);

ALTER TABLE public.cee_dossier_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cee_dossier_events_artisan_self_read ON public.cee_dossier_events;
DROP POLICY IF EXISTS cee_dossier_events_admin_all         ON public.cee_dossier_events;

CREATE POLICY cee_dossier_events_artisan_self_read ON public.cee_dossier_events
  FOR SELECT TO authenticated
  USING (dossier_id IN (
    SELECT id FROM public.cee_dossiers WHERE partner_id IN (
      SELECT id FROM public.cee_artisan_partners WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY cee_dossier_events_admin_all ON public.cee_dossier_events
  FOR ALL TO authenticated
  USING  ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 431.6  mv_cee_dossiers_stats — Stats par partenaire × status × mois (refresh hebdo)
-- ---------------------------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS public.mv_cee_dossiers_stats;
CREATE MATERIALIZED VIEW public.mv_cee_dossiers_stats AS
SELECT
  partner_id,
  status,
  date_trunc('month', created_at)::date AS mois,
  count(*)                              AS nb_dossiers,
  coalesce(sum(prime_cee_cts),0)        AS prime_cee_cts_total,
  coalesce(sum(prime_total_cts),0)      AS prime_total_cts_total,
  coalesce(sum(commission_amount_cts),0) AS commission_cts_total
FROM public.cee_dossiers
GROUP BY 1,2,3;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_cee_dossiers_stats_key
  ON public.mv_cee_dossiers_stats(partner_id, status, mois);
CREATE INDEX IF NOT EXISTS idx_mv_cee_dossiers_stats_mois
  ON public.mv_cee_dossiers_stats(mois DESC);

COMMENT ON MATERIALIZED VIEW public.mv_cee_dossiers_stats IS 'Stats dossiers CEE par partenaire × status × mois (refresh hebdo cron)';

COMMIT;
