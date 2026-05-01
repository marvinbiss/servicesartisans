-- Migration 488 : Create 18 tables référencées en code mais absentes en prod
-- =============================================================================
-- ROOT CAUSE
-- ----------
-- Audit `scripts/audit-schema-drift.mjs` (commit `d72747e1f`) a découvert
-- 18 tables référencées par `.from('table')` dans le code TS mais absentes
-- de la prod. Cause : migrations jamais committées OU committées-jamais-
-- appliquées OU DROP TABLE manuels via Supabase dashboard.
--
-- DECISION
-- --------
-- Stub schemas minimaux mais complets, dérivés des references code
-- (SELECT/INSERT/UPDATE) discovered via `scripts/__discover_cols.mjs`.
-- RLS activée + policy admin-only par défaut (le code utilise
-- `createAdminClient()` qui bypass RLS, donc safe).
-- Tous nullable sauf id PK + champs explicitement requis par code/RGPD.
--
-- IMPACT IMMÉDIAT
-- ---------------
-- - availability_slots : débloque tout le booking flow (9 routes API,
--   bookings-service, artisan-availability, calendar UI).
-- - user_preferences : préfs notifications email/push/SMS, langue, theme.
-- - user_reports : modération (admin/reports endpoints).
-- - newsletter_subscribers : abo newsletter (3 routes /api/newsletter).
-- - prospection_optouts + prospection_purge_log + prospection_contacts_archive :
--   pipeline RGPD prospection (cron purge-prospection, optout flow).
-- - admin_users + platform_settings : RBAC + config admin.
-- - barometre_rge_snapshots : pipeline baromètre RGE mensuel.
-- - gsc_daily_metrics + 5 tables seo_* : analytics SEO interne (admin
--   dashboards SEO + crons link-scores, orphan-check, seo-monitor).
-- - message_attachments + avatars : metadata pièces jointes chat + avatars.
--
-- IDEMPOTENT
-- ----------
-- - Idempotent : IF NOT EXISTS partout (CREATE + ENABLE RLS + policies).
-- - Pas de FK strictes (UUID nullable) pour éviter les blocages d'INSERT
--   en cas de référence orpheline. À durcir dans une mig séparée si requis.
-- - RLS ENABLE puis CREATE POLICY IF NOT EXISTS — Postgres 16+ requis
--   pour `IF NOT EXISTS` sur policies, on utilise pattern DROP/CREATE.
--
-- ROLLBACK
-- --------
-- DROP TABLE public.<table> CASCADE; pour chacune.

-- ----------------------------------------------------------------------------
-- 1. availability_slots — booking flow (CRITICAL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID NOT NULL,
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_availability_slots_artisan_date
  ON public.availability_slots(artisan_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date_avail
  ON public.availability_slots(date, is_available)
  WHERE is_available = TRUE;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS availability_slots_admin_all ON public.availability_slots;
CREATE POLICY availability_slots_admin_all ON public.availability_slots
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS availability_slots_artisan_self ON public.availability_slots;
CREATE POLICY availability_slots_artisan_self ON public.availability_slots
  FOR ALL USING (artisan_id = auth.uid()) WITH CHECK (artisan_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 2. admin_users — RBAC admin (stub minimal)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_users_service_role ON public.admin_users;
CREATE POLICY admin_users_service_role ON public.admin_users
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 3. platform_settings — config key/value
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by  UUID,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS platform_settings_service_role ON public.platform_settings;
CREATE POLICY platform_settings_service_role ON public.platform_settings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 4. user_preferences — préfs notifications/UI
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL UNIQUE,
  language                    TEXT DEFAULT 'fr',
  currency                    TEXT DEFAULT 'EUR',
  timezone                    TEXT DEFAULT 'Europe/Paris',
  theme                       TEXT DEFAULT 'light',
  email_booking_confirmation  BOOLEAN DEFAULT TRUE,
  email_booking_reminder      BOOLEAN DEFAULT TRUE,
  email_marketing             BOOLEAN DEFAULT FALSE,
  email_newsletter            BOOLEAN DEFAULT FALSE,
  push_enabled                BOOLEAN DEFAULT FALSE,
  push_booking_updates        BOOLEAN DEFAULT TRUE,
  push_messages               BOOLEAN DEFAULT TRUE,
  push_promotions             BOOLEAN DEFAULT FALSE,
  sms_booking_reminder        BOOLEAN DEFAULT FALSE,
  sms_marketing               BOOLEAN DEFAULT FALSE,
  profile_public              BOOLEAN DEFAULT FALSE,
  allow_reviews               BOOLEAN DEFAULT TRUE,
  show_online_status          BOOLEAN DEFAULT FALSE,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON public.user_preferences(user_id);
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_preferences_self ON public.user_preferences;
CREATE POLICY user_preferences_self ON public.user_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS user_preferences_service_role ON public.user_preferences;
CREATE POLICY user_preferences_service_role ON public.user_preferences
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 5. user_reports — modération signalements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID,
  target_type   TEXT NOT NULL,
  target_id     UUID,
  reason        TEXT,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  resolution    TEXT,
  reviewed_by   UUID,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_target ON public.user_reports(target_type, target_id);
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_reports_service_role ON public.user_reports;
CREATE POLICY user_reports_service_role ON public.user_reports
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS user_reports_reporter_insert ON public.user_reports;
CREATE POLICY user_reports_reporter_insert ON public.user_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. avatars — metadata avatars uploadés
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.avatars (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  storage_path  TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_avatars_user ON public.avatars(user_id);
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS avatars_self ON public.avatars;
CREATE POLICY avatars_self ON public.avatars
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS avatars_service_role ON public.avatars;
CREATE POLICY avatars_service_role ON public.avatars
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 7. newsletter_subscribers — abos newsletter
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  subscribed_at     TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at   TIMESTAMPTZ
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS newsletter_subscribers_service_role ON public.newsletter_subscribers;
CREATE POLICY newsletter_subscribers_service_role ON public.newsletter_subscribers
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 8. prospection_optouts — opt-out RGPD prospection
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospection_optouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID,
  email         TEXT,
  ip_hash       TEXT,
  reason        TEXT,
  source        TEXT,
  token_used    TEXT,
  user_agent    TEXT,
  optout_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prospection_optouts_email ON public.prospection_optouts(email);
ALTER TABLE public.prospection_optouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prospection_optouts_service_role ON public.prospection_optouts;
CREATE POLICY prospection_optouts_service_role ON public.prospection_optouts
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 9. prospection_purge_log — log des purges RGPD
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospection_purge_log (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contacts_hard_deleted       INTEGER DEFAULT 0,
  contacts_soft_deleted       INTEGER DEFAULT 0,
  dry_run                     BOOLEAN DEFAULT FALSE,
  duration_ms                 INTEGER,
  error_message               TEXT,
  oldest_activity_cutoff      TIMESTAMPTZ,
  purged_at                   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.prospection_purge_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prospection_purge_log_service_role ON public.prospection_purge_log;
CREATE POLICY prospection_purge_log_service_role ON public.prospection_purge_log
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 10. prospection_contacts_archive — snapshots contacts purgés
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospection_contacts_archive (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data          JSONB NOT NULL,
  archived_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.prospection_contacts_archive ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prospection_contacts_archive_service_role ON public.prospection_contacts_archive;
CREATE POLICY prospection_contacts_archive_service_role ON public.prospection_contacts_archive
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 11. barometre_rge_snapshots — baromètre mensuel RGE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.barometre_rge_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  yearmonth     TEXT NOT NULL UNIQUE,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.barometre_rge_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS barometre_rge_snapshots_public_read ON public.barometre_rge_snapshots;
CREATE POLICY barometre_rge_snapshots_public_read ON public.barometre_rge_snapshots
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS barometre_rge_snapshots_service_role ON public.barometre_rge_snapshots;
CREATE POLICY barometre_rge_snapshots_service_role ON public.barometre_rge_snapshots
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 12. gsc_daily_metrics — Google Search Console daily metrics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gsc_daily_metrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date          DATE NOT NULL,
  page_path     TEXT NOT NULL,
  query         TEXT NOT NULL,
  clicks        INTEGER DEFAULT 0,
  impressions   INTEGER DEFAULT 0,
  ctr           NUMERIC,
  position      NUMERIC,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT gsc_daily_metrics_unique UNIQUE (date, page_path, query)
);
CREATE INDEX IF NOT EXISTS idx_gsc_daily_metrics_date ON public.gsc_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_gsc_daily_metrics_page ON public.gsc_daily_metrics(page_path);
ALTER TABLE public.gsc_daily_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS gsc_daily_metrics_service_role ON public.gsc_daily_metrics;
CREATE POLICY gsc_daily_metrics_service_role ON public.gsc_daily_metrics
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 13. seo_cannibalization_pairs — paires cannibalisées
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_cannibalization_pairs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_a              TEXT NOT NULL,
  page_b              TEXT NOT NULL,
  query               TEXT NOT NULL,
  avg_position_a      NUMERIC,
  avg_position_b      NUMERIC,
  total_impressions   INTEGER,
  status              TEXT DEFAULT 'detected'
                      CHECK (status IN ('detected', 'resolved', 'ignored')),
  detected_at         TIMESTAMPTZ DEFAULT NOW(),
  resolution          TEXT,
  resolved_at         TIMESTAMPTZ
);
ALTER TABLE public.seo_cannibalization_pairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_cannibalization_pairs_service_role ON public.seo_cannibalization_pairs;
CREATE POLICY seo_cannibalization_pairs_service_role ON public.seo_cannibalization_pairs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 14. seo_ctr_crisis — pages avec CTR drop critique
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_ctr_crisis (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path           TEXT NOT NULL,
  query               TEXT NOT NULL,
  ctr_percent         NUMERIC,
  total_clicks        INTEGER,
  total_impressions   INTEGER,
  avg_position        NUMERIC,
  detected_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_ctr_crisis_page ON public.seo_ctr_crisis(page_path);
ALTER TABLE public.seo_ctr_crisis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_ctr_crisis_service_role ON public.seo_ctr_crisis;
CREATE POLICY seo_ctr_crisis_service_role ON public.seo_ctr_crisis
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 15. seo_page_lifecycle — cycle de vie page indexée
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_page_lifecycle (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path           TEXT NOT NULL UNIQUE,
  first_crawled_at    TIMESTAMPTZ,
  first_indexed_at    TIMESTAMPTZ,
  last_seen_at        TIMESTAMPTZ,
  status              TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.seo_page_lifecycle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_page_lifecycle_service_role ON public.seo_page_lifecycle;
CREATE POLICY seo_page_lifecycle_service_role ON public.seo_page_lifecycle
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 16. seo_striking_distance — opportunités rank 11-30
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_striking_distance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path           TEXT NOT NULL,
  query               TEXT NOT NULL,
  avg_position        NUMERIC,
  total_clicks        INTEGER,
  total_impressions   INTEGER,
  ctr_percent         NUMERIC,
  detected_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_striking_distance_page ON public.seo_striking_distance(page_path);
ALTER TABLE public.seo_striking_distance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_striking_distance_service_role ON public.seo_striking_distance;
CREATE POLICY seo_striking_distance_service_role ON public.seo_striking_distance
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 17. seo_page_scores — scores liens internes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_page_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path             TEXT NOT NULL UNIQUE,
  page_type             TEXT,
  link_score            NUMERIC,
  internal_links_in     INTEGER DEFAULT 0,
  internal_links_out    INTEGER DEFAULT 0,
  is_indexed            BOOLEAN,
  is_orphan             BOOLEAN,
  source_run_id         UUID,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_page_scores_orphan ON public.seo_page_scores(is_orphan)
  WHERE is_orphan = TRUE;
ALTER TABLE public.seo_page_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS seo_page_scores_service_role ON public.seo_page_scores;
CREATE POLICY seo_page_scores_service_role ON public.seo_page_scores
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- 18. message_attachments — pièces jointes chat
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id      UUID NOT NULL,
  file_url        TEXT NOT NULL,
  file_name       TEXT,
  file_size       BIGINT,
  mime_type       TEXT,
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments(message_id);
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_attachments_service_role ON public.message_attachments;
CREATE POLICY message_attachments_service_role ON public.message_attachments
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- Reload PostgREST schema cache
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
