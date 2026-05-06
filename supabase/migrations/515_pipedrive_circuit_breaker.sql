-- =============================================================================
-- 515_pipedrive_circuit_breaker.sql
-- Plan C — C-4 : circuit-breaker Pipedrive (DLQ-1)
-- ServicesArtisans — 2026-05-05
-- =============================================================================
-- Audit V2 P1 (Pipedrive DLQ) : si Pipedrive est down 6h+, les retry crons
-- continuent de hammer l'API (4 backoffs × 1500 leads = 6000 requêtes
-- gaspillées en 30min) → quota burn + log spam + leads tous flagués
-- dead-letter inutilement (un attendrait un alert humain alors que c'est
-- un down côté provider).
--
-- Pattern Hystrix simplifié — état "circuit-breaker" en singleton :
--   closed     : flux nominal, on appelle Pipedrive
--   open       : on skip tous les appels, attente jusqu'à `next_attempt_at`
--   half_open  : on autorise UNE tentative ; succès → closed, fail → open+1
--
-- État stocké en table dédiée (pas en `algorithm_config`) car bouge à
-- chaque appel — éviter de polluer la config algorithm.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.pipedrive_circuit_state (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  state TEXT NOT NULL DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  consecutive_failures INT NOT NULL DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  last_error_message TEXT,
  total_opens INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pipedrive_circuit_state IS
  'Singleton (1 row id=true) : état du circuit-breaker Pipedrive. Mig 515 — Plan C C-4. Lecture/écriture exclusivement via lib/integrations/pipedrive-circuit.ts.';

-- Insert le singleton row si absent (idempotent)
INSERT INTO public.pipedrive_circuit_state (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- RLS : table technique service_role only (admin client bypass déjà OK,
-- mais on ajoute une policy explicite pour cohérence avec mig 509).
ALTER TABLE public.pipedrive_circuit_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pipedrive_circuit_state_service_role_all ON public.pipedrive_circuit_state;
CREATE POLICY pipedrive_circuit_state_service_role_all
  ON public.pipedrive_circuit_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
