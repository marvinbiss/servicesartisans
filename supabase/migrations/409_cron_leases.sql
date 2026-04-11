-- ===========================================================================
-- Migration 409 — cron_leases : lease table anti-double-run pour les crons
-- ===========================================================================
-- Contexte :
--   Les crons Vercel peuvent être rejoués (retry automatique en cas d'erreur
--   réseau, déclenchement manuel concurrent via dashboard). Le pooler Supabase
--   ne garantit pas la stickiness de session → `pg_advisory_lock` n'est pas
--   fiable. On utilise donc une table de lease avec TTL court.
--
-- Usage :
--   1. Essayer d'acquérir : INSERT ... ON CONFLICT DO UPDATE ... RETURNING name
--      → ligne retournée ssi aucun lease actif ne coexistait.
--   2. À la fin (finally block), libérer : UPDATE ... SET expires_at = NOW().
--
-- Contraintes :
--   - Service-role only (pas d'exposition PostgREST publique).
--   - TTL obligatoire → jamais de lease orphelin > expiration.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.cron_leases (
  name         TEXT        PRIMARY KEY,
  acquired_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);

COMMENT ON TABLE public.cron_leases IS
  'Lease anti-double-run pour crons Vercel. Acquis via UPSERT conditionnel (expires_at < NOW()) et libéré dans finally block. TTL typique 15 min.';

COMMENT ON COLUMN public.cron_leases.name IS
  'Identifiant logique du cron (ex: cee_dossier_transitions). Clé primaire.';

COMMENT ON COLUMN public.cron_leases.expires_at IS
  'Deadline dure : au-delà, un autre runner peut reprendre le lease même si pas libéré proprement.';

-- RLS : aucune policy → table inaccessible sauf service_role (bypass RLS).
ALTER TABLE public.cron_leases ENABLE ROW LEVEL SECURITY;

-- Index pour le sweep éventuel des leases expirés (si besoin futur d'un cron de GC).
CREATE INDEX IF NOT EXISTS idx_cron_leases_expires_at
  ON public.cron_leases (expires_at);
