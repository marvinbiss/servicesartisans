-- ============================================================================
-- Migration 434 — CEE IBAN RPC (encrypt/decrypt/store atomique)
-- Scope     : SECURITY DEFINER functions pour chiffrement IBAN artisan partner
-- Prérequis : 430_cee_artisan_partners.sql (cee_artisan_partners.iban_encrypted bytea)
-- Sécurité  : search_path verrouillé, pgcrypto, admin JWT check sur decrypt
-- Ref       : docs/cee/HANDOFF_PR2_2026-04-14.md §🚨
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- cee_encrypt_iban : chiffrement symétrique IBAN (usage service_role uniquement)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_encrypt_iban(p_iban text, p_key text)
RETURNS bytea
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_iban IS NULL OR length(regexp_replace(p_iban, '\s', '', 'g')) < 14 THEN
    RAISE EXCEPTION 'Invalid IBAN' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN pgp_sym_encrypt(p_iban, p_key);
END;
$$;

REVOKE ALL ON FUNCTION public.cee_encrypt_iban(text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_encrypt_iban(text, text) TO service_role;

COMMENT ON FUNCTION public.cee_encrypt_iban(text, text)
  IS 'Chiffre un IBAN avec pgp_sym_encrypt. service_role uniquement.';

-- ----------------------------------------------------------------------------
-- cee_decrypt_iban : déchiffrement (admin JWT required)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_decrypt_iban(p_encrypted bytea, p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (auth.jwt() ->> 'role') <> 'admin' THEN
    RAISE EXCEPTION 'admin only' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_encrypted IS NULL THEN
    RAISE EXCEPTION 'Invalid encrypted payload' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  RETURN pgp_sym_decrypt(p_encrypted, p_key);
END;
$$;

REVOKE ALL ON FUNCTION public.cee_decrypt_iban(bytea, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) TO service_role, authenticated;

COMMENT ON FUNCTION public.cee_decrypt_iban(bytea, text)
  IS 'Déchiffre un IBAN chiffré. Requiert JWT role=admin.';

-- ----------------------------------------------------------------------------
-- cee_store_partner_iban : écriture atomique (recommandé vs encrypt+UPDATE côté Node)
-- Vérifie ownership via auth.uid() = cee_artisan_partners.user_id
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cee_store_partner_iban(
  p_partner_id uuid,
  p_iban       text,
  p_bic        text,
  p_titulaire  text,
  p_key        text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_iban_clean text;
  v_last4      char(4);
BEGIN
  -- Validation entrée
  IF p_partner_id IS NULL THEN
    RAISE EXCEPTION 'partner_id required' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  v_iban_clean := regexp_replace(COALESCE(p_iban, ''), '\s', '', 'g');
  IF length(v_iban_clean) < 14 THEN
    RAISE EXCEPTION 'Invalid IBAN' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_bic IS NULL OR length(p_bic) NOT IN (8, 11) THEN
    RAISE EXCEPTION 'Invalid BIC' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_titulaire IS NULL OR length(trim(p_titulaire)) = 0 THEN
    RAISE EXCEPTION 'Titulaire required' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_key IS NULL OR length(p_key) < 16 THEN
    RAISE EXCEPTION 'Invalid key' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  -- Ownership check
  IF NOT EXISTS (
    SELECT 1 FROM public.cee_artisan_partners
    WHERE id = p_partner_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not owner' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_last4 := substring(v_iban_clean from '.{4}$');

  UPDATE public.cee_artisan_partners
  SET iban_encrypted   = pgp_sym_encrypt(v_iban_clean, p_key),
      iban_last4       = v_last4,
      bic              = upper(p_bic),
      titulaire_compte = p_titulaire,
      updated_at       = now()
  WHERE id = p_partner_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text) TO authenticated;

COMMENT ON FUNCTION public.cee_store_partner_iban(uuid, text, text, text, text)
  IS 'Store atomique IBAN chiffré sur cee_artisan_partners. Check ownership via auth.uid().';

COMMIT;
