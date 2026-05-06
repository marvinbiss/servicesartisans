-- =============================================================================
-- 514_two_factor_cooldown.sql
-- Plan C — C-3 : 24h cooldown anti enroll/disable spam (P1 CVSS 5.4)
-- ServicesArtisans — 2026-05-05
-- =============================================================================
-- Audit V2 P1#5 : `twoFactorAuth.disable()` exige un code TOTP valide mais
-- aucun cooldown ne contraint la fréquence des changements. Un user peut
-- enable/disable en boucle, ce qui :
--   1. Spam les `security_logs` (DDoS table + log noise).
--   2. Brouille les pistes d'audit en cas d'intrusion (l'attaquant peut
--      désactiver puis réactiver pour masquer son passage).
--   3. Permet d'épuiser les `backup_codes` côté testing.
--
-- Fix : colonne `profiles.last_2fa_change_at` mise à jour à chaque
-- verifyAndEnable() ET chaque disable(). Le service refuse une nouvelle
-- transition si < 24h. Vrai admin (rotation perdue device) → demande au
-- support, qui passe par un script admin (RPC dédié — pas exposé en API).
--
-- Idempotent : ADD COLUMN IF NOT EXISTS.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_2fa_change_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.last_2fa_change_at IS
  'Dernière transition 2FA (enable ou disable). Utilisé par twoFactorAuth.* pour enforcer un cooldown 24h. Migration 514.';

-- Backfill rétroactif pour les users qui ont déjà 2FA actif mais last_2fa_change_at NULL.
-- On utilise verified_at de two_factor_auth comme meilleure approximation.
-- Note : ne crée PAS de cooldown rétroactif sur les users actuels (timestamp passé,
-- la condition 24h est déjà satisfaite). C'est l'effet voulu : on ne bloque que
-- les changements FUTURS rapprochés.
UPDATE public.profiles p
SET last_2fa_change_at = tfa.verified_at
FROM public.two_factor_auth tfa
WHERE tfa.user_id = p.id
  AND tfa.verified = true
  AND p.last_2fa_change_at IS NULL
  AND tfa.verified_at IS NOT NULL;
