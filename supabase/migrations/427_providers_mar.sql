-- Migration 427: Colonnes MAR (Mon Accompagnateur Rénov') sur providers + table staging atomic swap
-- Date 2026-04-14
-- Plan V3 PR1
-- Dépend: 001 (providers), 413 (pattern atomic swap)

BEGIN;

-- ---------------------------------------------------------------------------
-- 427.1  Colonnes MAR sur providers
-- ---------------------------------------------------------------------------
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS is_mar_agree        boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mar_source_id       text,
  ADD COLUMN IF NOT EXISTS mar_qualifications  jsonb       NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mar_last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS mar_agree_since     date,
  ADD COLUMN IF NOT EXISTS mar_revoked_at      timestamptz;

COMMENT ON COLUMN public.providers.is_mar_agree IS 'Mon Accompagnateur Renov — agrément actif';
COMMENT ON COLUMN public.providers.mar_qualifications IS 'Détails agrément MAR (numéro, périmètre, dates)';
COMMENT ON COLUMN public.providers.mar_last_verified_at IS 'Dernière vérification via source officielle (ANAH)';

CREATE INDEX IF NOT EXISTS idx_providers_mar_agree
  ON public.providers(address_department) WHERE is_mar_agree;

-- ---------------------------------------------------------------------------
-- 427.2  mar_staging — Staging atomic swap (pattern migration 413 RGE)
-- Purgée post-swap. Accessible service_role uniquement (pas de RLS policy = deny).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mar_staging (
  id                    bigserial PRIMARY KEY,
  siret                 text NOT NULL,
  siren                 text,
  raison_sociale        text,
  mar_source_id         text,
  mar_qualifications    jsonb NOT NULL DEFAULT '{}'::jsonb,
  mar_agree_since       date,
  mar_last_verified_at  timestamptz NOT NULL DEFAULT now(),
  fetched_at            timestamptz NOT NULL DEFAULT now(),
  import_run_id         uuid NOT NULL
);
COMMENT ON TABLE public.mar_staging IS 'Staging import MAR (ANAH) — atomic swap pattern, purgé post-swap';
CREATE INDEX IF NOT EXISTS idx_mar_staging_run   ON public.mar_staging(import_run_id);
CREATE INDEX IF NOT EXISTS idx_mar_staging_siret ON public.mar_staging(siret);

-- RLS: activée mais aucune policy => deny par défaut (service_role bypasse RLS)
ALTER TABLE public.mar_staging ENABLE ROW LEVEL SECURITY;

COMMIT;
