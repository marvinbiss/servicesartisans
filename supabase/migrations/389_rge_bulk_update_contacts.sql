-- =============================================================================
-- Migration 389 — Enrichissement contacts ADEME dans rge_bulk_update_providers
-- =============================================================================
-- Etend la RPC de migration 385 pour aussi injecter telephone et email
-- depuis le dataset ADEME, UNIQUEMENT quand le provider n'a pas deja
-- de donnee verifiee (phone IS NULL ET claimed_at IS NULL).
--
-- Principe de non-ecrasement :
-- - Si le provider a un phone existant (Google Maps, Sirene, revendique) → on garde
-- - Si le provider a un email existant → on garde
-- - Si le provider est revendique (claimed_at NOT NULL) → on ne touche a rien
-- - Sinon → on ecrit le tel/email ADEME (source officielle, declare par l'artisan)
--
-- Le payload applicatif envoie `ademe_telephone` et `ademe_email` (nullable).
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
  IF payload IS NULL OR jsonb_typeof(payload) <> 'array' THEN
    RETURN 0;
  END IF;

  -- UPDATE atomique des colonnes rge_* (toujours)
  -- + phone/email conditionnels :
  --   phone  → seulement si NULL, non-revendique, ET phone pas deja pris par un autre provider
  --   email  → seulement si NULL et non-revendique
  UPDATE public.providers p
     SET rge_qualifications = upd.rge_qualifications,
         rge_valid_until    = upd.rge_valid_until::DATE,
         rge_organismes     = upd.rge_organismes,
         rge_last_synced_at = upd.rge_last_synced_at::TIMESTAMPTZ,
         rge_source_url     = upd.rge_source_url,
         phone = CASE
           WHEN p.phone IS NULL
                AND p.claimed_at IS NULL
                AND upd.ademe_telephone IS NOT NULL
                AND NOT EXISTS (
                  SELECT 1 FROM public.providers px
                  WHERE px.phone = upd.ademe_telephone AND px.id <> p.id
                )
           THEN upd.ademe_telephone
           ELSE p.phone
         END,
         email = CASE
           WHEN p.email IS NULL AND p.claimed_at IS NULL AND upd.ademe_email IS NOT NULL
           THEN upd.ademe_email
           ELSE p.email
         END
    FROM jsonb_to_recordset(payload) AS upd(
      id                 UUID,
      rge_qualifications JSONB,
      rge_valid_until    TEXT,
      rge_organismes     TEXT[],
      rge_last_synced_at TEXT,
      rge_source_url     TEXT,
      ademe_telephone    TEXT,
      ademe_email        TEXT
    )
   WHERE p.id = upd.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

COMMENT ON FUNCTION public.rge_bulk_update_providers(JSONB) IS
  'Bulk UPDATE atomique des colonnes rge_* + phone/email conditionnels (ADEME) sur providers. Phone ecrit seulement si pas de doublon (unique check). Email ecrit seulement si NULL et non-revendique. Migration 389 (2026-04-11).';
