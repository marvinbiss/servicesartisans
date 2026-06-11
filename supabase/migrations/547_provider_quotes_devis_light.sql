-- =============================================================================
-- Migration 547: Devis-light natif — provider_quotes / provider_quote_lines /
--                provider_invoices + numérotation par artisan
-- ServicesArtisans — 2026-06-11
-- =============================================================================
-- CONTEXTE
-- Aujourd'hui l'artisan ne peut PAS rédiger un devis structuré dans SA.
-- Les tables existantes ne couvrent pas le besoin :
--   - `quotes` (mig 100) : réponse à un devis_requests, montant unique plat,
--     sans lignes, couplée bookings/client_id→profiles (+ drift de colonnes).
--   - `invoices` (mig 006) : facture couplée booking + client_id→profiles.
-- Les deux supposent que le CLIENT est un utilisateur SA enregistré.
--
-- Or le socle financement exige un client LIBRE :
--   - B2C : particulier (homeowner) sans compte SA → rail Younited.
--   - B2B : client pro (syndic, bailleur, promoteur, GC) identifié par SIREN
--           → rail Aria (escompte). Aria a besoin du SIREN débiteur sur la facture.
--
-- D'où des tables purpose-built, DÉCOUPLÉES de bookings/profiles, client en
-- champ libre. Les tables legacy (quotes/invoices) ne sont pas touchées.
--
-- ⚠️ ORDRE DE DÉPLOIEMENT : appliquer cette migration en prod AVANT de déployer
-- le code qui lit/écrit ces tables (cf. post-mortem mig 483). Additive : ne
-- casse rien pour le code actuel.
--
-- Le client final (non authentifié) n'accède PAS via RLS : l'accès à la vue
-- client se fait par token signé côté API avec le client admin (pattern
-- /invitation-avis/[token]). Donc PAS de policy anon ici (posture no-leak).
--
-- IDEMPOTENT.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.quote_client_type AS ENUM ('particulier', 'pro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.quote_doc_status AS ENUM (
    'brouillon', 'envoye', 'vu', 'accepte', 'refuse', 'expire'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.quote_financing_rail AS ENUM ('younited', 'aria', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_doc_type AS ENUM ('acompte', 'situation', 'solde');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_doc_status AS ENUM (
    'emise', 'payee', 'cedee_aria', 'annulee'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 2. Compteur de numérotation par artisan (chronologique /an ; numérotation
--    monotone — un trou reste possible si l'UPDATE post-RPC échoue, toléré)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_document_counters (
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('quote', 'invoice')),
  year        INT  NOT NULL,
  seq         INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (provider_id, kind, year)
);

-- next_document_number : incrément atomique (upsert) → renvoie DEV-2026-00001 / FAC-2026-00001
-- SECURITY DEFINER : la fonction écrit dans provider_document_counters (que
-- l'artisan n'a pas le droit d'écrire en direct sous RLS). Garde d'appartenance
-- interne : un utilisateur authentifié ne peut incrémenter que le compteur d'un
-- provider qu'il possède ; contexte service_role (auth.uid() NULL) = autorisé.
CREATE OR REPLACE FUNCTION public.next_document_number(p_provider_id UUID, p_kind TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_year INT := EXTRACT(YEAR FROM now())::INT;
  v_seq  INT;
  v_prefix TEXT;
  v_uid  UUID := auth.uid();
BEGIN
  IF p_kind NOT IN ('quote', 'invoice') THEN
    RAISE EXCEPTION 'kind invalide: %', p_kind;
  END IF;

  IF v_uid IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.providers WHERE id = p_provider_id AND user_id = v_uid
  ) THEN
    RAISE EXCEPTION 'forbidden: provider % non possédé par l''appelant', p_provider_id;
  END IF;

  INSERT INTO public.provider_document_counters (provider_id, kind, year, seq)
  VALUES (p_provider_id, p_kind, v_year, 1)
  ON CONFLICT (provider_id, kind, year)
  DO UPDATE SET seq = public.provider_document_counters.seq + 1
  RETURNING seq INTO v_seq;

  v_prefix := CASE WHEN p_kind = 'invoice' THEN 'FAC' ELSE 'DEV' END;
  RETURN v_prefix || '-' || v_year || '-' || lpad(v_seq::TEXT, 5, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_document_number(UUID, TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. provider_quotes — devis rédigé par l'artisan
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  -- Lien optionnel vers la demande entrante (lead exclusif SA) qui a déclenché le devis
  devis_request_id UUID REFERENCES public.devis_requests(id) ON DELETE SET NULL,
  numero          TEXT,  -- attribué via next_document_number à l'envoi (NULL en brouillon)

  -- Client LIBRE (pas un profile SA)
  client_type     public.quote_client_type NOT NULL DEFAULT 'particulier',
  client_nom      TEXT,
  client_email    TEXT,
  client_telephone TEXT,                 -- usage interne uniquement, jamais page publique
  client_siren    TEXT,                  -- requis si pro (alimente Aria) — validé applicativement
  client_adresse  JSONB DEFAULT '{}'::jsonb,
  chantier_adresse JSONB DEFAULT '{}'::jsonb,

  status          public.quote_doc_status NOT NULL DEFAULT 'brouillon',

  total_ht        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tva       NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(12,2) NOT NULL DEFAULT 0,
  acompte_pct     NUMERIC(5,2)  NOT NULL DEFAULT 30 CHECK (acompte_pct >= 0 AND acompte_pct <= 100),

  financing_rail  public.quote_financing_rail NOT NULL DEFAULT 'none',

  notes           TEXT,
  -- Token d'accès client (vue par lien, sans compte) — opaque, généré côté app
  -- (crypto.randomBytes) au passage en 'envoye', comme mig 454. Indexé unique.
  access_token    TEXT UNIQUE,
  valid_until     DATE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at         TIMESTAMPTZ,
  viewed_at       TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  refused_at      TIMESTAMPTZ,

  CONSTRAINT provider_quotes_numero_unique UNIQUE (provider_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_provider_quotes_provider ON public.provider_quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_quotes_status   ON public.provider_quotes(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_provider_quotes_request  ON public.provider_quotes(devis_request_id);

-- -----------------------------------------------------------------------------
-- 4. provider_quote_lines — lignes du devis
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_quote_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id         UUID NOT NULL REFERENCES public.provider_quotes(id) ON DELETE CASCADE,
  ordre            INT NOT NULL DEFAULT 0,
  designation      TEXT NOT NULL,
  quantite         NUMERIC(12,3) NOT NULL DEFAULT 1 CHECK (quantite >= 0),
  unite            TEXT NOT NULL DEFAULT 'u',
  prix_unitaire_ht NUMERIC(12,2) NOT NULL DEFAULT 0,
  tva_rate         NUMERIC(5,2)  NOT NULL DEFAULT 20 CHECK (tva_rate >= 0 AND tva_rate <= 100),
  total_ligne_ht   NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_provider_quote_lines_quote ON public.provider_quote_lines(quote_id, ordre);

-- -----------------------------------------------------------------------------
-- 5. provider_invoices — facture issue d'un devis (acompte / situation / solde)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.provider_invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID NOT NULL REFERENCES public.provider_quotes(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  numero          TEXT,
  type            public.invoice_doc_type NOT NULL DEFAULT 'acompte',
  montant_ht      NUMERIC(12,2) NOT NULL DEFAULT 0,
  montant_tva     NUMERIC(12,2) NOT NULL DEFAULT 0,
  montant_ttc     NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          public.invoice_doc_status NOT NULL DEFAULT 'emise',
  aria_cession_id TEXT,  -- id externe si escomptée Aria
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT provider_invoices_numero_unique UNIQUE (provider_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_provider_invoices_quote    ON public.provider_invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_provider_invoices_provider ON public.provider_invoices(provider_id, status);

-- -----------------------------------------------------------------------------
-- 6. updated_at triggers (réutilise le helper existant si présent, sinon inline)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provider_quotes_touch ON public.provider_quotes;
CREATE TRIGGER trg_provider_quotes_touch
  BEFORE UPDATE ON public.provider_quotes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_provider_invoices_touch ON public.provider_invoices;
CREATE TRIGGER trg_provider_invoices_touch
  BEFORE UPDATE ON public.provider_invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- 7. RLS — artisan voit/écrit UNIQUEMENT ses documents ; admin full ; pas d'anon
--    (mapping artisan : providers.user_id = auth.uid(), cf. mig 545)
-- -----------------------------------------------------------------------------
ALTER TABLE public.provider_quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_quote_lines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_document_counters ENABLE ROW LEVEL SECURITY;

-- provider_quotes
DROP POLICY IF EXISTS provider_quotes_owner_all ON public.provider_quotes;
CREATE POLICY provider_quotes_owner_all
  ON public.provider_quotes FOR ALL
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS provider_quotes_admin_all ON public.provider_quotes;
CREATE POLICY provider_quotes_admin_all
  ON public.provider_quotes FOR ALL
  USING (public.is_admin());

-- provider_quote_lines (via parent quote)
DROP POLICY IF EXISTS provider_quote_lines_owner_all ON public.provider_quote_lines;
CREATE POLICY provider_quote_lines_owner_all
  ON public.provider_quote_lines FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_quotes q
      WHERE q.id = quote_id
        AND q.provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.provider_quotes q
      WHERE q.id = quote_id
        AND q.provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS provider_quote_lines_admin_all ON public.provider_quote_lines;
CREATE POLICY provider_quote_lines_admin_all
  ON public.provider_quote_lines FOR ALL
  USING (public.is_admin());

-- provider_invoices
DROP POLICY IF EXISTS provider_invoices_owner_all ON public.provider_invoices;
CREATE POLICY provider_invoices_owner_all
  ON public.provider_invoices FOR ALL
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  )
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS provider_invoices_admin_all ON public.provider_invoices;
CREATE POLICY provider_invoices_admin_all
  ON public.provider_invoices FOR ALL
  USING (public.is_admin());

-- provider_document_counters : aucune écriture client directe (l'incrément passe
-- par next_document_number, SECURITY DEFINER avec garde d'appartenance interne) ;
-- lecture restreinte au propriétaire + admin.
DROP POLICY IF EXISTS provider_document_counters_admin_all ON public.provider_document_counters;
CREATE POLICY provider_document_counters_admin_all
  ON public.provider_document_counters FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS provider_document_counters_owner_read ON public.provider_document_counters;
CREATE POLICY provider_document_counters_owner_read
  ON public.provider_document_counters FOR SELECT
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- 8. Commentaires
-- -----------------------------------------------------------------------------
COMMENT ON TABLE public.provider_quotes IS
  'Devis rédigé par l''artisan (devis-light natif, mig 547). Client en champ '
  'libre (B2C particulier / B2B pro avec SIREN), découplé de bookings/profiles. '
  'Socle du financement : client_type route le rail (particulier→Younited, '
  'pro→Aria). Accès client via access_token (API + admin client, jamais RLS anon).';
COMMENT ON TABLE public.provider_quote_lines IS 'Lignes du devis (mig 547).';
COMMENT ON TABLE public.provider_invoices IS
  'Facture issue d''un devis (acompte/situation/solde, mig 547). aria_cession_id '
  'rempli si escomptée Aria.';
COMMENT ON COLUMN public.provider_quotes.client_telephone IS
  'Téléphone client — usage interne strict, ne JAMAIS exposer sur page publique.';

COMMIT;
