-- Migration 418 — Index pour getRgeLastSyncDate()
--
-- La requête ORDER BY rge_last_synced_at DESC LIMIT 1 fait un sequential scan
-- sur ~300K providers pendant le build Vercel (14K pages en parallèle).
-- Résultat : statement timeout en cascade (code 57014).
--
-- Cet index partiel permet un index-only backward scan instantané.

CREATE INDEX IF NOT EXISTS idx_providers_rge_last_synced
  ON providers (rge_last_synced_at DESC)
  WHERE rge_last_synced_at IS NOT NULL;
