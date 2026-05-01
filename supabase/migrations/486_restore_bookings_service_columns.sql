-- Migration 486 : Restore bookings.service_name + service_description + service_type
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Sentry/Vercel 2026-05-01 : cron `send-reminders-1h` retourne 500 toutes les
-- 10 min depuis ~24h. Diagnostic curl REST :
--   { "code":"42703",
--     "message":"column bookings.service_name does not exist" }
--
-- Diagnostic SQL prod (information_schema) confirme : 3 colonnes définies
-- dans la migration 001 (lignes 303-305) sont absentes en prod :
--   - service_name        TEXT  → utilisée par 10+ fichiers (crons, /api/reviews,
--                                  /api/client/avis, /api/artisan/stats,
--                                  bookings-service, admin/reservations, etc.)
--   - service_description TEXT  → utilisée par 10+ fichiers (booking pages,
--                                  Calendar, cancel/reschedule, /api/bookings/[id])
--   - service_type        TEXT  → utilisée par analytics-service
--
-- Aucune migration tracée n'a fait DROP COLUMN. Origine du drift : DROP manuel
-- via Supabase dashboard ou migration purgée — même pattern documenté dans la
-- mig 474 (rename profiles.phone → phone_e164).
--
-- DECISION
-- --------
-- Restaurer les 3 colonnes plutôt que patcher 15+ fichiers code. Mirroir exact
-- du fix mig 474 et mig 483. Reversible trivialement (DROP COLUMN si besoin).
--
-- IMPACT IMMÉDIAT
-- ---------------
-- - Cron send-reminders-1h sortira du 500-loop (toutes les 10 min)
-- - Cron send-reminders idem (probablement même bug, monitoring requis)
-- - /api/reviews + /api/client/avis + bookings pages reviendront à des SELECT OK
-- - Pages /booking/[id], /admin/reservations, Calendar artisan reverront le
--   service_description visible (actuellement NULL via fallback || 'Service')
--
-- IDEMPOTENT
-- ----------
-- - ADD COLUMN IF NOT EXISTS : no-op si la colonne existe déjà.
-- - Reload PostgREST schema en fin pour éviter cache stale ~10 min.

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_name        TEXT,
  ADD COLUMN IF NOT EXISTS service_description TEXT,
  ADD COLUMN IF NOT EXISTS service_type        TEXT;

-- Force PostgREST schema cache reload — sinon les requêtes des crons et /api
-- continueront à recevoir 42703 pendant ~10 min.
NOTIFY pgrst, 'reload schema';
