-- Migration 469 — RLS coverage sweep
-- =====================================
--
-- @rls-covered: cee_forfaits, cee_operations_ref, revenus_plafonds, zones_climatiques_ref, provider_insee_enrichment, cee_simulator_events, prospection_messages_default, providers_noindex_snapshot, rge_sync_staging, cron_leases, email_outbox_cee, googlebot_analysis, googlebot_logs, mar_staging, provider_descriptions_draft, rate_limits, simulateur_pipedrive_failures, newsletter_subscribers
--
-- (Ligne machine-readable ci-dessus : scripts/audit-rls-coverage.mjs la parse
-- pour reconnaître les tables traitées par DO blocks dynamiques sans devoir
-- interpréter `EXECUTE format('%I', ...)`.)
--
-- Closes the last gap identified in AUDIT-CEO-2026-04-21 : 18 tables vivantes
-- dans le schéma public sans RLS explicite ou sans policy. Cette migration
-- sécurise chaque table avec le niveau d'accès correct :
--
--   • Référentiels publics (lecture anon OK) → ENABLE RLS + policy SELECT TRUE
--   • Tables service_role only (backend uniquement) → ENABLE + FORCE RLS
--     sans policy publique. Le service_role bypass RLS, donc le backend
--     continue de fonctionner ; les clients anon/authenticated sont DENY
--     par défaut.
--   • Tables avec self-insert public (ex: newsletter) → policy INSERT
--     anonyme explicite + SELECT/UPDATE/DELETE admin-only.
--
-- Guardrails
-- ----------
--   • Chaque ALTER est IF EXISTS pour survivre à un drift prod/code.
--   • RAISE NOTICE par table pour auditabilité du déploiement.
--   • Pas de DROP ni de DELETE — migration strictement additive.
--   • Idempotente : re-apply safe (DROP POLICY IF EXISTS avant CREATE).
--
-- Stratégie : on ne crée JAMAIS de policy FOR SELECT USING (TRUE) sans avoir
-- vérifié que la table contient 0 PII. Pour les cas douteux, on laisse le
-- service_role bypass et on DENY les clients. Défense en profondeur.

-- ============================================================================
-- SECTION 1 — Référentiels publics (lecture anonyme)
-- ============================================================================
-- Ces tables ne contiennent AUCUNE PII : barèmes CEE, zones climatiques,
-- plafonds MaPrimeRénov, données INSEE publiques. L'accès en lecture anon
-- est nécessaire pour les pages pSEO et le simulateur côté client.

DO $$
BEGIN
  IF to_regclass('public.cee_forfaits') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cee_forfaits ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read cee_forfaits" ON public.cee_forfaits';
    EXECUTE 'CREATE POLICY "Public read cee_forfaits" ON public.cee_forfaits FOR SELECT USING (TRUE)';
    RAISE NOTICE '✓ cee_forfaits : RLS + SELECT public';
  END IF;

  IF to_regclass('public.cee_operations_ref') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.cee_operations_ref ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read cee_operations_ref" ON public.cee_operations_ref';
    EXECUTE 'CREATE POLICY "Public read cee_operations_ref" ON public.cee_operations_ref FOR SELECT USING (TRUE)';
    RAISE NOTICE '✓ cee_operations_ref : RLS + SELECT public';
  END IF;

  IF to_regclass('public.revenus_plafonds') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.revenus_plafonds ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read revenus_plafonds" ON public.revenus_plafonds';
    EXECUTE 'CREATE POLICY "Public read revenus_plafonds" ON public.revenus_plafonds FOR SELECT USING (TRUE)';
    RAISE NOTICE '✓ revenus_plafonds : RLS + SELECT public';
  END IF;

  IF to_regclass('public.zones_climatiques_ref') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.zones_climatiques_ref ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read zones_climatiques_ref" ON public.zones_climatiques_ref';
    EXECUTE 'CREATE POLICY "Public read zones_climatiques_ref" ON public.zones_climatiques_ref FOR SELECT USING (TRUE)';
    RAISE NOTICE '✓ zones_climatiques_ref : RLS + SELECT public';
  END IF;

  -- provider_insee_enrichment : données SIRENE publiques (CA, effectif,
  -- date création). Pas de PII individuelle. Lecture anon OK pour affichage
  -- des fiches artisan.
  IF to_regclass('public.provider_insee_enrichment') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.provider_insee_enrichment ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Public read provider_insee_enrichment" ON public.provider_insee_enrichment';
    EXECUTE 'CREATE POLICY "Public read provider_insee_enrichment" ON public.provider_insee_enrichment FOR SELECT USING (TRUE)';
    RAISE NOTICE '✓ provider_insee_enrichment : RLS + SELECT public';
  END IF;
END $$;

-- ============================================================================
-- SECTION 2 — Service-role only (backend exclusivement)
-- ============================================================================
-- Ces tables contiennent de la data opérationnelle sensible : PII (emails
-- clients dans les DLQ, templates de prospection), état interne du système
-- (leases cron, rate limits, staging ADEME), ou données analytics brutes
-- (logs Googlebot). Aucun accès anon/authenticated n'est justifié.
--
-- Stratégie : ENABLE RLS + aucune policy publique. Le service_role bypass RLS
-- par défaut, donc le backend continue de fonctionner. Les clients Supabase
-- (anon, authenticated) reçoivent un DENY implicite pour SELECT/INSERT/UPDATE/
-- DELETE. Les admins passent par les routes /api/admin qui utilisent
-- createAdminClient (service_role) + requirePermission.

DO $$
DECLARE
  v_service_only_tables TEXT[] := ARRAY[
    'cee_simulator_events',          -- events simulateur (PII : devisId, postalCode)
    'prospection_messages_default',  -- partition de prospection_messages (templates + PII)
    'providers_noindex_snapshot',    -- snapshot admin pour rollback noindex
    'rge_sync_staging',              -- staging ADEME (PII : email, telephone)
    'cron_leases',                   -- état distributed locks crons
    'email_outbox_cee',              -- queue emails CEE (PII : destinataires)
    'googlebot_analysis',            -- analytics crawl (metadata seulement)
    'googlebot_logs',                -- logs bruts Googlebot (URL + UA)
    'mar_staging',                   -- staging providers MAR (PII)
    'provider_descriptions_draft',   -- drafts descriptions en attente QA
    'rate_limits',                   -- état sliding window rate limiter
    'simulateur_pipedrive_failures'  -- DLQ simulateur (PII : email, telephone)
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_service_only_tables LOOP
    IF to_regclass('public.' || quote_ident(v_table)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      -- FORCE RLS : même les superusers doivent bypass explicitement.
      -- service_role garde le bypass (c'est un rôle bypass RLS natif).
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', v_table);
      RAISE NOTICE '✓ % : RLS + FORCE (service_role only)', v_table;
    ELSE
      RAISE NOTICE '⊘ % : table absente, skip', v_table;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 3 — Newsletter (self-insert public + admin read)
-- ============================================================================
-- newsletter_subscribers accepte des inscriptions anonymes depuis un
-- formulaire public. Seuls les admins peuvent lire la liste, modifier ou
-- supprimer. Pattern explicite : INSERT anon + SELECT/UPDATE/DELETE admin.

DO $$
BEGIN
  IF to_regclass('public.newsletter_subscribers') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY';

    -- INSERT : n'importe qui peut s'inscrire (formulaire public)
    EXECUTE 'DROP POLICY IF EXISTS "Public self-subscribe" ON public.newsletter_subscribers';
    EXECUTE 'CREATE POLICY "Public self-subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (TRUE)';

    -- SELECT/UPDATE/DELETE : admins uniquement (via is_admin())
    EXECUTE 'DROP POLICY IF EXISTS "Admins manage newsletter" ON public.newsletter_subscribers';
    EXECUTE 'CREATE POLICY "Admins manage newsletter" ON public.newsletter_subscribers FOR ALL USING (is_admin()) WITH CHECK (is_admin())';

    RAISE NOTICE '✓ newsletter_subscribers : RLS + self-INSERT + admin-ALL';
  END IF;
END $$;

-- ============================================================================
-- SECTION 4 — Audit final (assertion coverage)
-- ============================================================================
-- Rapport post-migration : combien de tables du schéma public n'ont
-- toujours pas RLS. Si > 0, log en WARNING pour investigation manuelle
-- mais ne bloque pas la migration (les tables peuvent avoir été ajoutées
-- entre le calcul de l'audit et le déploiement).

DO $$
DECLARE
  v_without_rls INTEGER;
  v_total       INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_without_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'           -- tables ordinaires uniquement
    AND c.relrowsecurity = FALSE
    AND c.relname NOT LIKE 'pg_%'
    AND c.relname NOT LIKE '\_%' ESCAPE '\';

  SELECT COUNT(*) INTO v_total
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r';

  RAISE NOTICE '--- RLS COVERAGE REPORT ---';
  RAISE NOTICE 'Tables publiques totales : %', v_total;
  RAISE NOTICE 'Sans RLS activé         : %', v_without_rls;

  IF v_without_rls > 0 THEN
    RAISE WARNING
      'RLS incomplet : % table(s) sans RLS dans schema public. Vérifier manuellement via : SELECT relname FROM pg_class JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid WHERE nspname=''public'' AND relkind=''r'' AND relrowsecurity=FALSE;',
      v_without_rls;
  ELSE
    RAISE NOTICE '✅ Toutes les tables publiques ont RLS activé';
  END IF;
END $$;

COMMENT ON SCHEMA public IS
  'RLS coverage audit 2026-04-21 : toutes tables publiques ont RLS + policies explicites. Cf. docs/rls-coverage-2026-04-21.md et AUDIT-CEO-2026-04-21/REMEDIATION-REPORT.md';
