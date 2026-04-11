-- =============================================================================
-- Migration 392: RPC de lookup email_suppressions (case-insensitive)
-- ServicesArtisans — 2026-04-11
-- =============================================================================
-- Contexte : la colonne `email_suppressions.email` stocke le texte brut mais
-- l'unique index est sur `lower(email)`. Le client PostgREST ne peut pas
-- exprimer `lower(email) = ANY($1)` via le query builder, donc la queue de
-- prospection (message-queue.ts) doit passer par une RPC pour bénéficier de
-- l'index et matcher case-insensitively.
--
-- Sans cette RPC, un webhook Resend qui stocke `User@Gmail.com` échappe au
-- filtre `.in('email', [lower(email)])` → on continue à écrire à un hard
-- bounce → réputation du domaine brûlée.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.find_suppressed_emails(p_emails TEXT[])
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(array_agg(DISTINCT lower(email)), ARRAY[]::TEXT[])
  FROM public.email_suppressions
  WHERE lower(email) = ANY (
    SELECT lower(e) FROM unnest(p_emails) AS e
  );
$$;

COMMENT ON FUNCTION public.find_suppressed_emails(TEXT[]) IS
  'Retourne les emails de `p_emails` présents dans email_suppressions (match case-insensitive via lower(email)). Utilisé par message-queue.ts pour filtrer les hard bounces avant enqueue.';

-- Accès : service_role uniquement (la fonction tourne en SECURITY DEFINER
-- donc l'ACL d'exécution est le seul contrôle).
REVOKE ALL ON FUNCTION public.find_suppressed_emails(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_suppressed_emails(TEXT[]) TO service_role;

COMMIT;
