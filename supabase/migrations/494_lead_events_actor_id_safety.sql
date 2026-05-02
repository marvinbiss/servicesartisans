-- =============================================================================
-- Migration 494 — lead_events.actor_id : ADD COLUMN IF NOT EXISTS (filet)
-- =============================================================================
-- Audit Sentry 2026-05-02 (issue JAVASCRIPT-NEXTJS-75, 1 event sur POST
-- `/api/devis`).
--
-- Erreur observée :
--   "Could not find the 'actor_id' column of 'lead_events' in the schema cache"
--
-- Constat :
--   - La table `lead_events` est créée par la mig 106 (`106_dashboard_v2.sql`)
--     avec une colonne `actor_id UUID REFERENCES auth.users(id)`.
--   - Aucune migration ultérieure ne la DROP / RENAME (vérifié 2026-05-02).
--   - Mais l'erreur Supabase prod prouve qu'en pratique la colonne n'existe pas
--     côté DB (drift hors-Git, comme mig 474, 483, 486 — 5e du mois).
--   - Le funnel devis cassé silencieusement = perte de revenu inacceptable.
--
-- Fix :
--   ADD COLUMN IF NOT EXISTS — idempotent, ne fait rien si la colonne existe
--   déjà (cas auto-hébergé / Supabase déjà aligné). Recharge ensuite le cache
--   PostgREST pour faire ré-apparaître la colonne dans le schema cache.
--
-- 6e drift hors-Git en 1 mois — TODO `scripts/audit-schema-drift.mjs`.
-- =============================================================================

BEGIN;

ALTER TABLE public.lead_events
  ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- L'index dédié actor_id n'a jamais été utile (pas de query par actor seul,
-- toujours combiné lead_id ou provider_id). On ne l'ajoute pas pour économiser
-- du write-overhead sur cette table append-only à fort débit.

COMMIT;

-- Recharge le cache PostgREST pour que `.insert({ actor_id: ... })` soit
-- accepté immédiatement après application (sinon il faut attendre ~1 min).
-- Cf. https://supabase.com/docs/guides/api/reload-schema-cache
NOTIFY pgrst, 'reload schema';
