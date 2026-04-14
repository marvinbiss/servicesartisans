-- ============================================================================
-- Migration 437 — CEE Security Hardening V3
-- Date       : 2026-04-14
-- Scope      : Privilege minimisation cee_decrypt_iban + partner_id ownership
--              check dans le trigger cee_dossiers_check_status_transition
-- Dépend     : 433_cee_security_patches.sql (trigger), 434_cee_iban_rpc.sql
-- CWE        : CWE-269 (Improper Privilege Management), CWE-284 (Access Control)
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- SECTION 1 — cee_decrypt_iban : blindage REVOKE / GRANT (CWE-269)
--
-- Contexte : La migration 434 a créé cee_decrypt_iban comme SECURITY DEFINER
-- avec un GRANT authenticated. Ce grant est trop permissif : tout utilisateur
-- authentifié peut appeler la fonction même si le check JWT interne la bloque.
-- Le principe du moindre privilège exige que le GRANT reflète exactement
-- l'audience réelle : seul service_role doit pouvoir invoquer la fonction.
-- Le check admin JWT interne reste comme défense en profondeur.
-- ----------------------------------------------------------------------------

-- Révoque tout accès précédemment accordé (PUBLIC couvre anon + authenticated
-- implicitement, mais on est explicite pour chaque rôle Supabase).
REVOKE EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) FROM anon;

-- Accorde l'exécution uniquement à service_role (backend Node / cron).
-- service_role bypasse RLS mais est limité aux appels serveur non exposés.
GRANT EXECUTE ON FUNCTION public.cee_decrypt_iban(bytea, text) TO service_role;

COMMENT ON FUNCTION public.cee_decrypt_iban(bytea, text) IS
  'Déchiffre un IBAN chiffré (pgp_sym_decrypt). '
  'Requiert JWT role=admin (vérification interne). '
  'Callable par service_role uniquement (GRANT explicite 437). '
  'CWE-269 : moindre privilège — authenticated révoqué.';

-- ----------------------------------------------------------------------------
-- SECTION 2 — cee_dossiers trigger : vérification partner_id ownership (CWE-284)
--
-- Contexte : La migration 433 a remplacé le trigger de transition de statut
-- (H1) mais n'a pas ajouté de vérification que NEW.partner_id appartient bien
-- à l'utilisateur effectuant la transition (auth.uid()). Sans cette vérif,
-- un artisan authentifié pourrait potentiellement modifier un dossier dont
-- il ne détient pas le partner_id si une row policy est absente ou permissive.
--
-- Règle : si current_role = 'service_role', on bypasse (transitions légitimes
-- côté serveur : crons, webhooks Yousign). Pour tout autre rôle, on vérifie
-- que cee_artisan_partners.user_id = auth.uid() pour le partner_id du dossier.
--
-- Note : le trigger BEFORE UPDATE s'exécute avant la persistence. Si la
-- fonction lève une exception, la transaction est annulée — aucune donnée
-- n'est écrite.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cee_dossiers_check_status_transition()
RETURNS trigger
LANGUAGE plpgsql
-- Pas SECURITY DEFINER : doit s'exécuter avec les droits du caller pour que
-- current_role reflète le rôle réel (service_role vs authenticated).
AS $$
DECLARE
  allowed           boolean := false;
  caller_role       text;
  is_service_role   boolean;
BEGIN
  -- ------------------------------------------------------------------
  -- Ownership check : NEW.partner_id doit appartenir à auth.uid()
  -- sauf si l'appelant est service_role (backend, cron, webhook).
  --
  -- NOTE SÉCURITÉ (CWE-284) :
  --   `current_setting('role')` retourne le RÔLE POSTGRESQL DE SESSION,
  --   imposé par Supabase selon la clé utilisée pour la connexion :
  --     - service_role key (SUPABASE_SERVICE_ROLE_KEY) → role = 'service_role'
  --     - anon key + JWT authentifié → role = 'authenticated'
  --     - anon key seule → role = 'anon'
  --   Le bypass ne dépend donc PAS du claim `role` du JWT (qui n'est pas
  --   utilisé ici) mais bien de la connexion Postgres elle-même. Un JWT
  --   forgé avec role='service_role' ne bypass PAS ce trigger.
  -- ------------------------------------------------------------------
  caller_role     := current_setting('role', true);  -- 'true' = pas d'erreur si absent
  is_service_role := (caller_role = 'service_role');

  IF NOT is_service_role AND NEW.partner_id IS NOT NULL THEN
    -- Vérifie que le partner_id du dossier appartient à l'utilisateur courant.
    IF NOT EXISTS (
      SELECT 1
      FROM   public.cee_artisan_partners cap
      WHERE  cap.id      = NEW.partner_id
        AND  cap.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION
        'cee_dossiers: partner_id % does not belong to current user',
        NEW.partner_id
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  -- ------------------------------------------------------------------
  -- State-machine : transition de statut
  -- Aucun bypass admin — cf. H1 migration 433.
  -- ------------------------------------------------------------------
  IF OLD.status = NEW.status THEN
    RETURN NEW;  -- pas de changement de statut, pas de validation
  END IF;

  allowed := CASE OLD.status
    WHEN 'draft'                THEN NEW.status IN ('submitted_by_artisan', 'archived')
    WHEN 'submitted_by_artisan' THEN NEW.status IN ('qa_pending', 'qa_rejected', 'archived')
    WHEN 'qa_pending'           THEN NEW.status IN ('qa_approved', 'qa_rejected')
    WHEN 'qa_rejected'          THEN NEW.status IN ('submitted_by_artisan', 'archived')
    WHEN 'qa_approved'          THEN NEW.status IN ('deposited', 'archived')
    WHEN 'deposited'            THEN NEW.status IN ('validated_pncee', 'rejected_pncee')
    WHEN 'rejected_pncee'       THEN NEW.status IN ('archived')
    WHEN 'validated_pncee'      THEN NEW.status IN ('paid_client', 'archived')
    WHEN 'paid_client'          THEN NEW.status IN ('commission_due')
    WHEN 'commission_due'       THEN NEW.status IN ('commission_paid')
    WHEN 'commission_paid'      THEN NEW.status IN ('archived')
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION
      'Illegal cee_dossiers status transition: % -> %',
      OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.cee_dossiers_check_status_transition() IS
  'Trigger BEFORE UPDATE sur cee_dossiers. '
  'Deux gardes : '
  '(1) partner_id ownership — NEW.partner_id doit appartenir à auth.uid() '
  'sauf si current_role = service_role (CWE-284). '
  '(2) State-machine : transitions illégales rejetées sans exception admin '
  '(H1 migration 433 conservé).';

COMMIT;
