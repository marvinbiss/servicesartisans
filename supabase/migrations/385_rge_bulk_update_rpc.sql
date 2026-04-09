-- =============================================================================
-- Migration 385 — RPC rge_bulk_update_providers (UPDATE atomique par batch)
-- =============================================================================
-- Remplace la boucle per-provider `for (const p of providers) { supabase.update }`
-- (cf. audit RGE/CEE/ADEME 2026-04-10, Bug P0 #2 "Updates non-atomiques") par
-- un UPDATE unique côté DB via `jsonb_to_recordset`.
--
-- Problème résolu
-- ---------------
-- Avant : 60k providers × 1 requête UPDATE chacun. Si un UPDATE échoue
-- mid-batch (timeout 57014, network blip), certains providers se retrouvent
-- avec `rge_last_synced_at = NOW` mais `rge_qualifications = ancienne valeur`
-- → désynchro silencieuse, impossible à détecter sauf audit manuel.
--
-- Après : 1 RPC = 1 transaction PostgreSQL. Tout passe ou tout rollback.
-- Le code applicatif (`src/lib/rge/sync.ts`) appelle la RPC par batch de 500
-- (meilleur compromis throughput / payload size PostgREST).
--
-- Performance
-- -----------
-- Avant : ~60k round-trips × ~50ms = ~50 min
-- Après : ~120 RPC calls × ~200ms = ~24s (~125x plus rapide)
--
-- Atomicité : contrat applicatif
-- ------------------------------
-- Si la RPC échoue, le caller ne doit PAS mettre à jour `rge_last_synced_at`
-- séparément. La RPC est all-or-nothing : soit tous les champs sont updatés
-- ensemble (qualifs + valid_until + organismes + last_synced_at + source_url),
-- soit aucun. Pas de mix old/new possible.
--
-- Sécurité : SECURITY DEFINER + GRANT service_role only.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.rge_bulk_update_providers(payload JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  -- Garde-fou : payload vide ou non-array → 0 lignes, pas d'erreur.
  IF payload IS NULL OR jsonb_typeof(payload) <> 'array' THEN
    RETURN 0;
  END IF;

  -- UPDATE atomique. Tout passe dans une seule transaction implicite.
  -- Cast explicites nécessaires car jsonb_to_recordset renvoie les types déclarés.
  UPDATE public.providers p
     SET rge_qualifications = upd.rge_qualifications,
         rge_valid_until    = upd.rge_valid_until::DATE,
         rge_organismes     = upd.rge_organismes,
         rge_last_synced_at = upd.rge_last_synced_at::TIMESTAMPTZ,
         rge_source_url     = upd.rge_source_url
    FROM jsonb_to_recordset(payload) AS upd(
      id                 UUID,
      rge_qualifications JSONB,
      rge_valid_until    TEXT,
      rge_organismes     TEXT[],
      rge_last_synced_at TEXT,
      rge_source_url     TEXT
    )
   WHERE p.id = upd.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.rge_bulk_update_providers(JSONB) IS
  'Bulk UPDATE atomique des colonnes rge_* sur providers à partir d''un payload JSONB (array de {id, rge_qualifications, rge_valid_until, rge_organismes, rge_last_synced_at, rge_source_url}). Tout passe ou tout rollback — plus de désynchro last_synced_at/qualifications. Appelée par src/lib/rge/sync.ts matchAndUpdate() par batch de 500. Migration 385 (2026-04-10).';

REVOKE ALL ON FUNCTION public.rge_bulk_update_providers(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rge_bulk_update_providers(JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.rge_bulk_update_providers(JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rge_bulk_update_providers(JSONB) TO service_role;
