-- =====================================================================
-- 459 — Reconcile profiles.role and profiles.user_type
-- =====================================================================
--
-- Why:
--   profiles has TWO sources of truth for "is this user an artisan?":
--     1. role       (text)  — drives auth middleware + dashboard routing.
--     2. user_type  (text)  — drives public RLS (migration 379), admin
--                             list filters, MobileBottomNav redirect.
--
--   On approve-claim, only `role` was historically updated, so a share
--   of claimed artisans ended up with role='artisan' but user_type='client'.
--   Side effects observed:
--     - public RLS on profiles (379) hides their profile from anon visitors
--     - admin "user_type=artisan" filter misses them
--     - MobileBottomNav sends them to /espace-client instead of /espace-artisan
--
-- This migration is a one-shot reconciliation. Going forward, claims-service
-- writes both columns atomically (see src/lib/services/claims-service.ts).
--
-- Safe to rerun: update is idempotent (only rows where the two columns
-- disagree are touched).
-- =====================================================================

BEGIN;

-- Align user_type -> 'artisan' for every profile flagged role='artisan'
UPDATE profiles
SET
  user_type = 'artisan',
  updated_at = NOW()
WHERE role = 'artisan'
  AND (user_type IS NULL OR user_type <> 'artisan');

-- Align role -> 'artisan' for every profile flagged user_type='artisan'
-- but DO NOT overwrite protected admin roles (they own both identities).
UPDATE profiles
SET
  role = 'artisan',
  updated_at = NOW()
WHERE user_type = 'artisan'
  AND (role IS NULL OR role NOT IN ('artisan', 'super_admin', 'admin', 'moderator'));

COMMIT;

-- Quick audit query (run manually after):
--   SELECT role, user_type, COUNT(*) FROM profiles GROUP BY 1, 2;
--   Expected: no row with role='artisan' AND user_type <> 'artisan'
--             (except admin/moderator accounts, which legitimately have
--              user_type='client' unless they're also artisans themselves).
