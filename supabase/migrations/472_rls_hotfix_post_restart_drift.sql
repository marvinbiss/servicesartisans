-- Migration 472 — RLS HOTFIX post restart drift (Supabase linter CRITICAL 2026-04-24)
-- ============================================================================
-- Contexte : "Project restart failed Feb 13, 2026" a laisse la prod sans RLS
-- sur ~26 tables publiques + 5 vues SECURITY DEFINER + 3 tables PII. La
-- migration 469 (RLS coverage sweep) a soit jamais ete appliquee en prod,
-- soit ete rollback. Cette migration reimpose l'etat cible de facon atomique,
-- idempotente, fail-safe (DENY par defaut).
--
-- Principes :
--   • BEGIN/COMMIT : tout-ou-rien.
--   • ENABLE + FORCE RLS : empeche table_owner de bypass. Seul service_role
--     bypass (backend via createAdminClient continue de fonctionner).
--   • DROP POLICY IF EXISTS + CREATE : idempotent.
--   • REVOKE column-level sur PII : defense en profondeur meme si RLS drift.
--   • Verify final : THROW si residuel.
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECTION A — Referentiels publics (lecture anon OK, 0 PII)
-- ============================================================================

DO $secA$
DECLARE
  v_public_refs TEXT[] := ARRAY[
    'cee_forfaits',
    'cee_operations_ref',
    'canonical_urls',
    'coverage_zones',
    'roles',
    'schema_markup',
    'seo_pages',
    'sitemaps',
    'content_freshness',
    'data_sources',
    'indexation_status',
    'internal_links'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_public_refs LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      EXECUTE format('DROP POLICY IF EXISTS "Public read %I" ON public.%I', v_table, v_table);
      EXECUTE format('CREATE POLICY "Public read %I" ON public.%I FOR SELECT TO anon, authenticated USING (TRUE)', v_table, v_table);
      RAISE NOTICE 'OK % : RLS ON + SELECT public', v_table;
    ELSE
      RAISE NOTICE 'SKIP % : table absente', v_table;
    END IF;
  END LOOP;
END
$secA$;

-- ============================================================================
-- SECTION B — Service-role only (DENY anon/authenticated par defaut)
-- ============================================================================

DO $secB$
DECLARE
  v_service_only TEXT[] := ARRAY[
    'cee_simulator_events',
    'commissions',
    'client_booking_history',
    'devis_requests',
    'gift_card_transactions',
    'prospection_messages_default',
    'provider_stats',
    'search_logs',
    'user_behaviors'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_service_only LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', v_table);
      RAISE NOTICE 'OK % : RLS + FORCE (service_role only)', v_table;
    ELSE
      RAISE NOTICE 'SKIP % : table absente', v_table;
    END IF;
  END LOOP;
END
$secB$;

-- ============================================================================
-- SECTION C — audit_logs (admin read + admin insert)
-- ============================================================================

DO $secC_audit$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS audit_logs_admin_read ON public.audit_logs';
    EXECUTE $pol$
      CREATE POLICY audit_logs_admin_read ON public.audit_logs
        FOR SELECT TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS audit_logs_admin_insert ON public.audit_logs';
    EXECUTE $pol$
      CREATE POLICY audit_logs_admin_insert ON public.audit_logs
        FOR INSERT TO authenticated
        WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    RAISE NOTICE 'OK audit_logs : RLS + FORCE + admin read/insert';
  END IF;
END
$secC_audit$;

-- ============================================================================
-- SECTION D — artisan_slot_stats (owner ou admin read)
-- ============================================================================

DO $secD$
BEGIN
  IF to_regclass('public.artisan_slot_stats') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.artisan_slot_stats ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.artisan_slot_stats FORCE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS artisan_slot_stats_owner_read ON public.artisan_slot_stats';
    EXECUTE $pol$
      CREATE POLICY artisan_slot_stats_owner_read ON public.artisan_slot_stats
        FOR SELECT TO authenticated
        USING (
          artisan_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
        )
    $pol$;

    RAISE NOTICE 'OK artisan_slot_stats : RLS + FORCE + owner/admin SELECT';
  END IF;
END
$secD$;

-- ============================================================================
-- SECTION E — answers + questions (Q&A publique published-only, PII protect)
-- ============================================================================

DO $secE_answers$
BEGIN
  IF to_regclass('public.answers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.answers FORCE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS answers_public_read_published ON public.answers';
    EXECUTE $pol$
      CREATE POLICY answers_public_read_published ON public.answers
        FOR SELECT TO anon, authenticated
        USING (status = 'published')
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS answers_anon_submit ON public.answers';
    EXECUTE $pol$
      CREATE POLICY answers_anon_submit ON public.answers
        FOR INSERT TO anon, authenticated
        WITH CHECK (
          (status IS NULL OR status = 'pending')
          AND is_accepted IS NOT TRUE
          AND moderated_at IS NULL
        )
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS answers_admin_update ON public.answers';
    EXECUTE $pol$
      CREATE POLICY answers_admin_update ON public.answers
        FOR UPDATE TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
        WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS answers_admin_delete ON public.answers';
    EXECUTE $pol$
      CREATE POLICY answers_admin_delete ON public.answers
        FOR DELETE TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    -- PII : revoke column-level sur author_email pour anon/authenticated.
    -- service_role conserve son acces complet (bypass natif).
    EXECUTE 'REVOKE SELECT (author_email) ON public.answers FROM anon, authenticated';

    RAISE NOTICE 'OK answers : RLS + FORCE + published-only read + pending-only insert + admin write + REVOKE author_email';
  END IF;
END
$secE_answers$;

DO $secE_questions$
BEGIN
  IF to_regclass('public.questions') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.questions FORCE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS questions_public_read_published ON public.questions';
    EXECUTE $pol$
      CREATE POLICY questions_public_read_published ON public.questions
        FOR SELECT TO anon, authenticated
        USING (status = 'published' OR status IS NULL)
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS questions_anon_submit ON public.questions';
    EXECUTE $pol$
      CREATE POLICY questions_anon_submit ON public.questions
        FOR INSERT TO anon, authenticated
        WITH CHECK (status IS NULL OR status = 'pending')
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS questions_admin_write ON public.questions';
    EXECUTE $pol$
      CREATE POLICY questions_admin_write ON public.questions
        FOR UPDATE TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
        WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS questions_admin_delete ON public.questions';
    EXECUTE $pol$
      CREATE POLICY questions_admin_delete ON public.questions
        FOR DELETE TO authenticated
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE))
    $pol$;

    -- Defense en profondeur : si colonnes PII existent, revoke column-level.
    -- REVOKE IF EXISTS n'existe pas en SQL → on enveloppe chaque REVOKE par
    -- un bloc plpgsql qui test la colonne avant.
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'author_email'
    ) THEN
      EXECUTE 'REVOKE SELECT (author_email) ON public.questions FROM anon, authenticated';
    END IF;

    RAISE NOTICE 'OK questions : RLS + FORCE + published read + pending insert + admin write';
  END IF;
END
$secE_questions$;

-- ============================================================================
-- SECTION F — Vues SECURITY DEFINER → SECURITY INVOKER (PG 15+)
-- ============================================================================
-- security_invoker = true : la vue utilise les privileges du caller, pas
-- du createur. Combine avec RLS sur les tables sous-jacentes, ca force la
-- verification RLS au SELECT. Necessite PG 15+ (Supabase >= 2026).

DO $secF$
DECLARE
  v_views TEXT[] := ARRAY[
    'v_admin_dashboard',
    'v_public_stats',
    'lead_exclusivity_audit',
    'v_service_location_pages',
    'cee_operations_ref_v'
  ];
  v_view TEXT;
BEGIN
  FOREACH v_view IN ARRAY v_views LOOP
    IF to_regclass('public.' || quote_ident(v_view)) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', v_view);
      RAISE NOTICE 'OK % : security_invoker = true', v_view;
    ELSE
      RAISE NOTICE 'SKIP % : view absente', v_view;
    END IF;
  END LOOP;
END
$secF$;

-- ============================================================================
-- SECTION G — REVOKE column-level sur colonnes PII exposees
-- ============================================================================
-- Supabase linter flagge 3 tables avec "Sensitive Columns Exposed".
-- Defense en profondeur meme si RLS deny les anon : si une policy est
-- ajoutee par erreur plus tard, les colonnes PII restent protegees.

DO $secG$
DECLARE
  v_revokes TEXT[][] := ARRAY[
    ARRAY['cee_simulator_events', 'email'],
    ARRAY['cee_simulator_events', 'phone'],
    ARRAY['cee_simulator_events', 'postal_code'],
    ARRAY['cee_simulator_events', 'ip_address'],
    ARRAY['search_logs', 'query'],
    ARRAY['search_logs', 'ip_address'],
    ARRAY['search_logs', 'user_agent'],
    ARRAY['user_behaviors', 'user_id'],
    ARRAY['user_behaviors', 'ip_address'],
    ARRAY['user_behaviors', 'session_id']
  ];
  i INT;
  v_table TEXT;
  v_col TEXT;
BEGIN
  FOR i IN 1..array_length(v_revokes, 1) LOOP
    v_table := v_revokes[i][1];
    v_col   := v_revokes[i][2];
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = v_table
           AND column_name = v_col
       )
    THEN
      EXECUTE format('REVOKE SELECT (%I) ON public.%I FROM anon, authenticated',
                     v_col, v_table);
      RAISE NOTICE 'OK REVOKE % .%  anon/authenticated', v_table, v_col;
    ELSE
      RAISE NOTICE 'SKIP %.% (table ou colonne absente)', v_table, v_col;
    END IF;
  END LOOP;
END
$secG$;

-- ============================================================================
-- SECTION H — Verify (fail-loud si residuel)
-- ============================================================================

DO $verify$
DECLARE
  v_missing_rls TEXT := '';
  v_required   TEXT[] := ARRAY[
    'audit_logs', 'answers', 'artisan_slot_stats', 'canonical_urls',
    'cee_forfaits', 'cee_operations_ref', 'cee_simulator_events',
    'commissions', 'client_booking_history', 'coverage_zones',
    'content_freshness', 'data_sources', 'devis_requests',
    'gift_card_transactions', 'indexation_status', 'internal_links',
    'roles', 'schema_markup', 'search_logs', 'seo_pages',
    'prospection_messages_default', 'provider_stats', 'questions',
    'sitemaps', 'user_behaviors'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_required LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = v_table
          AND c.relrowsecurity = TRUE
      ) THEN
        v_missing_rls := v_missing_rls || v_table || ' ';
      END IF;
    END IF;
  END LOOP;

  IF v_missing_rls <> '' THEN
    RAISE EXCEPTION 'VERIFY FAILED — RLS toujours desactive sur : %', v_missing_rls;
  END IF;
  RAISE NOTICE 'VERIFY OK — RLS actif sur toutes les tables ciblees';
END
$verify$;

COMMIT;

COMMENT ON SCHEMA public IS
  'RLS hotfix 2026-04-24 (migration 472) : reimpose RLS + FORCE sur 26 tables apres drift post restart Feb 13. 5 vues passees en security_invoker. REVOKE column-level sur PII (cee_simulator_events, search_logs, user_behaviors). Cf. memory servicesartisans-rls-hotfix-2026-04-24.';
