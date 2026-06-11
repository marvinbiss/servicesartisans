-- =============================================================================
-- Migration 548: Intégration e-facturation Iopole (PDP, marque grise)
-- ServicesArtisans — 2026-06-11
-- =============================================================================
-- CONTEXTE
-- Réforme facturation électronique FR : réception obligatoire 09/2026, émission
-- TPE/PME 09/2027. Iopole = Plateforme Agréée (PA/PDP) immatriculée DGFiP
-- (11/12/2025). Modèle retenu : MARQUE GRISE — Iopole reste la PDP, SA intègre
-- son API ; chaque artisan émet sous SON SIREN via Iopole.
--
-- Cette migration ajoute le lien entre nos factures natives (provider_invoices,
-- mig 547) et Iopole :
--   - colonnes de transmission / cycle de vie sur provider_invoices
--   - provider_einvoice_emitters : état d'enrôlement KYB de l'artisan chez Iopole
--   - provider_invoice_events : journal idempotent des statuts (webhook Iopole)
--
-- La facture native reste la SOURCE DE VÉRITÉ ; Iopole = transmission + format
-- légal (Factur-X) + cycle de vie. Mapping par identifiant interne (notre id).
--
-- Additive, idempotente. Appliquer AVANT déploiement du code Iopole.
-- =============================================================================

BEGIN;

-- 1. provider_invoices : colonnes Iopole -------------------------------------
ALTER TABLE public.provider_invoices
  ADD COLUMN IF NOT EXISTS iopole_id            TEXT,
  ADD COLUMN IF NOT EXISTS iopole_status        TEXT,
  ADD COLUMN IF NOT EXISTS einvoice_format      TEXT NOT NULL DEFAULT 'facturx',
  ADD COLUMN IF NOT EXISTS transmission_status  TEXT NOT NULL DEFAULT 'pending'
    CHECK (transmission_status IN ('pending', 'submitted', 'delivered', 'rejected', 'error')),
  ADD COLUMN IF NOT EXISTS transmitted_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lifecycle_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS iopole_error         TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_invoices_iopole_id
  ON public.provider_invoices(iopole_id) WHERE iopole_id IS NOT NULL;

-- Une seule facture d'acompte par devis (durcit la course de double-création).
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_invoices_one_acompte
  ON public.provider_invoices(quote_id) WHERE type = 'acompte';

-- 2. provider_einvoice_emitters : enrôlement KYB de l'artisan chez Iopole -----
CREATE TABLE IF NOT EXISTS public.provider_einvoice_emitters (
  provider_id       UUID PRIMARY KEY REFERENCES public.providers(id) ON DELETE CASCADE,
  iopole_emitter_id TEXT UNIQUE,
  siren             TEXT,
  kyb_status        TEXT NOT NULL DEFAULT 'none'
    CHECK (kyb_status IN ('none', 'pending', 'active', 'rejected', 'suspended')),
  kyb_error         TEXT,
  registered_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_provider_einvoice_emitters_touch ON public.provider_einvoice_emitters;
CREATE TRIGGER trg_provider_einvoice_emitters_touch
  BEFORE UPDATE ON public.provider_einvoice_emitters
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. provider_invoice_events : journal cycle de vie (idempotent webhook) ------
CREATE TABLE IF NOT EXISTS public.provider_invoice_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES public.provider_invoices(id) ON DELETE CASCADE,
  iopole_event_id TEXT,
  iopole_status   TEXT NOT NULL,
  payload         JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_invoice_events_invoice
  ON public.provider_invoice_events(invoice_id, created_at DESC);
-- Idempotence : un même event Iopole n'est journalisé qu'une fois.
CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_invoice_events_dedup
  ON public.provider_invoice_events(invoice_id, iopole_event_id)
  WHERE iopole_event_id IS NOT NULL;

-- 4. RLS ---------------------------------------------------------------------
ALTER TABLE public.provider_einvoice_emitters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_invoice_events    ENABLE ROW LEVEL SECURITY;

-- Emitters : l'artisan lit son propre état ; écriture via service_role (webhook /
-- backend admin client). Admin full.
DROP POLICY IF EXISTS provider_einvoice_emitters_owner_read ON public.provider_einvoice_emitters;
CREATE POLICY provider_einvoice_emitters_owner_read
  ON public.provider_einvoice_emitters FOR SELECT
  USING (provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS provider_einvoice_emitters_admin_all ON public.provider_einvoice_emitters;
CREATE POLICY provider_einvoice_emitters_admin_all
  ON public.provider_einvoice_emitters FOR ALL
  USING (public.is_admin());

-- Events : lecture par le propriétaire de la facture parente ; admin full.
-- Écriture exclusivement service_role (webhook), donc pas de policy INSERT owner.
DROP POLICY IF EXISTS provider_invoice_events_owner_read ON public.provider_invoice_events;
CREATE POLICY provider_invoice_events_owner_read
  ON public.provider_invoice_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_invoices inv
      WHERE inv.id = invoice_id
        AND inv.provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS provider_invoice_events_admin_all ON public.provider_invoice_events;
CREATE POLICY provider_invoice_events_admin_all
  ON public.provider_invoice_events FOR ALL
  USING (public.is_admin());

-- 5. Commentaires ------------------------------------------------------------
COMMENT ON TABLE public.provider_einvoice_emitters IS
  'Enrôlement KYB de l''artisan chez Iopole (PDP marque grise, mig 548). '
  'iopole_emitter_id = tenant émetteur côté Iopole sous le SIREN de l''artisan.';
COMMENT ON TABLE public.provider_invoice_events IS
  'Journal idempotent du cycle de vie facture côté Iopole (webhook, mig 548).';
COMMENT ON COLUMN public.provider_invoices.iopole_status IS
  'Dernier statut cycle de vie Iopole (deposited/accepted/refused/disputed/paid…), brut.';
COMMENT ON COLUMN public.provider_invoices.transmission_status IS
  'État de transmission interne : pending→submitted→delivered | rejected | error.';

COMMIT;
